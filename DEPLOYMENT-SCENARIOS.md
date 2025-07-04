# 🎯 Сценарии развертывания eDAHouse на VPS

## 📋 Три основных ситуации

### 🆕 Сценарий 1: Полностью новый сервер
**Ситуация:** Чистый VPS, на котором ничего нет

**Команда:** 
```bash
git clone https://github.com/alexjc55/Ordis.git www/edahouse.ordis.co.il && cd www/edahouse.ordis.co.il && ./deploy/install-on-vps.sh
```

**Что происходит:**
- Загружается весь проект с GitHub (включая папку deploy/)
- Устанавливается новая база данных с начальными данными
- Настраивается PM2, Nginx, SSL
- Приложение запускается на порту 3000

---

### 🔄 Сценарий 2: Обновление существующего проекта
**Ситуация:** Проект уже работает, нужно обновить до новой версии

**Условие:** Папка `deploy/` уже есть в проекте

**Команда:**
```bash
cd www/edahouse.ordis.co.il && ./deploy/update-project.sh
```

**Что происходит:**
- Создается резервная копия всех данных
- Обновляется код с GitHub
- База данных остается без изменений (только схема)
- Приложение перезапускается

---

### 🔀 Сценарий 3: Гибридная ситуация
**Ситуация:** Проект есть, но папки `deploy/` нет (старая версия проекта)

**Проблема:** `./deploy/update-project.sh` - файл не найден

**Решение:**
```bash
cd www/edahouse.ordis.co.il && curl -sSL https://raw.githubusercontent.com/alexjc55/Ordis/main/deploy/sync-from-replit.sh | bash
```

**Что происходит:**
- Скрипт загружается напрямую с GitHub и выполняется
- Создается резервная копия важных файлов (.env, uploads/)
- Обновляется весь код с сохранением данных
- Восстанавливаются настройки из резервной копии
- База данных остается с вашими данными

---

## 🔍 Как определить свою ситуацию?

### Проверка состояния сервера:

```bash
# Подключиться к серверу
ssh ordis_co_il_usr@your-server-ip

# Проверить, есть ли проект
ls -la www/

# Если проект есть, проверить наличие папки deploy/
cd www/edahouse.ordis.co.il
ls -la deploy/
```

**Результаты:**

| Проверка | Результат | Сценарий |
|----------|-----------|----------|
| `www/` пустая | Директории нет | 🆕 **Новый сервер** |
| `deploy/` есть | Папка существует | 🔄 **Обычное обновление** |
| `deploy/` нет | `No such file or directory` | 🔀 **Гибридная ситуация** |

---

## 📺 Примеры реальных команд

### 🆕 Новый сервер (полная установка):
```bash
ssh ordis_co_il_usr@your-server-ip
cd /var/www/ordis_co_il_usr/data/
git clone https://github.com/alexjc55/Ordis.git www/edahouse.ordis.co.il
cd www/edahouse.ordis.co.il
chmod +x deploy/*.sh
./deploy/install-on-vps.sh
```

### 🔄 Обычное обновление:
```bash
ssh ordis_co_il_usr@your-server-ip
cd www/edahouse.ordis.co.il
./deploy/update-project.sh
```

### 🔀 Старый проект без deploy/:
```bash
ssh ordis_co_il_usr@your-server-ip
cd www/edahouse.ordis.co.il

# Универсальная команда - работает всегда!
curl -sSL https://raw.githubusercontent.com/alexjc55/Ordis/main/deploy/sync-from-replit.sh | bash
```

---

## 🛡️ Безопасность данных в каждом сценарии

| Сценарий | База данных | Файлы | Резервная копия |
|----------|-------------|--------|-----------------|
| 🆕 Новый | Создается с нуля | Новые | Не нужна |
| 🔄 Обновление | Данные сохраняются | Сохраняются | Автоматическая |
| 🔀 Гибридная | Данные сохраняются | Сохраняются | Автоматическая |

**Важно:** Во всех случаях ваши продукты, заказы и пользователи остаются целыми!

---

## 🎯 Универсальная команда для любой ситуации

Если не знаете точно, какой у вас случай - используйте эту команду:

```bash
ssh ordis_co_il_usr@your-server-ip
cd www/edahouse.ordis.co.il 2>/dev/null || { 
  echo "Проект не найден - делаем новую установку"
  cd /var/www/ordis_co_il_usr/data/
  git clone https://github.com/alexjc55/Ordis.git www/edahouse.ordis.co.il
  cd www/edahouse.ordis.co.il
  ./deploy/install-on-vps.sh
  exit 0
}

# Проект есть - проверяем deploy/
if [ -f "deploy/update-project.sh" ]; then
  echo "Обычное обновление"
  ./deploy/update-project.sh
else
  echo "Гибридная синхронизация" 
  curl -sSL https://raw.githubusercontent.com/alexjc55/Ordis/main/deploy/sync-from-replit.sh | bash
fi
```

**Эта команда автоматически определяет ситуацию и выполняет правильные действия!**