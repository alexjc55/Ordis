import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CategoryNav from "@/components/menu/category-nav";
import ProductCard from "@/components/menu/product-card";
import CartOverlay from "@/components/cart/cart-overlay";
import { useCartStore } from "@/lib/cart";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  Search, 
  Clock, 
  Phone, 
  MapPin, 
  CreditCard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Star,
  Plus,
  Settings,
  Package,
  Users
} from "lucide-react";
import type { CategoryWithProducts, ProductWithCategory } from "@shared/schema";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const { user } = useAuth();
  const { isOpen: isCartOpen } = useCartStore();
  const { storeSettings } = useStoreSettings();

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CategoryWithProducts[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch all products for special offers and search
  const { data: allProducts = [], isLoading: allProductsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products"],
  });

  // Fetch products for selected category
  const { data: products = [], isLoading: productsLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", selectedCategoryId],
    queryFn: () => fetch(`/api/products?categoryId=${selectedCategoryId}`).then(res => res.json()),
    enabled: selectedCategoryId !== null,
  });

  // Search products
  const { data: searchResults = [], isLoading: searchLoading } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products/search", searchQuery],
    queryFn: () => fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`).then(res => res.json()),
    enabled: searchQuery.length > 2,
  });

  const selectedCategory = useMemo(() => {
    return categories.find(cat => cat.id === selectedCategoryId);
  }, [categories, selectedCategoryId]);

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategoryId(null);
  };

  // Filter and prepare products for display
  const availableProducts = (searchQuery.length > 2 ? searchResults : (selectedCategoryId === null ? allProducts : products))?.filter(product => product.isAvailable !== false) || [];
  const displayProducts = availableProducts;
  const isLoading = searchQuery.length > 2 ? searchLoading : (selectedCategoryId === null ? allProductsLoading : productsLoading);
  
  // Get special offers (products marked as special offers)
  const specialOffers = allProducts?.filter(product => product.isAvailable !== false && product.isSpecialOffer === true) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Banner Image */}
      {storeSettings?.bannerImage && storeSettings?.showBannerImage !== false && (
        <div 
          className="w-full h-32 sm:h-40 lg:h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${storeSettings.bannerImage})` }}
        />
      )}
      
      <div className="flex">
        <Sidebar 
          categories={categories || []} 
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          isLoading={categoriesLoading}
        />

        <main className={`flex-1 p-6 lg:pb-6 ${storeSettings?.showCategoryMenu !== false ? 'pb-24' : 'pb-6'}`}>
          {/* Search Bar */}
          <div className="mb-8">
            <div className="mb-6">
              {/* Title and Description */}
              {storeSettings?.showTitleDescription !== false && (
                <>
                  <h1 className="text-3xl font-poppins font-bold text-gray-900 mb-4">
                    {(() => {
                      try {
                        if (searchQuery && searchQuery.length > 2) {
                          return `Результаты поиска: "${searchQuery}"`;
                        }
                        if (selectedCategory?.name) {
                          return selectedCategory.name;
                        }
                        if (storeSettings?.welcomeTitle) {
                          return storeSettings.welcomeTitle;
                        }
                        return "eDAHouse - Домашняя еда на развес";
                      } catch (error) {
                        console.error('Error rendering title:', error);
                        return "eDAHouse - Домашняя еда на развес";
                      }
                    })()}
                  </h1>
                  
                  <p className="text-gray-600 text-lg mb-6">
                    {(() => {
                      try {
                        if (searchQuery && searchQuery.length > 2) {
                          return `Найдено ${displayProducts.length} товаров`;
                        }
                        if (selectedCategory?.description) {
                          return selectedCategory.description;
                        }
                        if (storeSettings?.storeDescription) {
                          return storeSettings.storeDescription;
                        }
                        return "Свежая домашняя еда на развес - выбирайте по вкусу";
                      } catch (error) {
                        console.error('Error rendering description:', error);
                        return "Свежая домашняя еда на развес - выбирайте по вкусу";
                      }
                    })()}
                  </p>
                </>
              )}

              {/* Compact Store Information */}
              {!selectedCategory && searchQuery.length <= 2 && storeSettings && storeSettings?.showInfoBlocks !== false && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
                  {/* Working Hours */}
                  {storeSettings?.workingHours && (
                    <Card className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm sm:text-base">Часы работы</span>
                      </div>
                      <div className="space-y-1">
                        {(() => {
                          try {
                            const workingHours = storeSettings.workingHours;
                            if (!workingHours || typeof workingHours !== 'object') {
                              return <p className="text-gray-500 text-xs">Не указаны</p>;
                            }

                            const entries = Object.entries(workingHours);
                            const dayNames: Record<string, string> = {
                              monday: 'Пн',
                              tuesday: 'Вт', 
                              wednesday: 'Ср',
                              thursday: 'Чт',
                              friday: 'Пт',
                              saturday: 'Сб',
                              sunday: 'Вс'
                            };

                            const validEntries = entries.filter(([day, hours]) => {
                              return hours && typeof hours === 'string' && hours.trim() !== '';
                            });

                            if (validEntries.length === 0) {
                              return <p className="text-gray-500 text-xs">Не указаны</p>;
                            }

                            return validEntries.slice(0, 3).map(([day, hours]) => (
                              <div key={day} className="flex justify-between text-xs sm:text-sm">
                                <span className="text-gray-600">{dayNames[day] || day}</span>
                                <span className="font-medium">{hours as string}</span>
                              </div>
                            ));
                          } catch (error) {
                            console.error('Error rendering working hours:', error);
                            return <p className="text-gray-500 text-xs">Ошибка загрузки</p>;
                          }
                        })()}
                      </div>
                    </Card>
                  )}

                  {/* Contact Information */}
                  {(storeSettings?.contactPhone || storeSettings?.contactEmail) && (
                    <Card className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <Phone className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm sm:text-base">Контакты</span>
                      </div>
                      <div className="space-y-1">
                        {storeSettings.contactPhone && (
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-600">Телефон:</span>
                            <br />
                            <span className="font-medium">{storeSettings.contactPhone}</span>
                          </div>
                        )}
                        {storeSettings.contactEmail && (
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-600">Email:</span>
                            <br />
                            <span className="font-medium">{storeSettings.contactEmail}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}

                  {/* Delivery & Payment */}
                  {(storeSettings?.deliveryInfo || storeSettings?.paymentInfo) && (
                    <Card className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <CreditCard className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm sm:text-base">Оплата и доставка</span>
                      </div>
                      <div className="space-y-2">
                        {storeSettings.deliveryInfo && (
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-600">Доставка:</span>
                            <br />
                            <span className="font-medium">{storeSettings.deliveryInfo}</span>
                          </div>
                        )}
                        {storeSettings.paymentInfo && (
                          <div className="text-xs sm:text-sm">
                            <span className="text-gray-600">Оплата:</span>
                            <br />
                            <span className="font-medium">{storeSettings.paymentInfo}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>

            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Поиск блюд..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>

          {/* Special Offers or Category View */}
          {!selectedCategory && searchQuery.length <= 2 && (
            <div>
              {/* Category Overview */}
              {categories && categories.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Package className="mr-3 h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-poppins font-bold text-gray-900">Категории</h2>
                    </div>
                    <Badge variant="default" className="bg-primary">
                      {categories.length} категорий
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {categories.map((category) => (
                      <Card 
                        key={category.id} 
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-4xl mb-3">
                            {(() => {
                              const categoryIcons: Record<string, string> = {
                                'рыба': '🐟',
                                'мясо': '🥩',
                                'овощи': '🥕',
                                'фрукты': '🍎',
                                'хлебобулочные': '🍞',
                                'молочные': '🥛',
                                'готовые блюда': '🍽️',
                                'салаты': '🥗',
                                'default': '📦'
                              };
                              const key = category.name.toLowerCase();
                              return categoryIcons[key] || categoryIcons.default;
                            })()}
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {category.description || "Вкусные блюда"}
                          </p>
                          <Badge variant="default" className="mt-2 bg-primary">
                            {category.products.length} блюд
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Special Offers Section */}
              {specialOffers.length > 0 && storeSettings?.showSpecialOffers !== false && (
                <div className="mt-12">
                  <div className="flex items-center mb-6">
                    <span className="mr-3 text-2xl">🔥</span>
                    <h2 className="text-2xl font-poppins font-bold text-gray-900">Специальные предложения</h2>
                  </div>
                  
                  {allProductsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                          <div className="w-full h-48 bg-gray-200"></div>
                          <div className="p-4 space-y-3">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Carousel
                      opts={{
                        align: "start",
                      }}
                      className="w-full"
                    >
                      <CarouselContent className="-ml-2 md:-ml-4">
                        {specialOffers.map((product) => (
                          <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                            <div className="relative">
                              <ProductCard 
                                product={product} 
                                onCategoryClick={handleCategorySelect}
                              />
                              <Badge className="absolute top-3 left-3 bg-orange-500 text-white z-10">
                                <Star className="w-3 h-3 mr-1" />
                                {storeSettings?.discountBadgeText || "Скидка"}
                              </Badge>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden md:flex" />
                      <CarouselNext className="hidden md:flex" />
                    </Carousel>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Products Grid - Show when category is selected or showing all */}
          {(selectedCategoryId !== null || searchQuery.length > 2) && (
            <div className="mb-8">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                      <div className="w-full h-48 bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onCategoryClick={handleCategorySelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Package className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    {searchQuery.length > 2 ? "Ничего не найдено" : "Нет товаров"}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery.length > 2 
                      ? `По запросу "${searchQuery}" товары не найдены`
                      : "В этой категории пока нет товаров"
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Category Navigation */}
      {storeSettings?.showCategoryMenu !== false && (
        <CategoryNav 
          categories={categories || []}
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Cart Overlay */}
      {isCartOpen && <CartOverlay />}

      {/* Admin Floating Actions */}
      {(user?.role === 'admin') && (
        <div className="fixed bottom-6 right-6 space-y-3">
          <Button
            onClick={() => window.location.href = '/admin'}
            className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}