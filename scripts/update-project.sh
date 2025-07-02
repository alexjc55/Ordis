#!/bin/bash

# Скрипт для безопасного обновления проекта на VPS
# Сохраняет данные пользователей и настройки

set -e

PROJECT_DIR="/var/www/ordis_co_il_usr/data/www/edahouse.ordis.co.il"
BACKUP_DIR="$PROJECT_DIR/backups"
DATE=$(date +"%Y%m%d_%H%M%S")

echo "🚀 Начинаем обновление проекта eDAHouse..."

# Создаем директорию для бэкапов если не существует
mkdir -p "$BACKUP_DIR"

echo "📦 Создаем резервную копию базы данных..."
# Бэкап базы данных
pg_dump -U $PGUSER -h $PGHOST -p $PGPORT $PGDATABASE > "$BACKUP_DIR/db_backup_$DATE.sql"

echo "📁 Создаем резервную копию загруженных файлов..."
# Бэкап загруженных файлов
if [ -d "$PROJECT_DIR/uploads" ]; then
    cp -r "$PROJECT_DIR/uploads" "$BACKUP_DIR/uploads_backup_$DATE"
fi

echo "⚙️ Создаем резервную копию конфигурации..."
# Бэкап .env файла
if [ -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env" "$BACKUP_DIR/env_backup_$DATE"
fi

echo "🔄 Получаем последние изменения из репозитория..."
cd "$PROJECT_DIR"

# Сохраняем текущий коммит
CURRENT_COMMIT=$(git rev-parse HEAD)
echo "Текущий коммит: $CURRENT_COMMIT" > "$BACKUP_DIR/commit_$DATE.txt"

# Получаем обновления
git fetch origin

echo "📥 Применяем обновления..."
git pull origin main

echo "📦 Устанавливаем зависимости..."
npm install

echo "🏗️ Собираем проект..."
npm run build

echo "🗄️ Обновляем схему базы данных..."
# Проверяем есть ли новые миграции
if npm run db:push --dry-run | grep -q "changes"; then
    echo "⚠️ Найдены изменения в схеме базы данных. Применяем..."
    npm run db:push
else
    echo "✅ Схема базы данных актуальна"
fi

echo "🔄 Перезапускаем приложение..."
pm2 reload edahouse

echo "🏥 Проверяем состояние приложения..."
sleep 5

# Проверяем что приложение запустилось
if pm2 describe edahouse | grep -q "online"; then
    echo "✅ Приложение успешно обновлено и запущено!"
    
    # Проверяем HTTP ответ
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Приложение отвечает на запросы"
    else
        echo "⚠️ Приложение не отвечает на запросы"
    fi
else
    echo "❌ Ошибка запуска приложения!"
    echo "📋 Логи PM2:"
    pm2 logs edahouse --lines 20
    
    echo "🔄 Выполняем откат к предыдущей версии..."
    git reset --hard $CURRENT_COMMIT
    npm install
    npm run build
    pm2 reload edahouse
    
    echo "⚠️ Выполнен откат к версии $CURRENT_COMMIT"
    exit 1
fi

echo "🧹 Очистка старых бэкапов (старше 7 дней)..."
find "$BACKUP_DIR" -name "*backup*" -type f -mtime +7 -delete
find "$BACKUP_DIR" -name "*backup*" -type d -mtime +7 -exec rm -rf {} +

echo "🎉 Обновление завершено успешно!"
echo "📄 Резервные копии сохранены в: $BACKUP_DIR"
echo "📊 Статус приложения:"
pm2 status edahouse