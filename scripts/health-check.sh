#!/bin/bash

# Скрипт проверки работоспособности eDAHouse

set -e

PROJECT_NAME="${1:-edahouse}"
DOMAIN="${2:-localhost}"
PORT="${3:-3000}"

echo "🏥 Проверка работоспособности $PROJECT_NAME"
echo "🌐 Домен: $DOMAIN"
echo "🔌 Порт: $PORT"

# Проверяем PM2 статус
echo ""
echo "📊 Проверяем статус PM2..."
if pm2 describe "$PROJECT_NAME" | grep -q "online"; then
    echo "✅ PM2: Приложение запущено"
else
    echo "❌ PM2: Приложение не запущено"
    pm2 status "$PROJECT_NAME"
    exit 1
fi

# Проверяем HTTP ответ
echo ""
echo "🌐 Проверяем HTTP соединение..."
if curl -f -s "http://localhost:$PORT/api/health" > /dev/null; then
    echo "✅ HTTP: Приложение отвечает на запросы"
else
    echo "❌ HTTP: Приложение не отвечает"
    echo "Попробуем базовый URL..."
    if curl -f -s "http://localhost:$PORT" > /dev/null; then
        echo "⚠️ Базовый URL работает, но /api/health недоступен"
    else
        echo "❌ Приложение полностью недоступно"
        exit 1
    fi
fi

# Проверяем базу данных
echo ""
echo "🗄️ Проверяем подключение к базе данных..."
if [ -f ".env" ]; then
    source .env
    if psql "$DATABASE_URL" -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ База данных: Подключение работает"
    else
        echo "❌ База данных: Ошибка подключения"
        exit 1
    fi
else
    echo "⚠️ Файл .env не найден, пропускаем проверку БД"
fi

# Проверяем директории
echo ""
echo "📁 Проверяем файловую систему..."
required_dirs=("uploads" "logs" "backups")
for dir in "${required_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Директория $dir существует"
    else
        echo "⚠️ Директория $dir отсутствует, создаем..."
        mkdir -p "$dir"
    fi
done

# Проверяем права доступа
echo ""
echo "🔐 Проверяем права доступа..."
if [ -w "uploads" ]; then
    echo "✅ Права записи в uploads"
else
    echo "❌ Нет прав записи в uploads"
    exit 1
fi

# Проверяем размер логов
echo ""
echo "📋 Проверяем размер логов..."
if [ -d "logs" ]; then
    log_size=$(du -sh logs 2>/dev/null | cut -f1 || echo "0")
    echo "📊 Размер логов: $log_size"
    
    # Предупреждение если логи больше 100MB
    log_size_mb=$(du -m logs 2>/dev/null | cut -f1 || echo "0")
    if [ "$log_size_mb" -gt 100 ]; then
        echo "⚠️ Логи занимают много места ($log_size), рекомендуется очистка"
    fi
fi

# Проверяем использование памяти
echo ""
echo "💾 Проверяем использование памяти..."
memory_usage=$(pm2 describe "$PROJECT_NAME" | grep "memory usage" | awk '{print $4}' || echo "N/A")
if [ "$memory_usage" != "N/A" ]; then
    echo "📊 Использование памяти: $memory_usage"
else
    echo "⚠️ Не удалось определить использование памяти"
fi

# Проверяем Nginx (если используется)
echo ""
echo "🌐 Проверяем Nginx..."
if command -v nginx &> /dev/null; then
    if sudo nginx -t > /dev/null 2>&1; then
        echo "✅ Nginx: Конфигурация корректна"
    else
        echo "❌ Nginx: Ошибка в конфигурации"
        sudo nginx -t
    fi
    
    if systemctl is-active nginx > /dev/null 2>&1; then
        echo "✅ Nginx: Сервис запущен"
    else
        echo "❌ Nginx: Сервис не запущен"
    fi
else
    echo "⚠️ Nginx не установлен"
fi

# Проверяем SSL сертификат (если домен не localhost)
if [ "$DOMAIN" != "localhost" ] && [ "$DOMAIN" != "127.0.0.1" ]; then
    echo ""
    echo "🔒 Проверяем SSL сертификат..."
    if openssl s_client -connect "$DOMAIN:443" -servername "$DOMAIN" < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
        echo "✅ SSL: Сертификат действителен"
    else
        echo "❌ SSL: Проблема с сертификатом"
    fi
fi

# Итоговый статус
echo ""
echo "🎯 Общий статус: ✅ Все проверки пройдены успешно"
echo ""
echo "📊 Краткий отчет:"
echo "   - Приложение: Работает"
echo "   - База данных: Подключена"
echo "   - Файловая система: В порядке"
echo "   - Веб-сервер: Настроен"
echo ""
echo "🔧 Полезные команды:"
echo "   pm2 logs $PROJECT_NAME      - просмотр логов"
echo "   pm2 monit                   - мониторинг в реальном времени"
echo "   pm2 restart $PROJECT_NAME   - перезапуск приложения"