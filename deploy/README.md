# eDAHouse VPS Deployment Guide

Простые инструкции для развертывания и обновления проекта на VPS сервере с FastPanel.

## 🚀 Первоначальная установка

### 1. Подключение к серверу
```bash
ssh root@your-server-ip
```

### 2. Загрузка проекта
```bash
# Скачайте проект с GitHub
git clone https://github.com/alexjc55/Ordis.git www/edahouse.ordis.co.il
cd www/edahouse.ordis.co.il
```

### 3. Запуск установки
```bash
# Делаем скрипт исполняемым
chmod +x deploy/install-on-vps.sh

# Запускаем установку
./deploy/install-on-vps.sh
```

### 4. Настройка базы данных
```bash
# Пароль базы данных уже настроен автоматически
# DATABASE_URL=postgresql://ordis_co_il_usr:33V0R1N5qi81paiA@localhost:5432/edahouse_ord
```

### 5. Перезапуск приложения
```bash
pm2 restart edahouse
```

## 🔄 Обновление проекта

### Простое обновление
```bash
cd www/edahouse.ordis.co.il
./deploy/update-project.sh
```

### Обновление с исправлением проблем
```bash
cd www/edahouse.ordis.co.il
./deploy/fix-environment.sh
./deploy/update-project.sh
```

## 🔧 Исправление проблем

### Если что-то пошло не так
```bash
cd www/edahouse.ordis.co.il
./deploy/fix-environment.sh
```

### Проверка состояния
```bash
# Проверить статус PM2
pm2 status

# Проверить логи
pm2 logs edahouse

# Проверить порты
netstat -tlnp | grep :3000

# Проверить работу приложения
curl http://localhost:3000/api/health
```

## 📋 Основные команды

### Управление приложением
```bash
# Перезапуск
pm2 restart edahouse

# Остановка
pm2 stop edahouse

# Запуск
pm2 start edahouse

# Просмотр логов
pm2 logs edahouse --lines 50
```

### Управление базой данных
```bash
# Подключение к базе
psql -U ordis_co_il_usr -d edahouse_ord

# Создание резервной копии
pg_dump -U ordis_co_il_usr edahouse_ord > backup.sql

# Восстановление из резервной копии
psql -U ordis_co_il_usr -d edahouse_ord < backup.sql
```

## 🛠️ Настройка FastPanel

### 1. Добавление сайта в FastPanel
1. Зайдите в панель FastPanel
2. Создайте новый сайт: `edahouse.ordis.co.il`
3. Укажите корневую папку: `/var/www/edahouse.ordis.co.il`
4. Включите SSL сертификат

### 2. Настройка Nginx
FastPanel автоматически настроит Nginx, но если нужно:
```bash
# Проверить конфигурацию
nginx -t

# Перезагрузить Nginx
systemctl reload nginx
```

## 📁 Структура файлов

```
www/edahouse.ordis.co.il/
├── deploy/                 # Скрипты развертывания
│   ├── install-on-vps.sh   # Установка
│   ├── update-project.sh   # Обновление
│   └── sync-from-replit.sh # Гибридная синхронизация
├── .env                    # Настройки окружения
├── ecosystem.config.js     # Конфигурация PM2
├── logs/                   # Логи приложения
└── uploads/                # Загруженные файлы
```

## 🔍 Решение проблем

### Проблема: Порт занят
```bash
# Найти процесс на порту 3000
lsof -i :3000

# Убить процесс
kill -9 PID
```

### Проблема: База данных недоступна
```bash
# Проверить статус PostgreSQL
systemctl status postgresql

# Запустить PostgreSQL
systemctl start postgresql
```

### Проблема: Приложение не запускается
```bash
# Проверить логи
pm2 logs edahouse

# Проверить .env файл
cat .env

# Запустить исправление
./deploy/fix-environment.sh
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs edahouse`
2. Запустите исправление: `./deploy/fix-environment.sh`
3. Если проблема не решена, сохраните вывод команд для анализа

## 📝 Примечания

- Проект работает на порту 3000
- База данных: PostgreSQL
- Процесс управляется через PM2
- Все изменения сохраняются автоматически
- Резервные копии создаются при обновлении