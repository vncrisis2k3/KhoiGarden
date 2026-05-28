import { useState } from 'react'
import {
  ChefHat,
  Utensils,
  Flame,
  Search,
  Bell,
  ShoppingCart,
  Plus,
  CheckCircle,
  X,
  CreditCard,
  DollarSign,
  Coffee,
  HelpCircle,
  Clock,
  History,
  QrCode,
  Check,
  UserCheck
} from 'lucide-react'

// Define data models
interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  category: 'mains' | 'appetizers' | 'drinks'
  status?: 'pending' | 'cooking' | 'served'
}

type TableStatus = 'EMPTY' | 'DINING' | 'WAITING_FOOD'

interface Table {
  id: string
  name: string
  section: 'floor_1' | 'floor_2' | 'vip'
  status: TableStatus
  duration: number
  guests: number
  assistanceRequested: boolean
  orders: OrderItem[]
}

interface CustomerOrderPortalProps {
  tables: Table[]
  setTables: React.Dispatch<React.SetStateAction<Table[]>>
  menuDatabase: Omit<OrderItem, 'quantity'>[]
  onBackToServerView: () => void
  formatPrice: (value: number) => string
  defaultTableId?: string
}

export function CustomerOrderPortal({
  tables,
  setTables,
  menuDatabase,
  onBackToServerView,
  formatPrice,
  defaultTableId
}: CustomerOrderPortalProps) {
  // Portal States
  const [selectedTableId, setSelectedTableId] = useState<string>(() => {
    // 1. Try to read ?table=A3 from URL first
    const urlParams = new URLSearchParams(window.location.search)
    const tableParam = urlParams.get('table')
    if (tableParam) {
      const match = tables.find((t) => t.id.toLowerCase() === tableParam.toLowerCase())
      if (match) return match.id
    }
    // 2. Try defaultTableId passed from parent
    if (defaultTableId) {
      const match = tables.find((t) => t.id === defaultTableId)
      if (match) return match.id
    }
    // 3. Fallback to first table (usually A1)
    return tables[0]?.id || ''
  })
  const [guestCount, setGuestCount] = useState<number>(() => {
    const targetId = defaultTableId || tables[0]?.id || ''
    const table = tables.find((t) => t.id === targetId)
    return table?.guests && table.guests > 0 ? table.guests : 2
  })
  const [cart, setCart] = useState<{ [itemId: string]: number }>({})
  const [activeCategory, setActiveCategory] = useState<'all' | 'mains' | 'appetizers' | 'drinks'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false)
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false)
  const [paymentOption, setPaymentOption] = useState<'cash' | 'transfer' | null>(null)
  const [showQRSuccess, setShowQRSuccess] = useState<boolean>(false)
  const [transferConfirmed, setTransferConfirmed] = useState<boolean>(false)
  
  // Custom toast notifications for Customer view
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'warning' | 'info' | 'error' } | null>(null)

  const showToast = (text: string, type: 'success' | 'warning' | 'info' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Find active table object
  const activeTable = tables.find((t) => t.id === selectedTableId)

  // Handle table selection
  const handleSelectTable = (tableId: string) => {
    const table = tables.find((t) => t.id === tableId)
    if (table) {
      setSelectedTableId(tableId)
      setCart({})
      // If table is empty, initialize guest count
      if (table.status === 'EMPTY') {
        setGuestCount(2)
      } else {
        setGuestCount(table.guests)
      }
      showToast(`Chào mừng bạn đến với ${table.name}!`, 'success')
    }
  }

  // Handle guest count setup when entering empty table
  const handleStartDining = () => {
    if (!selectedTableId) return
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTableId
          ? { ...t, status: 'DINING', guests: guestCount, duration: 1 }
          : t
      )
    )
    showToast(`Đã mở bàn ăn cho ${guestCount} khách! Chúc quý khách ngon miệng.`, 'success')
  }

  // Cart logic
  const handleAddToCart = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
    const item = menuDatabase.find((i) => i.id === itemId)
    if (item) {
      showToast(`Đã thêm ${item.name} vào giỏ hàng.`, 'success')
    }
  }

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[itemId] || 0
      const next = current + delta
      if (next <= 0) {
        const copy = { ...prev }
        delete copy[itemId]
        return copy
      }
      return {
        ...prev,
        [itemId]: next
      }
    })
  }

  // Calculate cart costs
  const cartSubtotal = Object.entries(cart).reduce((sum, [itemId, qty]) => {
    const item = menuDatabase.find((i) => i.id === itemId)
    return sum + (item?.price || 0) * qty
  }, 0)

  const cartTax = cartSubtotal * 0.08
  const cartServiceCharge = cartSubtotal * 0.05
  const cartTotal = cartSubtotal + cartTax + cartServiceCharge

  // Table existing orders subtotal
  const tableOrdersSubtotal = activeTable?.orders.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const tableOrdersTax = tableOrdersSubtotal * 0.08
  const tableOrdersServiceCharge = tableOrdersSubtotal * 0.05
  const tableOrdersTotal = tableOrdersSubtotal + tableOrdersTax + tableOrdersServiceCharge

  // Call Staff Assistance Request
  const handleCallStaff = () => {
    if (!selectedTableId) return
    setTables((prev) =>
      prev.map((t) => (t.id === selectedTableId ? { ...t, assistanceRequested: true } : t))
    )
    showToast('Đã gửi yêu cầu gọi nhân viên. Nhân viên đang di chuyển tới bàn của bạn!', 'warning')
  }

  // Submit Order (Xác nhận & Gửi bếp)
  const handleSubmitOrder = () => {
    if (!activeTable || Object.keys(cart).length === 0) return

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableId) return t

        // Merge cart items into table orders
        const updatedOrders = [...t.orders]
        Object.entries(cart).forEach(([itemId, qty]) => {
          const menuItem = menuDatabase.find((i) => i.id === itemId)
          if (!menuItem) return

          const existingIndex = updatedOrders.findIndex((o) => o.id === itemId)
          if (existingIndex > -1) {
            updatedOrders[existingIndex].quantity += qty
          } else {
            updatedOrders.push({
              ...menuItem,
              quantity: qty
            })
          }
        })

        return {
          ...t,
          status: 'WAITING_FOOD',
          orders: updatedOrders,
          guests: t.guests > 0 ? t.guests : guestCount
        }
      })
    )

    setCart({})
    showToast('Đã gửi thực đơn xuống bếp chế biến!', 'success')
  }

  // Payment requests
  const handlePaymentCallStaff = () => {
    if (!selectedTableId) return
    setTables((prev) =>
      prev.map((t) => (t.id === selectedTableId ? { ...t, assistanceRequested: true } : t))
    )
    setIsPaymentOpen(false)
    setPaymentOption(null)
    showToast('Đã gọi nhân viên tới bàn hỗ trợ thanh toán bằng Tiền mặt / Quẹt thẻ!', 'success')
  }

  const handleConfirmQRTransfer = () => {
    setTransferConfirmed(true)
    setTimeout(() => {
      setShowQRSuccess(true)
      // Reset table back to empty after successful transfer payment
      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTableId
            ? { ...t, status: 'EMPTY', orders: [], guests: 0, duration: 0, assistanceRequested: false }
            : t
        )
      )
      setTimeout(() => {
        setIsPaymentOpen(false)
        setSelectedTableId(defaultTableId || tables[0]?.id || '') // Keep same physical table
        setPaymentOption(null)
        setTransferConfirmed(false)
        setShowQRSuccess(false)
      }, 3000)
    }, 2000)
  }

  // Filter items in menu
  const filteredMenu = menuDatabase.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mains':
        return <Flame className="w-4 h-4" />
      case 'appetizers':
        return <Utensils className="w-4 h-4" />
      case 'drinks':
        return <Coffee className="w-4 h-4" />
      default:
        return <Utensils className="w-4 h-4" />
    }
  }

  // If no table has been selected yet, show table selector splash screen
  if (!selectedTableId) {
    return (
      <div className="min-h-screen bg-[#FFF8F6] text-[#2C3E50] antialiased flex flex-col font-sans relative selection:bg-primary selection:text-white pb-12">
        {/* Decorative Top header */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#C0392B]/10 shadow-xs py-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ChefHat className="text-[#FFF8F6] w-6 h-6 animate-pulse-slow" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-xl tracking-tight text-primary font-serif">KHÓI BISTRO</span>
              <span className="block text-[8px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono mt-0.5 text-center">Tự phục vụ tại bàn</span>
            </div>
          </div>

          <button
            onClick={onBackToServerView}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl text-xs font-bold uppercase transition-all active:scale-95 cursor-pointer shadow-xs"
          >
            Quay lại nhân viên
          </button>
        </header>

        {/* Splash Body content */}
        <main className="max-w-4xl mx-auto px-6 mt-10 w-full flex-grow flex flex-col justify-center">
          <div className="text-center mb-8 max-w-xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-800 font-serif leading-tight">Chào mừng quý khách đến với Khói Bistro!</h2>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng chọn số bàn bạn đang ngồi phía dưới để mở xem thực đơn, gọi món trực tuyến và thanh toán nhanh chóng.
            </p>
          </div>

          {/* Table selection Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {tables.map((table) => {
              let statusText = 'Bàn trống'
              let colorClasses = 'border-orange-400 bg-white hover:border-orange-500'
              let textClasses = 'text-black'
              let metaTextClasses = 'text-black'

              if (table.status === 'DINING') {
                statusText = 'Đang dùng bữa'
              } else if (table.status === 'WAITING_FOOD') {
                statusText = 'Đang chờ món'
                colorClasses = 'border-orange-500 bg-white hover:border-orange-600'
              }

              return (
                <div
                  key={table.id}
                  onClick={() => handleSelectTable(table.id)}
                  className={`border-2 rounded-2xl p-4 cursor-pointer transition-all active:scale-98 select-none flex flex-col items-center justify-between text-center min-h-[110px] shadow-sm hover:shadow-md ${colorClasses}`}
                >
                  <span className={`font-serif font-extrabold text-lg block ${textClasses}`}>
                    {table.name}
                  </span>
                  <span className={`text-[10px] font-bold font-sans block mt-1 ${metaTextClasses}`}>
                    {table.section === 'floor_1' ? 'Tầng 1' : table.section === 'floor_2' ? 'Tầng 2' : 'Phòng VIP'}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md mt-2 tracking-wide inline-block ${
                    table.status === 'EMPTY' 
                      ? 'bg-white text-black border border-orange-300' 
                      : table.status === 'WAITING_FOOD'
                      ? 'bg-white text-black border border-orange-300'
                      : 'bg-white text-black border border-orange-300'
                  }`}>
                    {statusText}
                  </span>
                </div>
              )
            })}
          </div>
        </main>
      </div>
    )
  }

  // If table is selected, but not dining yet (status Empty), show guest count setup
  if (activeTable?.status === 'EMPTY') {
    return (
      <div className="min-h-screen bg-[#FFF8F6] text-[#2C3E50] antialiased flex flex-col font-sans justify-center items-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-[#C0392B]/10 shadow-premium-lg p-8 text-center animate-slide-up">
          <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
            <UserCheck className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-800 font-serif">Mở bàn {activeTable.name}</h2>
          <p className="text-xs text-gray-400 mt-1 mb-6">Chào mừng quý khách! Vui lòng chọn số khách tại bàn để chúng tôi chuẩn bị dụng cụ ăn uống chu đáo nhất.</p>

          <div className="space-y-6">
            <div className="bg-[#FAF6EE] border border-[#E2D9C8] rounded-2xl p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-600 uppercase">Số lượng khách</span>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                  className="h-10 w-10 bg-white border border-[#E2D9C8] text-gray-700 rounded-xl flex items-center justify-center hover:border-primary/50 transition-all font-extrabold text-sm active-press shadow-xs"
                >
                  -
                </button>
                <span className="text-lg font-bold text-gray-800 font-mono w-6 text-center">{guestCount}</span>
                <button
                  onClick={() => setGuestCount((c) => Math.min(12, c + 1))}
                  className="h-10 w-10 bg-white border border-[#E2D9C8] text-gray-700 rounded-xl flex items-center justify-center hover:border-primary/50 transition-all font-extrabold text-sm active-press shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleStartDining}
              className="w-full min-h-[48px] bg-primary hover:bg-[#A93226] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wide active-press transition-all shadow-md shadow-primary/20"
            >
              Xác nhận & Bắt đầu gọi món
            </button>

            <button
              onClick={onBackToServerView}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold rounded-2xl text-xs uppercase transition-all active-press mt-2 text-center"
            >
              Quay lại nhân viên
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Active customer dashboard
  return (
    <div className="min-h-screen bg-app-bg text-[#2C3E50] antialiased flex flex-col font-sans relative selection:bg-primary selection:text-white">
      
      {/* 1. Header Area with Table info and Quick Actions */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C0392B]/10 shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Table name tag & title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ChefHat className="text-[#FFF8F6] w-6 h-6" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-gray-800 font-serif">{activeTable?.name}</span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                  activeTable?.status === 'WAITING_FOOD' ? 'bg-white text-black border border-orange-300' : 'bg-white text-black border border-orange-300'
                }`}>
                  {activeTable?.status === 'WAITING_FOOD' ? 'Đang chờ món' : 'Đang chọn món'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5">Khách ngồi: <span className="text-gray-600 font-mono">{activeTable?.guests} người</span></p>
            </div>
          </div>

          {/* Quick Buttons row */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            
            {/* View history of ordered dishes */}
            {(activeTable?.orders.length ?? 0) > 0 && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 transition-all active-press"
                title="Xem món ăn đã gọi"
              >
                <History className="w-4 h-4 text-gray-500" />
                <span className="hidden sm:inline">Món đã gọi</span>
              </button>
            )}

            {/* Assistance Button (Call Staff) */}
            <button
              onClick={handleCallStaff}
              className={`px-3 py-2 border text-xs font-bold rounded-xl uppercase flex items-center justify-center gap-1.5 transition-all active-press ${
                activeTable?.assistanceRequested
                  ? 'bg-primary border-primary text-white animate-pulse'
                  : 'bg-primary hover:bg-primary-hover border-primary text-white'
              }`}
            >
              <Bell className={`w-4 h-4 text-white ${activeTable?.assistanceRequested ? 'animate-bounce' : ''}`} />
              <span>{activeTable?.assistanceRequested ? 'Đang gọi NV...' : 'Gọi phục vụ'}</span>
            </button>

            {/* Back to Staff Dashboard button */}
            <button
              onClick={onBackToServerView}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold uppercase transition-all active-press text-center"
              title="Quay lại giao diện nhân viên ca trực"
            >
              Quay lại nhân viên
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Portal Columns (Left: Menu, Right: Cart & Order) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow flex flex-col lg:flex-row gap-6 overflow-visible">
        
        {/* Left Column: Menu Browsing Workspace (65% width) */}
        <section className="flex-1 flex flex-col gap-5 overflow-visible">
          
          {/* Categories bar and Search bar */}
          <div className="bg-white border border-[#E2D9C8]/60 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row gap-4 items-center shrink-0">
            {/* Search */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Tìm món ăn ngon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full bg-[#FAF6EE] text-xs pl-9 pr-4 py-2 rounded-xl border border-[#E2D9C8] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>

            {/* Category selection */}
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {([
                { id: 'all', label: 'Tất cả' },
                { id: 'mains', label: 'Món chính' },
                { id: 'appetizers', label: 'Khai vị' },
                { id: 'drinks', label: 'Đồ uống' }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all whitespace-nowrap ${
                    activeCategory === tab.id
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-[#FAF6EE] text-gray-500 hover:text-gray-900 border border-[#E2D9C8]/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Touch-friendly Grid */}
          <div className="flex-grow overflow-visible grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-max items-start content-start gap-4 pr-1 pb-4">
            {filteredMenu.map((item) => {
              const qtyInCart = cart[item.id] || 0

              return (
                <div
                  key={item.id}
                  onClick={() => handleAddToCart(item.id)}
                  className="relative bg-white border border-[#E2D9C8]/60 rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group cursor-pointer active-press"
                >
                  {qtyInCart > 0 && (
                    <span className="absolute top-3 right-3 z-10 min-w-7 h-7 px-2 rounded-full bg-primary text-white text-xs font-extrabold font-mono flex items-center justify-center shadow-md shadow-primary/20">
                      x{qtyInCart}
                    </span>
                  )}

                  {/* Visual Category badge and Header */}
                  <div className="p-4 pr-12 text-left">
                    <span className="inline-flex items-center gap-1 text-[9px] bg-primary/5 text-primary font-bold px-2 py-0.5 rounded-md uppercase font-mono">
                      {getCategoryIcon(item.category)}
                      <span>{item.category === 'mains' ? 'Món chính' : item.category === 'appetizers' ? 'Khai vị' : 'Đồ uống'}</span>
                    </span>

                    <h4 className="font-extrabold text-sm text-gray-800 leading-tight mt-2.5 group-hover:text-primary transition-all">
                      {item.name}
                    </h4>
                    
                    <span className="text-[10px] text-gray-400 font-mono mt-1 block">Mã món: #{item.id}</span>
                  </div>

                  {/* Quantity Actions / Add To Cart bottom row */}
                  <div className="border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between shrink-0">
                    <span className="font-extrabold font-mono text-sm text-gray-800">
                      {formatPrice(item.price)}
                    </span>

                    {qtyInCart > 0 ? (
                      <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-2 py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateCartQty(item.id, -1)
                          }}
                          className="h-6 w-6 rounded-full bg-gray-100 text-gray-700 font-extrabold flex items-center justify-center hover:bg-gray-200 active:scale-90"
                        >
                          -
                        </button>
                        <span className="font-bold font-mono text-xs text-gray-800 w-4 text-center">{qtyInCart}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpdateCartQty(item.id, 1)
                          }}
                          className="h-6 w-6 rounded-full bg-gray-100 text-gray-700 font-extrabold flex items-center justify-center hover:bg-gray-200 active:scale-90"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="hidden"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm món</span>
                      </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

        </section>

        {/* Right Column: Customer Cart & Checkout Panel (35% width) */}
        <section className="w-full lg:w-[35%] bg-white border border-[#E2D9C8]/60 rounded-3xl overflow-hidden flex flex-col shadow-sm shrink-0 min-h-[450px]">
          
          {/* Cart Header details */}
          <div className="bg-[#FAF6EE] border-b border-[#E2D9C8]/40 px-5 py-4 flex items-center justify-between shrink-0 text-left">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5 text-primary" />
              <h3 className="font-extrabold text-sm text-gray-800 uppercase tracking-wide">Giỏ hàng đang chọn</h3>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md font-mono">
              {Object.values(cart).reduce((a, b) => a + b, 0)} MÓN
            </span>
          </div>

          {/* Cart item listing rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 px-5 py-3">
            {Object.keys(cart).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                <Utensils className="w-10 h-10 text-gray-300 mb-2 animate-bounce-slow" />
                <p className="text-xs font-semibold">Giỏ hàng của bạn đang trống.</p>
                <p className="text-[10px] mt-1">Vui lòng chọn các món ăn ngon từ thực đơn bên trái để thêm vào đây.</p>
              </div>
            ) : (
              Object.entries(cart).map(([itemId, qty]) => {
                const item = menuDatabase.find((i) => i.id === itemId)
                if (!item) return null

                return (
                  <div key={itemId} className="py-3 flex items-center justify-between text-xs text-left">
                    <div className="max-w-[60%] min-w-0">
                      <span className="font-bold text-gray-800 leading-snug block">{item.name}</span>
                      <span className="text-[10px] font-mono text-gray-400 block mt-0.5">{formatPrice(item.price)}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateCartQty(itemId, -1)}
                        className="h-6 w-6 rounded-full bg-gray-100 text-gray-700 font-extrabold flex items-center justify-center hover:bg-gray-200 active:scale-90"
                      >
                        -
                      </button>
                      <div className="text-xs font-mono font-bold text-gray-800">{qty}</div>
                      <button
                        onClick={() => handleUpdateCartQty(itemId, 1)}
                        className="h-6 w-6 rounded-full bg-gray-100 text-gray-700 font-extrabold flex items-center justify-center hover:bg-gray-200 active:scale-90"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Cart Pricing summary calculations and submit trigger */}
          <div className="bg-gray-50 border-t border-gray-100 p-5 shrink-0 text-xs">
            {Object.keys(cart).length > 0 ? (
              <div className="space-y-2 pb-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tạm tính món</span>
                  <span className="font-mono">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Thuế VAT (8%)</span>
                  <span className="font-mono">{formatPrice(cartTax)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Phí dịch vụ (5%)</span>
                  <span className="font-mono">{formatPrice(cartServiceCharge)}</span>
                </div>
                <div className="flex justify-between font-extrabold pt-2 border-t border-dashed border-gray-200 mt-2 text-sm text-primary">
                  <span>TỔNG CỘNG MÓN MỚI</span>
                  <span className="font-mono">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              {/* Order Submission button */}
              {Object.keys(cart).length > 0 && (
                <button
                  onClick={handleSubmitOrder}
                  className="w-full min-h-[46px] bg-primary hover:bg-[#A93226] text-white font-extrabold rounded-xl text-xs uppercase tracking-wider active-press transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Xác nhận & Gửi yêu cầu bếp</span>
                </button>
              )}

              {/* Request Final Check out button */}
              {(activeTable?.orders.length ?? 0) > 0 && (
                <button
                  onClick={() => setIsPaymentOpen(true)}
                  disabled={Object.keys(cart).length > 0} // finish ordering new stuff first
                  className="w-full min-h-[46px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider active-press transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-md shadow-emerald-200"
                  title="Yêu cầu thanh toán hóa đơn bàn này"
                >
                  <CreditCard className="w-4 h-4 text-white" />
                  <span>Yêu cầu thanh toán ({formatPrice(tableOrdersTotal)})</span>
                </button>
              )}
            </div>
          </div>

        </section>

      </main>

      {/* --- FLOATING DIALOGS & OVERLAYS --- */}

      {/* 1. MODAL: Table Dining Order History */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-left">
          <div className="absolute inset-0" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="w-full max-w-sm bg-white rounded-3xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h3 className="font-extrabold text-lg text-gray-800 font-serif">Món ăn đã gọi</h3>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Danh sách món ăn đang phục vụ tại bàn</p>
              
              <div className="max-h-[220px] overflow-y-auto divide-y divide-gray-100 pr-1">
                {activeTable?.orders.map((item) => {
                  const status = item.status || 'pending'
                  return (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs border-b border-gray-50 last:border-0">
                      <div className="text-left max-w-[60%]">
                        <span className="font-bold text-gray-800 block">{item.name}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5 block">{formatPrice(item.price)} x{item.quantity}</span>
                      </div>
                      
                      {/* Real-time Dish Status Badge */}
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full border tracking-wider flex items-center gap-1 ${
                          status === 'served'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                            : status === 'cooking'
                            ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse font-bold'
                            : 'bg-gray-100 border-gray-200 text-gray-700'
                        }`}>
                          {status === 'served' ? (
                            <>
                              <Check className="w-2.5 h-2.5" />
                              <span>Đã phục vụ</span>
                            </>
                          ) : status === 'cooking' ? (
                            <>
                              <Flame className="w-2.5 h-2.5 text-amber-500 animate-bounce" />
                              <span>Đang nấu</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-2.5 h-2.5 text-gray-400" />
                              <span>Chờ nấu</span>
                            </>
                          )}
                        </span>
                        
                        <span className="font-mono font-bold text-gray-700 shrink-0 min-w-[70px] text-right">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-dashed border-gray-200 pt-3 mt-4 text-xs space-y-1.5">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Tạm tính</span>
                  <span className="font-mono">{formatPrice(tableOrdersSubtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>VAT (8%)</span>
                  <span className="font-mono">{formatPrice(tableOrdersTax)}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Phí phục vụ (5%)</span>
                  <span className="font-mono">{formatPrice(tableOrdersServiceCharge)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-primary border-t border-dashed border-gray-200 mt-2 pt-2">
                  <span>TỔNG THANH TOÁN</span>
                  <span className="font-mono">{formatPrice(tableOrdersTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => setIsHistoryOpen(false)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs uppercase active-press mt-2"
              >
                Đóng lịch sử gọi món
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL: Table final payment options */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-left">
          <div className="absolute inset-0" onClick={() => { if (!transferConfirmed) setIsPaymentOpen(false); }}></div>
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up relative overflow-hidden">
            
            {showQRSuccess && (
              <div className="absolute inset-0 bg-white/95 z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
                </div>
                <h3 className="font-extrabold text-xl text-gray-800 font-serif">Thanh toán hoàn tất</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-xs leading-relaxed">
                  Cảm ơn quý khách đã tin tưởng và thưởng thức ẩm thực tại Khói Bistro! Giao dịch chuyển khoản của quý khách đã được đối chiếu thành công.
                </p>
                <span className="text-[10px] text-gray-400 font-mono mt-4 block">Hệ thống đang chuyển về màn hình chính...</span>
              </div>
            )}

            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">Yêu cầu thanh toán hóa đơn</h3>
              {!transferConfirmed && (
                <button
                  onClick={() => setIsPaymentOpen(false)}
                  className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-all active-press"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {!paymentOption ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Quý khách muốn thanh toán hoá đơn tổng trị giá <span className="font-extrabold text-primary font-mono text-sm">{formatPrice(tableOrdersTotal)}</span> bằng hình thức nào dưới đây?
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {/* Option Cash / Card POS */}
                  <button
                    onClick={() => setPaymentOption('cash')}
                    className="p-5 border-2 border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-primary hover:bg-[#FDEDEC]/10 transition-all active-press"
                  >
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-800 block">Tiền mặt / Quẹt thẻ</span>
                      <span className="text-[9px] text-gray-400 mt-1 block">Gọi nhân viên mang máy POS hoặc ví thối tiền tới bàn.</span>
                    </div>
                  </button>

                  {/* Option Bank QR code Transfer */}
                  <button
                    onClick={() => setPaymentOption('transfer')}
                    className="p-5 border-2 border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center gap-3 hover:border-primary hover:bg-[#FDEDEC]/10 transition-all active-press"
                  >
                    <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-gray-800 block">Chuyển khoản trực tiếp</span>
                      <span className="text-[9px] text-gray-400 mt-1 block">Quét mã VietQR và xác nhận thanh toán trực tuyến ngay.</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : paymentOption === 'cash' ? (
              <div className="space-y-5 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Bell className="w-6 h-6 animate-pulse" />
                </div>
                
                <div>
                  <h4 className="font-bold text-sm text-gray-800">Thanh toán Tiền mặt / Quẹt thẻ tại bàn</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    Vui lòng bấm nút dưới đây để gửi thông báo cho nhân viên. Phục vụ bàn hoặc thu ngân sẽ di chuyển tới bàn của bạn trong giây lát để tiến hành thủ tục thanh toán.
                  </p>
                </div>

                <div className="bg-[#FAF6EE] border border-[#E2D9C8] rounded-xl p-3 text-xs font-mono font-bold text-gray-700 flex justify-between">
                  <span>Số tiền cần trả:</span>
                  <span className="text-primary">{formatPrice(tableOrdersTotal)}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setPaymentOption(null)}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase active-press"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handlePaymentCallStaff}
                    className="flex-[1.5] py-2.5 bg-primary hover:bg-[#A93226] text-white font-extrabold rounded-xl text-xs uppercase active-press transition-all shadow-md shadow-primary/20"
                  >
                    Gọi nhân viên
                  </button>
                </div>
              </div>
            ) : (
              // Transfer Option: High fidelity custom VietQR Code
              <div className="space-y-5">
                <div className="text-center">
                  <h4 className="font-bold text-sm text-gray-800">Chuyển khoản VietQR nhận hoá đơn ngay</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Sử dụng mọi ứng dụng Mobile Banking ngân hàng quét mã QR dưới đây.</p>
                </div>

                {/* Simulated VietQR details */}
                <div className="bg-[#FAF6EE] border border-[#E2D9C8] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  {/* Mock QR Code block */}
                  <div className="h-28 w-28 bg-white border border-[#E2D9C8] rounded-xl shrink-0 p-2 flex flex-col items-center justify-between shadow-sm relative group overflow-hidden">
                    <div className="grid grid-cols-5 gap-1.5 w-full h-full">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`rounded-xs ${
                          (i % 4 === 0 || i % 7 === 1 || i % 9 === 3) && i !== 12 ? 'bg-[#2C3E50]' : 'bg-transparent'
                        }`}></div>
                      ))}
                    </div>
                    {/* Tiny bank logo placeholder center */}
                    <div className="absolute inset-0 m-auto h-7 w-7 bg-white rounded-md flex items-center justify-center border border-gray-100 p-0.5 shadow-sm">
                      <span className="text-[6px] font-extrabold text-[#C0392B] font-serif leading-none">KHÓI</span>
                    </div>
                  </div>

                  {/* Transfer Details list */}
                  <div className="text-xs space-y-1 text-left flex-1 w-full">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ngân hàng:</span>
                      <span className="font-bold text-gray-700">VietinBank (ICB)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Số tài khoản:</span>
                      <span className="font-mono font-bold text-gray-700">102888888888</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tên thụ hưởng:</span>
                      <span className="font-bold text-gray-700">NHA HANG KHOI BISTRO</span>
                    </div>
                    <div className="flex justify-between border-t border-dashed border-[#E2D9C8] pt-1.5 mt-1.5 font-bold">
                      <span className="text-gray-500">Số tiền chuyển:</span>
                      <span className="text-primary font-mono">{formatPrice(tableOrdersTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* QR scanning progress animation */}
                {transferConfirmed ? (
                  <div className="py-4 text-center space-y-2">
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-[10px] text-gray-500 font-bold">Đang kiểm tra giao dịch chuyển khoản...</p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPaymentOption(null)}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs uppercase active-press"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={handleConfirmQRTransfer}
                      className="flex-[1.5] py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase active-press transition-all shadow-md shadow-emerald-100"
                    >
                      Xác nhận đã chuyển khoản
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Local Toast Alert Container */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 border shadow-premium-lg px-4 py-3.5 rounded-xl flex items-center gap-2.5 animate-slide-up max-w-sm text-xs font-bold text-left ${
          toast.type === 'warning' ? 'bg-primary border-primary text-white' : 'bg-white border-[#C0392B]/10'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toast.type === 'warning' ? (
            <Bell className="w-5 h-5 text-white shrink-0 animate-bounce" />
          ) : toast.type === 'error' ? (
            <X className="w-5 h-5 text-primary shrink-0" />
          ) : (
            <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0" />
          )}
          <span className={`${toast.type === 'warning' ? 'text-white' : 'text-gray-700'} leading-snug`}>{toast.text}</span>
        </div>
      )}

    </div>
  )
}
