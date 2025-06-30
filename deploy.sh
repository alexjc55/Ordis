#!/bin/bash

# Скрипт автоматического деплоя eDAHouse на VPS
# Запуск: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 Начинаем деплой eDAHouse..."

# Проверка переменных окружения
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден! Создайте его по образцу .env.example"
    exit 1
fi

# Установка зависимостей
echo "📦 Установка зависимостей..."
npm install --production=false

# Сборка проекта
echo "🔨 Сборка проекта..."
npm run build

# Применение миграций базы данных
echo "🗄️ Обновление базы данных..."
npm run db:push

# Создание директории для логов PM2
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Создание директории для uploads если не существует
mkdir -p uploads

# Установка правильных прав доступа
chmod 755 uploads

# Запуск/перезапуск через PM2
echo "🔄 Запуск приложения через PM2..."
if pm2 describe edahouse > /dev/null 2>&1; then
    echo "Перезапуск существующего процесса..."
    pm2 restart edahouse
else
    echo "Запуск нового процесса..."
    pm2 start ecosystem.config.js
fi

# Сохранение конфигурации PM2
pm2 save

echo "✅ Деплой завершен успешно!"
echo "📊 Статус приложения:"
pm2 status

echo ""
echo "🔍 Полезные команды:"
echo "  pm2 logs edahouse     - просмотр логов"
echo "  pm2 monit            - мониторинг в реальном времени"
echo "  pm2 restart edahouse - перезапуск приложения"
echo "  pm2 stop edahouse    - остановка приложения"