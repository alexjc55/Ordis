#!/bin/bash

# Автоматическая установка eDAHouse на Debian 12 с FastPanel
# Автор: AI Assistant
# Дата: 2025-07-02

set -e  # Остановить при первой ошибке

echo "🚀 Установка eDAHouse на Debian 12 с FastPanel"
echo "================================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Без цвета

# Функции для цветного вывода
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Проверка что скрипт запущен под root или с sudo
if [[ $EUID -eq 0 ]]; then
   log_warning "Скрипт запущен под root. Рекомендуется запускать под обычным пользователем с sudo."
fi

# Конфигурация
PROJECT_DIR="/var/www/edahouse"
DOMAIN="edahouse.ordis.co.il"
DB_NAME="edahouse_ord"
DB_USER="edahouse_ord"
DB_PASS="33V0R1N5qi81paiA"
APP_PORT="3000"
NODE_VERSION="18"

log_info "Конфигурация:"
echo "  📁 Папка проекта: $PROJECT_DIR"
echo "  🌐 Домен: $DOMAIN"
echo "  💾 База данных: $DB_NAME"
echo "  🔌 Порт приложения: $APP_PORT"
echo ""

# Функция проверки установлен ли пакет
is_installed() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Обновление системы
log_info "Обновление системы..."
sudo apt update && sudo apt upgrade -y
log_success "Система обновлена"

# 2. Установка базовых пакетов (если нужно)
log_info "Проверка базовых пакетов..."
PACKAGES="curl wget git nano htop unzip build-essential"
for package in $PACKAGES; do
    if ! dpkg -l | grep -q "^ii  $package "; then
        log_info "Установка $package..."
        sudo apt install -y $package
    fi
done
log_success "Базовые пакеты готовы"

# 3. Проверка Node.js
log_info "Проверка Node.js..."
if is_installed node; then
    NODE_VER=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" -ge 16 ]; then
        log_success "Node.js уже установлен: $(node --version)"
    else
        log_warning "Node.js версии $NODE_VER устарел, обновляем..."
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
else
    log_info "Установка Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
log_success "Node.js готов: $(node --version)"

# 4. Проверка PM2
log_info "Проверка PM2..."
if is_installed pm2; then
    log_success "PM2 уже установлен: $(pm2 --version)"
else
    log_info "Установка PM2..."
    sudo npm install -g pm2
fi
log_success "PM2 готов"

# 5. Создание пользователя для приложения (если нужно)
APP_USER="www-data"
log_info "Настройка пользователя приложения: $APP_USER"

# 6. Создание директории проекта
log_info "Создание директории проекта..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR
log_success "Директория $PROJECT_DIR создана"

# 7. Клонирование проекта
log_info "Клонирование проекта из GitHub..."
if [ -d "$PROJECT_DIR/.git" ]; then
    log_warning "Проект уже существует, обновляем..."
    cd $PROJECT_DIR
    git pull origin main
else
    git clone https://github.com/alexjc55/Ordis.git $PROJECT_DIR
    cd $PROJECT_DIR
fi
log_success "Проект загружен"

# 8. Установка зависимостей
log_info "Установка npm зависимостей..."
npm install
log_success "Зависимости установлены"

# 9. Создание .env файла
log_info "Создание .env файла..."
cat > .env << EOF
# Окружение
NODE_ENV=production
PORT=$APP_PORT
HOST=0.0.0.0

# База данных
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
PGHOST=localhost
PGPORT=5432
PGDATABASE=$DB_NAME
PGUSER=$DB_USER
PGPASSWORD=$DB_PASS

# Безопасность
SESSION_SECRET=WAVl58TU5MAzQkQa6w8YTsuFYyyCwIl24D2j5BNsX4reNv1iYPdNQHtog2Y0CYQ39U1HGYYG1cNQhLIGfxPVNg==

# Настройки приложения
ENABLE_REGISTRATION=true
ENABLE_GUEST_ORDERS=true
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_ORIGINS=https://$DOMAIN
STORE_NAME=edahouse
STORE_DESCRIPTION=Food delivery service
EOF
log_success ".env файл создан"

# 10. Создание необходимых папок
log_info "Создание папок для работы приложения..."
mkdir -p uploads/images logs backups
sudo chown -R $USER:$USER uploads logs backups
log_success "Папки созданы"

# 11. Сборка проекта
log_info "Сборка проекта..."
npm run build
log_success "Проект собран"

# 12. Создание конфигурации PM2
log_info "Создание конфигурации PM2..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'edahouse',
    script: 'dist/index.js',
    cwd: '$PROJECT_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: $APP_PORT,
      HOST: '0.0.0.0'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF
log_success "PM2 конфигурация создана"

# 13. Проверка PostgreSQL и создание базы данных
log_info "Настройка базы данных PostgreSQL..."

# Проверяем есть ли PostgreSQL
if is_installed psql; then
    log_success "PostgreSQL уже установлен"
    
    # Проверяем существует ли база данных
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        log_warning "База данных $DB_NAME уже существует"
    else
        log_info "Создание базы данных $DB_NAME..."
        sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF
        log_success "База данных создана"
    fi
else
    log_error "PostgreSQL не найден. Установите его через FastPanel или вручную."
    exit 1
fi

# 14. Инициализация схемы базы данных
log_info "Инициализация схемы базы данных..."
npm run db:push
log_success "Схема базы данных готова"

# 15. Тестовый запуск приложения
log_info "Тестовый запуск приложения..."
timeout 10 npm run start > /dev/null 2>&1 &
sleep 5
if curl -s http://localhost:$APP_PORT/api/health > /dev/null; then
    log_success "Приложение отвечает на порту $APP_PORT"
    pkill -f "node dist/index.js" || true
else
    log_error "Приложение не отвечает. Проверьте логи."
fi

# 16. Запуск через PM2
log_info "Запуск приложения через PM2..."
pm2 delete edahouse 2>/dev/null || true  # Удалить если уже существует
pm2 start ecosystem.config.js
pm2 save
log_success "Приложение запущено через PM2"

# 17. Настройка автозапуска PM2
log_info "Настройка автозапуска PM2..."
pm2 startup systemd -u $USER --hp $HOME
log_success "Автозапуск PM2 настроен"

# 18. Проверка финального статуса
log_info "Проверка статуса сервисов..."
echo ""
echo "📊 Статус PM2:"
pm2 status

echo ""
echo "🔗 Проверка подключения:"
if curl -s http://localhost:$APP_PORT/api/health | grep -q "healthy"; then
    log_success "API отвечает корректно"
else
    log_warning "API не отвечает или работает некорректно"
fi

echo ""
echo "📁 Права доступа:"
ls -la $PROJECT_DIR | head -5

# 19. Итоговая информация
echo ""
echo "🎉 УСТАНОВКА ЗАВЕРШЕНА!"
echo "======================"
echo ""
log_info "Что нужно сделать в FastPanel:"
echo "  1. Перейти в раздел 'Домены'"
echo "  2. Добавить домен: $DOMAIN"
echo "  3. Настроить прокси:"
echo "     - Хост: 127.0.0.1 (или localhost)"
echo "     - Порт: $APP_PORT"
echo "  4. Включить SSL сертификат"
echo ""
log_info "Полезные команды:"
echo "  📊 Статус приложения: pm2 status"
echo "  📝 Логи приложения: pm2 logs edahouse"
echo "  🔄 Перезапуск: pm2 restart edahouse"
echo "  🛑 Остановка: pm2 stop edahouse"
echo "  🔧 Обновление кода:"
echo "     cd $PROJECT_DIR"
echo "     git pull origin main"
echo "     npm install"
echo "     npm run build"
echo "     pm2 restart edahouse"
echo ""
log_info "Проверка здоровья приложения:"
echo "  🌐 Локально: curl http://localhost:$APP_PORT/api/health"
echo "  🌍 Публично: curl https://$DOMAIN/api/health (после настройки прокси)"
echo ""
log_success "Приложение готово к работе!"
echo ""
log_warning "Не забудьте настроить прокси в FastPanel на localhost:$APP_PORT"