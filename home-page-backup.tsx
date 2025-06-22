/**
 * BACKUP VERSION OF HOME PAGE - Updated June 22, 2025
 * 
 * This is a complete backup of the home page with:
 * - Multi-language support (Russian, English, Hebrew)
 * - RTL layout support for Hebrew interface with proper Swiper carousel
 * - Product filtering and search functionality
 * - Shopping cart integration
 * - Mobile-responsive design
 * - Swiper carousel with full RTL support replacing Embla
 * - Improved information block alignment and spacing
 * - All existing features and UI patterns preserved
 */

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
import { useShopTranslation, useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import CategoryNav from "@/components/menu/category-nav";
import ProductCard from "@/components/menu/product-card";
import CartSidebar from "@/components/cart/cart-sidebar";
import { useCartStore } from "@/lib/cart";
import { formatCurrency } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
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
  Users,
  Sparkles
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
  const swiperRef = useRef<any>(null);
  const { user } = useAuth();
  const { isOpen: isCartOpen, addItem } = useCartStore();
  const { storeSettings } = useStoreSettings();
  const { t } = useShopTranslation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { currentLanguage } = useLanguage();

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

  // Get selected category info
  const selectedCategory = useMemo(() => {
    if (selectedCategoryId === 0) {
      return { id: 0, name: t('allProducts'), description: t('allProductsDesc'), products: [] };
    }
    return categories.find(cat => cat.id === selectedCategoryId);
  }, [selectedCategoryId, categories, t]);

  // Handle category selection from URL
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
  
  // For swiper carousel
  const slidesPerPage = isMobile ? 1 : 3;
  const totalSlides = (storeSettings?.specialOffers || []).length;
  const totalPages = Math.ceil(totalSlides / slidesPerPage);
  
  // Handle swiper navigation
  const goToSlide = (pageIndex: number) => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const slideIndex = pageIndex * slidesPerPage;
      swiperRef.current.swiper.slideTo(slideIndex);
    }
  };

  // Get special offers with proper pricing
  const specialOffers = useMemo(() => {
    if (!storeSettings?.specialOffers || !Array.isArray(storeSettings.specialOffers)) {
      return [];
    }
    
    return storeSettings.specialOffers
      .map((offerId: number) => allProducts.find(p => p.id === offerId))
      .filter(Boolean) as ProductWithCategory[];
  }, [allProducts, storeSettings?.specialOffers]);

  // Get filtered products for search and category views
  const filteredProducts = useMemo(() => {
    let productsToFilter: ProductWithCategory[] = [];
    
    if (searchQuery.length > 2) {
      productsToFilter = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else if (selectedCategoryId === 0) {
      productsToFilter = allProducts;
    } else if (selectedCategoryId !== null && products) {
      productsToFilter = products;
    }

    // Apply category filter
    if (categoryFilter !== "all" && categoryFilter !== "") {
      const filterCategoryId = parseInt(categoryFilter);
      if (!isNaN(filterCategoryId)) {
        productsToFilter = productsToFilter.filter(product => product.categoryId === filterCategoryId);
      }
    }

    // Apply discount filter
    if (discountFilter !== "all") {
      if (discountFilter === "with_discount") {
        productsToFilter = productsToFilter.filter(product => 
          product.originalPrice && product.originalPrice > product.price
        );
      } else if (discountFilter === "no_discount") {
        productsToFilter = productsToFilter.filter(product => 
          !product.originalPrice || product.originalPrice <= product.price
        );
      }
    }

    return productsToFilter;
  }, [allProducts, products, selectedCategoryId, searchQuery, categoryFilter, discountFilter]);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: number | null) => {
    if (categoryId === null) {
      setSelectedCategoryId(null);
      navigate('/');
    } else if (categoryId === 0) {
      setSelectedCategoryId(0);
      navigate('/all-products');
    } else {
      setSelectedCategoryId(categoryId);
      navigate(`/category/${categoryId}`);
    }
    setSearchQuery(""); // Clear search when selecting category
  }, [navigate]);

  // Handle reset view
  const handleResetView = useCallback(() => {
    setSelectedCategoryId(null);
    setSearchQuery("");
    setCategoryFilter("all");
    setDiscountFilter("all");
    navigate('/');
  }, [navigate]);

  // Handle add to cart
  const handleAddToCart = useCallback((product: ProductWithCategory, quantity: number = 1) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      quantity: quantity
    });
    
    toast({
      title: t('addedToCart'),
      description: `${product.name} ${t('addedToCartDesc')}`,
    });
  }, [addItem, toast, t]);

  const isLoading = categoriesLoading || allProductsLoading || (selectedCategoryId !== null && productsLoading);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar />
      {isCartOpen && <CartSidebar />}
      
      <main className="pt-16 lg:ml-64">
        <div className="max-w-6xl mx-auto p-6">
          {/* Hero Section with Welcome Message */}
          {!selectedCategory && selectedCategoryId !== 0 && searchQuery.length <= 2 && storeSettings && (
            <div className="text-center mb-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8 shadow-sm">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {storeSettings.welcomeTitle || t('welcome')}
              </h1>
              {storeSettings.welcomeSubtitle && (
                <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
                  {storeSettings.welcomeSubtitle}
                </p>
              )}
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
                      <div className={`space-y-2 px-0 ${currentLanguage === 'he' ? 'md:mr-16 md:pl-8' : 'md:ml-16 md:pr-8'}`}>
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

                          // Filter out empty entries and sort by day order
                          const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                          const validEntries = dayOrder
                            .map(day => [day, workingHours[day]] as const)
                            .filter(([_, hours]) => hours && typeof hours === 'string' && hours.trim() !== '');

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
                      <div className={`space-y-1 px-0 ${currentLanguage === 'he' ? 'md:mr-16 md:pl-8' : 'md:ml-16 md:pr-8'}`}>
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
                      <div className={`space-y-4 flex-1 px-0 ${currentLanguage === 'he' ? 'md:mr-16 md:pl-8' : 'md:ml-16 md:pr-8'}`}>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Category Navigation */}
          {!selectedCategory && selectedCategoryId !== 0 && searchQuery.length <= 2 && (
            <CategoryNav
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={handleCategorySelect}
              className="mb-8"
            />
          )}

          {/* Special Offers Section */}
          {!selectedCategory && selectedCategoryId !== 0 && searchQuery.length <= 2 && specialOffers.length > 0 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('specialOffers')}</h2>
                </div>
                
                {/* Navigation info */}
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    {Math.min(slidesPerPage, specialOffers.length)} {t('of')} {specialOffers.length}
                  </div>
                  
                  {/* Navigation Arrows */}
                  {specialOffers.length > slidesPerPage && (
                    <div className="hidden md:flex items-center gap-2">
                      <button
                        className="swiper-button-prev-custom w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        {currentLanguage === 'he' ? 
                          <ChevronRight className="h-4 w-4" /> : 
                          <ChevronLeft className="h-4 w-4" />
                        }
                      </button>
                      <button
                        className="swiper-button-next-custom w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-sm"
                      >
                        {currentLanguage === 'he' ? 
                          <ChevronLeft className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Display */}
              {isMobile ? (
                <div className="grid grid-cols-1 gap-6">
                  {specialOffers.map((product) => (
                    <div key={product.id} className="relative">
                      <ProductCard 
                        product={product} 
                        onCategoryClick={handleCategorySelect}
                      />
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 text-xs font-medium shadow-lg">
                        {t('specialOffer')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="w-full relative">
                  <Swiper
                    key={currentLanguage}
                    ref={swiperRef}
                    modules={[Navigation, Pagination]}
                    spaceBetween={16}
                    slidesPerView={isMobile ? 1 : 3}
                    slidesPerGroup={isMobile ? 1 : 3}
                    dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
                    navigation={{
                      prevEl: '.swiper-button-prev-custom',
                      nextEl: '.swiper-button-next-custom',
                    }}
                    pagination={{
                      el: '.swiper-pagination-custom',
                      clickable: true,
                      bulletClass: 'swiper-pagination-bullet-custom',
                      bulletActiveClass: 'swiper-pagination-bullet-active-custom',
                    }}
                    onSlideChange={(swiper) => {
                      setCurrentSlide(swiper.activeIndex);
                    }}
                    className="w-full pb-12"
                  >
                    {specialOffers.map((product) => (
                      <SwiperSlide key={product.id}>
                        <div className="p-1">
                          <ProductCard 
                            product={product} 
                            onCategoryClick={handleCategorySelect}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom Pagination */}
                  {specialOffers.length > slidesPerPage && (
                    <div className="swiper-pagination-custom flex justify-center mt-6 space-x-2"></div>
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
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h2>
                    <Button
                      onClick={handleResetView}
                      variant="ghost"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {t('backToHome')}
                    </Button>
                  </div>
                  {selectedCategory.description && (
                    <p className="text-gray-600">{selectedCategory.description}</p>
                  )}
                </div>
              )}

              {/* Search Results Header */}
              {searchQuery.length > 2 && (
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('searchResults')} "{searchQuery}"
                  </h2>
                  <p className="text-gray-600">{filteredProducts.length} {t('productsFound')}</p>
                </div>
              )}

              {/* Filters */}
              {(selectedCategoryId === 0 || searchQuery.length > 2) && (
                <div className="flex flex-wrap gap-4 mb-6">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t('selectCategory')} />
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
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder={t('filterByDiscount')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('allProducts')}</SelectItem>
                      <SelectItem value="with_discount">{t('withDiscount')}</SelectItem>
                      <SelectItem value="no_discount">{t('withoutDiscount')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Products Grid */}
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
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onCategoryClick={handleCategorySelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchQuery.length > 2 ? t('noProductsFound') : t('noProductsInCategory')}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery.length > 2 
                      ? t('tryDifferentSearch') 
                      : t('selectDifferentCategory')
                    }
                  </p>
                  <Button onClick={handleResetView} variant="outline">
                    {t('backToHome')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}