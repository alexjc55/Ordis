# 🚀 eDAHouse VPS Deployment Guide

Автоматизированное развертывание проекта на VPS сервере с FastPanel.

## 📋 Быстрый старт

### 1️⃣ Первоначальная установка (один раз)

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Скачайте проект
git clone https://github.com/yourusername/edahouse.git /var/www/edahouse.ordis.co.il
cd /var/www/edahouse.ordis.co.il

# Запустите автоматическую установку
./deploy/install-on-vps.sh

# Настройте пароль базы данных
nano .env
# Измените: DATABASE_URL=postgresql://edahouse_user:YOUR_PASSWORD@localhost:5432/edahouse_ord

# Перезапустите приложение
pm2 restart edahouse
```

### 2️⃣ Проверка установки

```bash
# Проверьте все компоненты
./deploy/validate-installation.sh

# Быстрая проверка статуса
./deploy/quick-commands.sh status
```

### 3️⃣ Обновление проекта

```bash
cd /var/www/edahouse.ordis.co.il

# Простое обновление
./deploy/update-project.sh

# Обновление с исправлением проблем
./deploy/fix-environment.sh && ./deploy/update-project.sh
```

## 🛠️ Быстрые команды

```bash
# Проверить статус
./deploy/quick-commands.sh status

# Посмотреть логи
./deploy/quick-commands.sh logs

# Перезапустить
./deploy/quick-commands.sh restart

# Обновить проект
./deploy/quick-commands.sh update

# Исправить проблемы
./deploy/quick-commands.sh fix

# Создать резервную копию
./deploy/quick-commands.sh backup

# Проверить окружение
./deploy/quick-commands.sh env

# Проверить базу данных
./deploy/quick-commands.sh db
```

## 🔧 Решение проблем

### Проблема: Приложение не запускается
```bash
./deploy/fix-environment.sh
pm2 restart edahouse
./deploy/quick-commands.sh status
```

### Проблема: Порт занят
```bash
# Найти процесс
lsof -i :3000

# Убить процесс
kill -9 PID

# Перезапустить
pm2 restart edahouse
```

### Проблема: База данных недоступна
```bash
# Проверить PostgreSQL
systemctl status postgresql
systemctl start postgresql

# Проверить подключение
./deploy/quick-commands.sh db
```

### Проблема: Ошибки в логах
```bash
# Посмотреть логи
./deploy/quick-commands.sh logs

# Если нужно больше логов
pm2 logs edahouse --lines 100
```

## 📁 Что делают скрипты

### `install-on-vps.sh`
- Устанавливает Node.js, PM2, PostgreSQL
- Создает базу данных и пользователя
- Устанавливает зависимости проекта
- Настраивает окружение для VPS
- Запускает приложение

### `update-project.sh`
- Создает резервную копию
- Обновляет код из Git
- Сохраняет пользовательские данные
- Перезапускает приложение безопасно

### `fix-environment.sh`
- Исправляет порт (5000 → 3000)
- Настраивает PostgreSQL вместо Neon
- Исправляет проблемы совместимости
- Обновляет конфигурацию PM2

### `validate-installation.sh`
- Проверяет все компоненты системы
- Тестирует подключения
- Показывает детальный отчет

### `quick-commands.sh`
- Быстрые команды для управления
- Проверка статуса и логов
- Перезапуск и обновление

## 🔍 Мониторинг

### Проверка работы приложения
```bash
# Статус PM2
pm2 status

# Проверка порта
netstat -tlnp | grep :3000

# Проверка health endpoint
curl http://localhost:3000/api/health

# Полная проверка
./deploy/validate-installation.sh
```

### Логи
```bash
# Логи PM2
pm2 logs edahouse

# Логи системы
journalctl -u postgresql -f

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 📦 Резервное копирование

### Автоматическое (при обновлении)
```bash
./deploy/update-project.sh
# Создает резервную копию автоматически
```

### Ручное
```bash
./deploy/quick-commands.sh backup
```

### Восстановление
```bash
# База данных
psql -U edahouse_user -d edahouse_ord < /var/backups/edahouse/backup-YYYYMMDD_HHMMSS.sql

# Файлы
cd /var/www/edahouse.ordis.co.il
tar -xzf /var/backups/edahouse/backup-YYYYMMDD_HHMMSS.tar.gz
```

## 🌐 FastPanel Integration

### Добавление сайта
1. Откройте FastPanel
2. Добавьте новый сайт: `edahouse.ordis.co.il`
3. Корневая папка: `/var/www/edahouse.ordis.co.il`
4. Включите SSL сертификат

### Proxy настройка
FastPanel автоматически настроит проксирование на порт 3000.

## 📊 Параметры системы

| Параметр | Значение |
|----------|----------|
| Порт | 3000 |
| База данных | PostgreSQL |
| Процесс-менеджер | PM2 |
| Веб-сервер | Nginx |
| SSL | Let's Encrypt |
| Пользователь БД | edahouse_user |
| База данных | edahouse_ord |

## 🚨 Критические файлы

**НЕ УДАЛЯЙТЕ:**
- `.env` - настройки окружения
- `uploads/` - загруженные файлы
- `ecosystem.config.js` - конфигурация PM2
- `deploy/` - скрипты развертывания

## 🆘 Экстренные команды

```bash
# Полная перезагрузка
pm2 kill
./deploy/install-on-vps.sh

# Откат к резервной копии
pm2 stop edahouse
# Восстановите файлы из резервной копии
pm2 start edahouse

# Сброс базы данных
psql -U edahouse_user -d edahouse_ord -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run db:push
```

## 📞 Поддержка

При проблемах проверьте:
1. `./deploy/validate-installation.sh`
2. `./deploy/quick-commands.sh status`
3. `pm2 logs edahouse`

Сохраните вывод команд для анализа проблемы.