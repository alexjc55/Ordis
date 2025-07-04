-- ПОЛНЫЙ экспорт всех 52 продуктов для VPS
-- Очистка существующих данных
TRUNCATE TABLE product_categories CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE store_settings CASCADE;

-- Категории
INSERT INTO categories (id, name, name_en, name_he, name_ar, description, description_en, description_he, description_ar, icon, is_active, sort_order, created_at, updated_at) VALUES 
(47, 'Салаты', '', 'סלטים', '', 'Свежие салаты и закуски', '', 'סלטים טריים ומנות פתיחה', '', '🥗', true, 1, NOW(), NOW()),
(48, 'Горячие блюда', NULL, NULL, NULL, 'Основные блюда на развес', NULL, NULL, NULL, '🍖', true, 2, NOW(), NOW()),
(49, 'Гарниры', NULL, NULL, NULL, 'Каши, картофель, овощи', NULL, NULL, NULL, '🍚', true, 3, NOW(), NOW()),
(50, 'Супы', NULL, NULL, NULL, 'Первые блюда', NULL, NULL, NULL, '🍲', true, 4, NOW(), NOW()),
(51, 'Выпечка и десерты', NULL, NULL, NULL, 'Блинчики, сырники, корндоги', NULL, NULL, NULL, '🥞', true, 5, NOW(), NOW()),
(52, 'Пирожки', NULL, NULL, NULL, 'Свежие пирожки с разными начинками', NULL, NULL, NULL, '🥟', true, 6, NOW(), NOW());

-- ВСЕ 52 ПРОДУКТА
INSERT INTO products (id, name, name_en, name_he, name_ar, description, description_en, description_he, description_ar, price, price_per_kg, image_url, unit, is_active, availability_status, is_special_offer, discount_type, discount_value, sort_order, created_at, updated_at) VALUES 
-- САЛАТЫ (377-388)
(377, 'Оливье', NULL, NULL, NULL, 'Классический салат с мясом, картофелем, морковью, яйцами и горошком', NULL, NULL, NULL, 42.00, 42.00, '/assets/1_1750184360776.jpg', '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(378, 'Винегрет', NULL, NULL, NULL, 'Традиционный русский салат со свеклой, морковью и квашеной капустой', NULL, NULL, NULL, 35.50, 35.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(379, 'Мимоза', NULL, NULL, NULL, 'Нежный слоеный салат с рыбой, яйцами и сыром', NULL, NULL, NULL, 48.90, 48.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(380, 'Абжерка', NULL, 'אבזרקה', NULL, 'Острый грузинский салат с овощами и зеленью', NULL, 'סלט גיאורגי חריף עם ירקות ועשבי תיבול', NULL, 45.01, 45.01, '', '100g', true, 'out_of_stock_today', true, 'percentage', 20.00, 0, NOW(), NOW()),
(381, 'Аджика', NULL, '', NULL, 'Острая закуска из помидоров, перца и специй', NULL, '', NULL, 52.90, 52.90, '', '100g', true, 'available', true, 'percentage', 20.00, 0, NOW(), NOW()),
(382, 'Баклажаны по-азиатски', NULL, NULL, NULL, 'Маринованные баклажаны с чесноком и кориандром', NULL, NULL, NULL, 58.80, 58.80, '', '100g', true, 'available', true, 'percentage', 20.00, 0, NOW(), NOW()),
(383, 'Грибы по-азиатски', NULL, NULL, NULL, 'Маринованные грибы с корейскими специями', NULL, NULL, NULL, 62.50, 62.50, '', '100g', true, 'available', true, 'percentage', 15.00, 0, NOW(), NOW()),
(384, 'Салат из капусты', NULL, NULL, NULL, 'Свежая капуста с морковью и зеленью', NULL, NULL, NULL, 25.90, 25.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(385, 'Салат свежий с редиской', NULL, NULL, NULL, 'Хрустящий салат из огурцов, редиски и зелени', NULL, NULL, NULL, 32.50, 32.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(386, 'Салат из свеклы', NULL, NULL, NULL, 'Вареная свекла с чесноком и майонезом', NULL, NULL, NULL, 28.90, 28.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(387, 'Салат из моркови', NULL, NULL, NULL, 'Корейская морковка с пряными специями', NULL, NULL, NULL, 35.80, 35.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(388, 'Салат Цезарь', NULL, NULL, NULL, 'Классический салат с курицей, пармезаном и соусом цезарь', NULL, NULL, NULL, 65.90, 65.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),

-- ГОРЯЧИЕ БЛЮДА (389-408)
(389, 'Котлеты', NULL, NULL, NULL, 'Домашние мясные котлеты из говядины и свинины', NULL, NULL, NULL, 72.50, 72.50, '/@assets/3_1750184360777.jpg', '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(390, 'Паргит', NULL, NULL, NULL, 'Куриное филе в панировке, жаренное до золотистой корочки', NULL, NULL, NULL, 68.90, 68.90, '/@assets/1_1750184360776.jpg', '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(391, 'Крылышки', NULL, NULL, NULL, 'Сочные куриные крылышки в медово-горчичном соусе', NULL, NULL, NULL, 65.80, 65.80, '/@assets/2_1750184360777.jpg', '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(392, 'Окорочка', NULL, NULL, NULL, 'Запеченные куриные окорочка с травами и специями', NULL, NULL, NULL, 58.50, 58.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(393, 'Тефтели', NULL, NULL, NULL, 'Нежные мясные шарики в томатном соусе', NULL, NULL, NULL, 69.90, 69.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(394, 'Гуляш', NULL, NULL, NULL, 'Тушеное мясо с овощами в пряном соусе', NULL, NULL, NULL, 78.50, 78.50, '/assets/3_1750184360777.jpg', '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(395, 'Плов', NULL, NULL, NULL, 'Классический узбекский плов с мясом и морковью', NULL, NULL, NULL, 52.90, 52.90, '/assets/3_1750184360777.jpg', '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(396, 'Плов зеленый', NULL, NULL, NULL, 'Плов с зеленью, изюмом и специальными специями', NULL, NULL, NULL, 56.80, 56.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(397, 'Перцы фаршированные', NULL, NULL, NULL, 'Болгарский перец, фаршированный мясом и рисом', NULL, NULL, NULL, 62.50, 62.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(398, 'Голубцы', NULL, NULL, NULL, 'Капустные листья с мясной начинкой в томатном соусе', NULL, NULL, NULL, 58.90, 58.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(399, 'Запеченные овощи', NULL, NULL, NULL, 'Ассорти из сезонных овощей, запеченных с травами', NULL, NULL, NULL, 38.50, 38.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(400, 'Отбивные', NULL, NULL, NULL, 'Свиные отбивные в золотистой панировке', NULL, NULL, NULL, 82.90, 82.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(401, 'Шницель', NULL, NULL, NULL, 'Куриный шницель в хрустящей панировке', NULL, NULL, NULL, 75.80, 75.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(402, 'Фасоль тушеная', NULL, NULL, NULL, 'Белая фасоль тушеная с овощами и томатами', NULL, NULL, NULL, 35.50, 35.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(403, 'Жаркое', NULL, NULL, NULL, 'Мясо тушеное с картофелем и овощами по-домашнему', NULL, NULL, NULL, 68.90, 68.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(404, 'Капуста тушеная', NULL, NULL, NULL, 'Белокочанная капуста тушеная с морковью и луком', NULL, NULL, NULL, 28.50, 28.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(405, 'Курица по-китайски', NULL, NULL, NULL, 'Кусочки курицы в кисло-сладком соусе с овощами', NULL, NULL, NULL, 72.80, 72.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(406, 'Чебуреки', NULL, NULL, NULL, 'Хрустящие чебуреки с сочной мясной начинкой', NULL, NULL, NULL, 58.90, 58.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(407, 'Душпара', NULL, NULL, NULL, 'Маленькие пельмени в ароматном бульоне', NULL, NULL, NULL, 48.50, 48.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(408, 'Равиоли', NULL, NULL, NULL, 'Итальянские равиоли с сырной начинкой', NULL, NULL, NULL, 65.90, 65.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),

-- ГАРНИРЫ (409-414)
(409, 'Картошка жареная', NULL, NULL, NULL, 'Золотистая жареная картошка с луком и зеленью', NULL, NULL, NULL, 32.50, 32.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(410, 'Рис отварной', NULL, NULL, NULL, 'Рассыпчатый белый рис с маслом', NULL, NULL, NULL, 25.80, 25.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(411, 'Гречка', NULL, NULL, NULL, 'Рассыпчатая гречневая каша с маслом', NULL, NULL, NULL, 28.90, 28.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(412, 'Картофель отварной', NULL, NULL, NULL, 'Молодой картофель отварной с укропом', NULL, NULL, NULL, 26.50, 26.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(413, 'Макароны', NULL, NULL, NULL, 'Отварные макароны с маслом и сыром', NULL, NULL, NULL, 22.90, 22.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(414, 'Пюре картофельное', NULL, NULL, NULL, 'Нежное картофельное пюре на молоке с маслом', NULL, NULL, NULL, 35.80, 35.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),

-- СУПЫ (415-420)
(415, 'Борщ', NULL, NULL, NULL, 'Традиционный украинский борщ со сметаной', NULL, NULL, NULL, 38.50, 38.50, '/uploads/images/image-1750192273390-458955015.webp', 'piece', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(416, 'Солянка мясная', NULL, NULL, NULL, 'Сытная солянка с копченостями и оливками', NULL, NULL, NULL, 48.90, 48.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(417, 'Щи', NULL, NULL, NULL, 'Кислые щи из квашеной капусты с мясом', NULL, NULL, NULL, 35.80, 35.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(418, 'Суп гороховый', NULL, NULL, NULL, 'Наваристый гороховый суп с копченостями', NULL, NULL, NULL, 32.50, 32.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(419, 'Харчо', NULL, NULL, NULL, 'Острый грузинский суп с мясом и рисом', NULL, NULL, NULL, 42.90, 42.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(420, 'Лагман', NULL, NULL, NULL, 'Узбекский суп с лапшой и мясом', NULL, NULL, NULL, 45.80, 45.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),

-- ВЫПЕЧКА И ДЕСЕРТЫ (421-424)
(421, 'Блинчики с Куриной Грудкой и Сыром', NULL, NULL, NULL, 'Сочная начинка из нежной куриной грудки, плавленого сыра, завернутая в тонкие и румяные блинчики. Прекрасный перекус и полноценное второе блюдо во время обеда.', NULL, NULL, NULL, 62.90, 62.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(422, 'Блинчики с Мясом', NULL, NULL, NULL, 'Традиционное русское лакомство – тонкие и румяные блинчики. Блинчики с богатой мясной начинкой станут прекрасным перекусом или полноценным вторым блюдом на завтрак или обед.', NULL, NULL, NULL, 58.90, 58.90, '', '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(423, 'Сырники', NULL, NULL, NULL, 'Нежные творожные сырники со сметаной', NULL, NULL, NULL, 52.90, 52.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(424, 'Чебуреки с Мясом Жареные', NULL, NULL, NULL, 'Хрустящие чебуреки с сочной мясной начинкой, обжаренные до золотистой корочки', NULL, NULL, NULL, 65.50, 65.50, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),

-- ПИРОЖКИ (425-428)
(425, 'Пирожок с Мясом', NULL, NULL, NULL, 'Сытный пирожок с ароматной мясной начинкой, выпеченный по домашнему рецепту', NULL, NULL, NULL, 45.80, 45.80, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(426, 'Пирожок с Зеленым Луком и Яйцом', NULL, NULL, NULL, 'Традиционный пирожок с начинкой из свежего зеленого лука и вареных яиц', NULL, NULL, NULL, 38.50, 38.50, '', 'piece', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(427, 'Пирожок с Картофелем', NULL, NULL, NULL, 'Домашний пирожок с нежной картофельной начинкой и зеленью', NULL, NULL, NULL, 35.90, 35.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW()),
(428, 'Пирожок с Яблоком', NULL, NULL, NULL, 'Сладкий пирожок с ароматной яблочной начинкой и корицей', NULL, NULL, NULL, 42.90, 42.90, NULL, '100g', true, 'available', false, NULL, NULL, 0, NOW(), NOW());

-- ПРИВЯЗКИ ПРОДУКТОВ К КАТЕГОРИЯМ
INSERT INTO product_categories (product_id, category_id) VALUES
-- Салаты (377-388) -> категория 47
(377, 47), (378, 47), (379, 47), (380, 47), (381, 47), (382, 47), (383, 47), (384, 47), (385, 47), (386, 47), (387, 47), (388, 47),
-- Горячие блюда (389-408) -> категория 48
(389, 48), (390, 48), (391, 48), (392, 48), (393, 48), (394, 48), (395, 48), (396, 48), (397, 48), (398, 48), (399, 48), (400, 48), (401, 48), (402, 48), (403, 48), (404, 48), (405, 48), (406, 48), (407, 48), (408, 48),
-- Гарниры (409-414) -> категория 49
(409, 49), (410, 49), (411, 49), (412, 49), (413, 49), (414, 49),
-- Супы (415-420) -> категория 50
(415, 50), (416, 50), (417, 50), (418, 50), (419, 50), (420, 50),
-- Выпечка и десерты (421-424) -> категория 51
(421, 51), (422, 51), (423, 51), (424, 51),
-- Пирожки (425-428) -> категория 52
(425, 52), (426, 52), (427, 52), (428, 52);

-- Основные настройки магазина
INSERT INTO store_settings (
  id, store_name, store_description, contact_phone, contact_email, 
  working_hours, delivery_fee, payment_methods, is_delivery_enabled, is_pickup_enabled,
  welcome_title, discount_badge_text, show_banner_image, 
  show_title_description, show_info_blocks, show_special_offers, show_category_menu,
  default_language, enabled_languages, header_style, banner_button_text, banner_button_link,
  modern_block1_icon, modern_block1_text, modern_block2_icon, modern_block2_text, 
  modern_block3_icon, modern_block3_text, show_whatsapp_chat, whatsapp_phone_number, whatsapp_default_message
) VALUES (
  1, 'eDAHouse', 'Заказывай свежие блюда на развес — от повседневных обедов до праздничных угощений. Быстро, удобно и по-домашнему вкусно. Попробуй!',
  '+972-50-123-4567', 'info@edahouse.com',
  '{"friday": "09:00-15:00", "monday": "09:00-21:00", "sunday": "10:00-20:00", "tuesday": "09:00-21:00", "saturday": "", "thursday": "09:00-21:00", "wednesday": "09:00-21:00"}',
  15.00, '[{"fee": 0, "name": "Наличными в магазине", "enabled": true}, {"fee": 0, "name": "Банковская карта по телефону", "enabled": true}]',
  true, true, 'О нашей еде', 'Скидка', true, true, true, true, false,
  'ru', '["ru", "he", "ar", "en"]', 'minimal', 'Смотреть каталог', '#categories',
  'Phone', '050-123-4567', 'Truck', 'Бесплатная достака от 300₪', 'ChefHat', 'Собственное производство',
  true, '+972-50-123-4567', 'Здравствуйте! Интересует ваша продукция.'
);

-- Админ пользователь (логин: admin, пароль: admin123)
INSERT INTO users (id, username, email, password, role, first_name, last_name, is_active) VALUES 
('admin-001', 'admin', 'admin@edahouse.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Администратор', 'Системы', true);

-- Обновление последовательностей
SELECT setval('categories_id_seq', 53);
SELECT setval('products_id_seq', 430);