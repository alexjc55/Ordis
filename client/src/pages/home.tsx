import { useState, useMemo, useRef, useCallback, memo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useShopTranslation } from "@/hooks/use-language";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CategoryNav from "@/components/menu/category-nav";
import ProductCard from "@/components/menu/product-card";
import CartSidebar from "@/components/cart/cart-sidebar";
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
  const params = useParams();
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [discountFilter, setDiscountFilter] = useState("all");
  const carouselApiRef = useRef<any>(null);
  const { user } = useAuth();
  const { isOpen: isCartOpen } = useCartStore();
  const { storeSettings } = useStoreSettings();
  const { t } = useShopTranslation();

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

  const handleCategorySelect = useCallback((categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setSearchQuery("");
    
    // Navigate to appropriate URL
    if (categoryId === 0) {
      navigate('/all-products');
    } else if (categoryId !== null) {
      navigate(`/category/${categoryId}`);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleResetView = useCallback(() => {
    setSelectedCategoryId(null);
    setSearchQuery("");
    setCategoryFilter("all");
    setDiscountFilter("all");
    navigate('/');
  }, [navigate]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedCategoryId(null);
  }, []);

  // Special offers filtering
  const specialOffers = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    // Filter products with discounts or marked as special offers
    const offers = allProducts.filter(product => {
      return product.discount && product.discount > 0;
    });
    
    return offers.slice(0, 6); // Limit to 6 special offers
  }, [allProducts]);

  // Display products logic
  const displayProducts = useMemo(() => {
    let productsToShow: ProductWithCategory[] = [];

    if (searchQuery && searchQuery.length > 2) {
      productsToShow = searchResults;
    } else if (selectedCategoryId === 0) {
      // Show all products
      productsToShow = allProducts;
    } else if (selectedCategoryId !== null && products) {
      productsToShow = products;
    } else {
      productsToShow = [];
    }

    // Apply filters if any
    if (categoryFilter !== "all") {
      const categoryId = parseInt(categoryFilter);
      productsToShow = productsToShow.filter(product => product.categoryId === categoryId);
    }

    if (discountFilter === "discount") {
      productsToShow = productsToShow.filter(product => product.discount && product.discount > 0);
    }

    return productsToShow;
  }, [searchQuery, searchResults, selectedCategoryId, allProducts, products, categoryFilter, discountFilter]);

  // URL parameters handling
  useEffect(() => {
    const pathParts = location.split('/');
    if (pathParts[1] === 'category' && pathParts[2]) {
      const categoryId = parseInt(pathParts[2]);
      if (!isNaN(categoryId) && categoryId !== selectedCategoryId) {
        setSelectedCategoryId(categoryId);
      }
    } else if (pathParts[1] === 'all-products' && selectedCategoryId !== 0) {
      setSelectedCategoryId(0);
    } else if (pathParts[1] === '' && selectedCategoryId !== null) {
      setSelectedCategoryId(null);
    }
  }, [location, selectedCategoryId]);
  
  // Calculate total slides for carousel - simplified approach
  const totalSlides = Math.max(1, specialOffers.length);
  
  // Handle carousel navigation
  const goToSlide = (slideIndex: number) => {
    if (carouselApiRef.current) {
      carouselApiRef.current.scrollTo(slideIndex);
      setCurrentSlide(slideIndex);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden pt-16">
      <Header onResetView={handleResetView} />
      
      {/* Simple Banner Image */}
      {storeSettings?.bannerImage && storeSettings?.showBannerImage !== false && (
        <div 
          className="w-full h-32 sm:h-40 lg:h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${storeSettings.bannerImage})` }}
        />
      )}
      
      <div className="flex overflow-x-hidden">
        <Sidebar 
          categories={categories || []} 
          selectedCategoryId={selectedCategoryId}
          onCategorySelect={handleCategorySelect}
          isLoading={categoriesLoading}
        />

        <main className={`flex-1 p-6 lg:pb-6 overflow-x-hidden ${storeSettings?.showCategoryMenu !== false ? 'pb-24' : 'pb-6'}`}>
          {/* Title and Description */}
          {storeSettings?.showTitleDescription !== false && (
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                  {(() => {
                    try {
                      if (searchQuery && searchQuery.length > 2) {
                        return `${t('searchResults')}: "${searchQuery}"`;
                      }
                      if (selectedCategory?.name) {
                        return selectedCategory.name;
                      }
                      if (storeSettings?.welcomeTitle) {
                        return storeSettings.welcomeTitle;
                      }
                      return t('defaultWelcomeTitle');
                    } catch (error) {
                      console.error('Error rendering title:', error);
                      return t('defaultWelcomeTitle');
                    }
                  })()}
                </span>
              </h1>
              
              <div className="max-w-3xl mx-auto">
                <p className="text-xl sm:text-2xl text-gray-600 font-light leading-relaxed mb-8">
                  {(() => {
                    try {
                      if (searchQuery && searchQuery.length > 2) {
                        return `${t('foundItems', { count: displayProducts.length })}`;
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
                <div className="w-24 h-1 bg-gradient-to-r from-primary to-orange-500 mx-auto rounded-full"></div>
              </div>
            </div>
          )}

          {/* Special Offers Section */}
          {!selectedCategory && selectedCategoryId !== 0 && searchQuery.length <= 2 && products.filter(product => product.isSpecialOffer && product.discountValue && product.discountValue > 0).length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">{t('specialOffers')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.filter(product => product.isSpecialOffer && product.discountValue && product.discountValue > 0).slice(0, 6).map((product) => {
                  const discountValue = product.discountValue || 0;
                  const originalPrice = product.discountType === 'percentage' 
                    ? product.price / (1 - discountValue / 100)
                    : product.price + discountValue;
                  const discountPercentage = product.discountType === 'percentage'
                    ? discountValue
                    : Math.round((discountValue / originalPrice) * 100);

                  return (
                    <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white overflow-hidden">
                      <div className="relative">
                        {product.imageUrl && (
                          <div className="h-48 overflow-hidden">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-500 text-white font-bold px-3 py-1">
                            -{Math.round(discountPercentage)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(product.price)}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {formatCurrency(originalPrice)}
                            </span>
                          </div>
                          <Button 
                            onClick={() => {
                              addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                imageUrl: product.imageUrl || undefined,
                                quantity: 1
                              });
                              toast({
                                title: t('addedToCart'),
                                description: `${product.name} ${t('addedToCart')}`,
                              });
                            }}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                          >
                            {t('addToCart')}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modern Store Information Cards */}
          {!selectedCategory && selectedCategoryId !== 0 && searchQuery.length <= 2 && storeSettings && storeSettings?.showInfoBlocks !== false && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Left Column: Working Hours and Contacts */}
              <div className="space-y-6">
                {/* Working Hours */}
                {storeSettings?.workingHours && (
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-gray-800">{t('workingHours')}</span>
                      </div>
                      <div className="space-y-2">
                      {(() => {
                        try {
                          const workingHours = storeSettings.workingHours;
                          if (!workingHours || typeof workingHours !== 'object') {
                            return <p className="text-gray-500 text-xs">{t('notSpecified')}</p>;
                          }

                          const dayNames: Record<string, string> = {
                            monday: t('days.mon'),
                            tuesday: t('days.tue'), 
                            wednesday: t('days.wed'),
                            thursday: t('days.thu'),
                            friday: t('days.fri'),
                            saturday: t('days.sat'),
                            sunday: t('days.sun')
                          };

                          // Define day order based on store settings
                          const dayOrder = storeSettings?.weekStartDay === 'sunday' 
                            ? ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
                            : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                          
                          const validEntries = dayOrder
                            .filter(day => workingHours[day] && typeof workingHours[day] === 'string' && workingHours[day].trim() !== '')
                            .map(day => [day, workingHours[day]]);

                          if (validEntries.length === 0) {
                            return <p className="text-gray-500 text-xs">{t('notSpecified')}</p>;
                          }

                          // Group consecutive days with same hours
                          const groupedHours: Array<{days: string[], hours: string}> = [];
                          let currentGroup: {days: string[], hours: string} | null = null;

                          validEntries.forEach(([day, hours]) => {
                            if (currentGroup && currentGroup.hours === hours) {
                              currentGroup.days.push(day);
                            } else {
                              if (currentGroup) {
                                groupedHours.push(currentGroup);
                              }
                              currentGroup = { days: [day], hours: hours as string };
                            }
                          });

                          if (currentGroup) {
                            groupedHours.push(currentGroup);
                          }

                          return (
                            <div className="space-y-1">
                              {groupedHours.map((group, index) => {
                                const daysText = group.days.length === 1 
                                  ? dayNames[group.days[0]]
                                  : group.days.length === 2
                                  ? `${dayNames[group.days[0]]}, ${dayNames[group.days[group.days.length - 1]]}`
                                  : `${dayNames[group.days[0]]} - ${dayNames[group.days[group.days.length - 1]]}`;
                                
                                return (
                                  <div key={index} className="text-xs sm:text-sm flex justify-between">
                                    <span className="font-medium">{daysText}:</span>
                                    <span className="text-gray-600">{group.hours}</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        } catch (error) {
                          console.error('Error rendering working hours:', error);
                          return <p className="text-gray-500 text-xs">{t('loadingError')}</p>;
                        }
                      })()}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Contact Information */}
                {(storeSettings?.contactPhone || storeSettings?.contactEmail) && (
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <Phone className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-gray-800">{t('contacts')}</span>
                      </div>
                      <div className="space-y-1">
                        {storeSettings.contactPhone && (
                          <div className="text-xs sm:text-sm flex justify-between">
                            <span className="text-gray-600">{t('phone')}:</span>
                            <span className="font-medium">{storeSettings.contactPhone}</span>
                          </div>
                        )}
                        {storeSettings.contactEmail && (
                          <div className="text-xs sm:text-sm flex justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium break-all">{storeSettings.contactEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column: Delivery & Payment */}
              {(storeSettings?.deliveryInfo || storeSettings?.paymentInfo) && (
                <div className="flex">
                  <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden flex-1 flex flex-col">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-gray-800">Оплата и доставка</span>
                      </div>
                      <div className="space-y-4 flex-1">
                        {storeSettings.deliveryInfo && (
                          <div>
                            <span className="text-gray-500 text-sm font-medium block mb-2">{t('delivery')}:</span>
                            <span className="text-gray-800 font-semibold text-sm leading-relaxed">{storeSettings.deliveryInfo}</span>
                          </div>
                        )}
                        {storeSettings.paymentInfo && (
                          <div>
                            <span className="text-gray-500 text-sm font-medium block mb-2">{t('payment')}:</span>
                            <span className="text-gray-800 font-semibold text-sm leading-relaxed">{storeSettings.paymentInfo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white border-gray-300"
              />
            </div>
          </div>

          {/* Special Offers or Category View */}
          {!selectedCategory && selectedCategoryId !== 0 && searchQuery.length <= 2 && (
            <div>
              {/* Category Overview */}
              {categories && categories.length > 0 && (
                <div className="mb-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                        <Package className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {t('categories')}
                        </h2>
                        <p className="text-gray-600 font-medium">Выберите категорию блюд</p>
                      </div>
                    </div>
                    <div className="flex justify-start md:justify-end mt-6 md:mt-0">
                      <Button
                        onClick={() => setSelectedCategoryId(0)}
                        className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 !text-white hover:!text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <Package className="mr-2 h-5 w-5" />
                        {t('allProducts')}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 min-w-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                    {categories.map((category) => (
                      <Card 
                        key={category.id} 
                        className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50 overflow-hidden transform hover:scale-105"
                        onClick={() => handleCategorySelect(category.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">
                                {category.name}
                              </h3>
                              
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                {category.description || "Вкусные блюда для вашего стола"}
                              </p>
                              
                              <Badge className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm shadow-md">
                                {category.products.length} блюд
                              </Badge>
                            </div>
                            
                            <div className="flex-shrink-0 relative">
                              <div className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                                {category.icon || '📦'}
                              </div>
                              <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </div>
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
                    <div className="w-full relative">
                      <Carousel
                        opts={{
                          align: "start",
                          loop: false,
                          slidesToScroll: 1,
                        }}
                        className="w-full mx-auto"
                        setApi={(api) => {
                          carouselApiRef.current = api;
                          if (api) {
                            api.on('select', () => {
                              setCurrentSlide(api.selectedScrollSnap());
                            });
                          }
                        }}
                      >
                        <CarouselContent className="ml-0 flex items-stretch gap-2.5">
                          {specialOffers.map((product) => (
                            <CarouselItem 
                              key={product.id} 
                              className="min-w-0 shrink-0 grow-0 basis-full md:basis-1/3 flex flex-col flex-shrink-0 pl-[0px] pr-[0px]"
                            >
                              <div className="relative flex-1 flex">
                                <div className="transform scale-90 origin-center w-full relative">
                                  <ProductCard 
                                    product={product} 
                                    onCategoryClick={handleCategorySelect}
                                  />
                                  <Badge className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-orange-500 text-white z-10 text-xs">
                                    <Star className="w-2 h-2 mr-1 rtl:mr-0 rtl:ml-1" />
                                    {storeSettings?.discountBadgeText || "Скидка"}
                                  </Badge>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>

                        <CarouselPrevious className="hidden md:flex -left-12" />
                        <CarouselNext className="hidden md:flex -right-12" />
                      </Carousel>

                      {/* Custom Navigation Dots */}
                      {specialOffers.length > 1 && (
                        <div className="flex justify-center mt-6 space-x-2">
                          {[...Array(Math.ceil(specialOffers.length / 3))].map((_, index) => (
                            <button
                              key={index}
                              onClick={() => goToSlide(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                Math.floor(currentSlide / 3) === index ? 'bg-primary' : 'bg-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Category/Product List View */}
          {(selectedCategory || selectedCategoryId === 0 || searchQuery.length > 2) && (
            <div>
              {/* Category Header */}
              {selectedCategory && (
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Button
                      onClick={handleResetView}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('backToCategories')}
                    </Button>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCategory.name}</h2>
                  {selectedCategory.description && (
                    <p className="text-gray-600">{selectedCategory.description}</p>
                  )}
                </div>
              )}

              {/* Filter Controls */}
              {(selectedCategoryId === 0 || searchQuery.length <= 2) && (
                <div className="flex flex-wrap gap-4 mb-6">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('filterByCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allCategories')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={discountFilter} onValueChange={setDiscountFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('filterByDiscount')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allProducts')}</SelectItem>
                      <SelectItem value="discount">{t('onlyDiscounted')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Products Grid */}
              {(productsLoading || searchLoading) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    <Package className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery ? t('noSearchResults') : t('noProductsFound')}
                  </h3>
                  <p className="text-gray-500">
                    {searchQuery ? t('tryDifferentSearch') : t('checkBackLater')}
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

      {/* Bottom Banners */}
      {storeSettings?.showBottomBanners && (storeSettings?.bottomBanner1Url || storeSettings?.bottomBanner2Url) && (
        <div className="mt-16 mb-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Banner 1 */}
              {storeSettings?.bottomBanner1Url && (
                <div className="relative overflow-hidden rounded-lg shadow-lg group">
                  {storeSettings?.bottomBanner1Link ? (
                    <a 
                      href={storeSettings.bottomBanner1Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={storeSettings.bottomBanner1Url}
                        alt="Баннер 1"
                        className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </a>
                  ) : (
                    <img
                      src={storeSettings.bottomBanner1Url}
                      alt="Баннер 1"
                      className="w-full h-64 md:h-80 object-cover"
                    />
                  )}
                </div>
              )}

              {/* Banner 2 */}
              {storeSettings?.bottomBanner2Url && (
                <div className="relative overflow-hidden rounded-lg shadow-lg group">
                  {storeSettings?.bottomBanner2Link ? (
                    <a 
                      href={storeSettings.bottomBanner2Link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={storeSettings.bottomBanner2Url}
                        alt="Баннер 2"
                        className="w-full h-64 md:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </a>
                  ) : (
                    <img
                      src={storeSettings.bottomBanner2Url}
                      alt="Баннер 2"
                      className="w-full h-64 md:h-80 object-cover"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}