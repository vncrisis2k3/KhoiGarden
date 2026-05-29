import { useState } from 'react'
import {
  Utensils,
  Search,
  Bell,
  Plus,
  CheckCircle,
  X,
  Check,
  ClipboardList,
  AlertCircle
} from 'lucide-react'

// Define data models
interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  category: 'mains' | 'appetizers' | 'drinks'
  imageUrl?: string
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

interface ServerStaffPortalProps {
  tables: Table[]
  setTables: React.Dispatch<React.SetStateAction<Table[]>>
  menuDatabase: Omit<OrderItem, 'quantity'>[]
  onBackToServerView: () => void
  formatPrice: (value: number) => string
}

export function ServerStaffPortal({
  tables,
  setTables,
  menuDatabase,
  onBackToServerView,
  formatPrice
}: ServerStaffPortalProps) {
  // Portal States
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  
  // Menu Order state (for placing orders)
  const [isAddMenuOpen, setIsAddMenuOpen] = useState<boolean>(false)
  const [activeCategory, setActiveCategory] = useState<'all' | 'mains' | 'appetizers' | 'drinks'>('all')
  const [menuSearchQuery, setMenuSearchQuery] = useState<string>('')
  const [orderCart, setOrderCart] = useState<{ [itemId: string]: number }>({})

  // Guest configuration when opening table
  const [newGuestCount, setNewGuestCount] = useState<number>(2)

  // Local Toast alerts
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'warning' | 'info' } | null>(null)

  const showToast = (text: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Active table object
  const activeTable = tables.find((t) => t.id === selectedTableId)

  const filteredTables = tables

  // Open a new table for dining
  const handleOpenTable = () => {
    if (!selectedTableId) return
    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTableId
          ? { ...t, status: 'DINING', guests: newGuestCount, duration: 1 }
          : t
      )
    )
    showToast(`Đã mở bàn ${activeTable?.name} cho ${newGuestCount} khách!`, 'success')
  }

  // Update specific dish status in a table's orders
  const handleUpdateDishStatus = (itemId: string, newStatus: 'pending' | 'cooking' | 'served') => {
    if (!selectedTableId) return
    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableId) return t
        
        const updatedOrders = t.orders.map((order) => {
          if (order.id === itemId) {
            return { ...order, status: newStatus }
          }
          return order
        })

        // Automatically determine table state: if all meals are served, set to DINING, else WAITING_FOOD
        const hasPendingOrCooking = updatedOrders.some((o) => o.status !== 'served')
        const nextTableStatus = updatedOrders.length === 0 
          ? 'EMPTY' 
          : hasPendingOrCooking 
            ? 'WAITING_FOOD' 
            : 'DINING'

        return {
          ...t,
          orders: updatedOrders,
          status: nextTableStatus as TableStatus
        }
      })
    )
    const dishName = activeTable?.orders.find((o) => o.id === itemId)?.name || 'Món ăn'
    const statusText = newStatus === 'served' ? 'Đã phục vụ xong' : newStatus === 'cooking' ? 'Đang chế biến' : 'Đang chờ bếp'
    showToast(`Đã báo trạng thái "${statusText}" cho món ${dishName}`, 'success')
  }

  // Add menu additions to table
  const handleAddToCart = (itemId: string) => {
    setOrderCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
  }

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setOrderCart((prev) => {
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

  // Submit cart additions to table orders
  const handleConfirmOrderAdditions = () => {
    if (!selectedTableId || Object.keys(orderCart).length === 0) return

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTableId) return t

        const updatedOrders = [...t.orders]
        Object.entries(orderCart).forEach(([itemId, qty]) => {
          const menuItem = menuDatabase.find((m) => m.id === itemId)
          if (!menuItem) return

          const existingIndex = updatedOrders.findIndex((o) => o.id === itemId)
          if (existingIndex > -1) {
            updatedOrders[existingIndex].quantity += qty
            // Reset status of added items back to pending if they were already served/cooking
            updatedOrders[existingIndex].status = 'pending'
          } else {
            updatedOrders.push({
              ...menuItem,
              quantity: qty,
              status: 'pending' // Default starts at pending
            })
          }
        })

        return {
          ...t,
          status: 'WAITING_FOOD', // Changing back to waiting for kitchen
          orders: updatedOrders
        }
      })
    )

    setOrderCart({})
    setIsAddMenuOpen(false)
    showToast('Đã gọi món mới thành công! Đơn hàng đã gửi tới Bếp.', 'success')
  }

  // Filter menu items for modal
  const filteredMenuItems = menuDatabase.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getDishImage = (item: Pick<OrderItem, 'id' | 'imageUrl'>) =>
    item.imageUrl || menuDatabase.find((menuItem) => menuItem.id === item.id)?.imageUrl

  // Summary stats for tables
  const stats = {
    total: tables.length,
    occupied: tables.filter((t) => t.status === 'DINING').length,
    waiting: tables.filter((t) => t.status === 'WAITING_FOOD').length,
    empty: tables.filter((t) => t.status === 'EMPTY').length
  }

  // Active table calculations for bottom pricing bar
  const tableOrdersSubtotal = activeTable?.orders.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0
  const tableOrdersTax = tableOrdersSubtotal * 0.08
  const tableOrdersServiceCharge = tableOrdersSubtotal * 0.05
  const tableOrdersTotal = tableOrdersSubtotal + tableOrdersTax + tableOrdersServiceCharge

  return (
    <div className="min-h-screen bg-app-bg text-[#2C3E50] antialiased flex flex-col font-sans relative selection:bg-primary selection:text-white pb-12">
      
      {/* 1. Waiter Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#C0392B]/10 shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Logo & Section Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <ClipboardList className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-primary font-serif">KHÓI BISTRO</span>
              </div>
            </div>
          </div>

          {/* Quick Statistics and Back Button */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="hidden md:flex items-center gap-3 text-[10px] font-bold">
              <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-md">TỔNG: {stats.total}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">TRỐNG: {stats.empty}</span>
              <span className="text-primary bg-[#FDEDEC] px-2 py-1 rounded-md">ĐANG ĂN: {stats.occupied}</span>
              <span className="text-amber-700 bg-amber-50 px-2 py-1 rounded-md">ĐANG CHỜ: {stats.waiting}</span>
            </div>

            <button
              onClick={onBackToServerView}
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white border border-primary text-xs font-extrabold rounded-xl uppercase transition-all active:scale-95 cursor-pointer shadow-xs"
              title="Quay lại bảng điều khiển nhân viên quản lý"
            >
              Quay lại quản lý
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Layout Workspace split */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-grow flex flex-col lg:flex-row gap-6 overflow-visible">
        
        {/* Left Side: Table Layout selector (60% width) */}
        <section className="flex-1 flex flex-col gap-4">
          
          {/* Grid Layout tables list */}
          <div className="flex-grow overflow-visible grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5 pr-1 pb-4">
            {filteredTables.map((table) => {
              const isSelected = table.id === selectedTableId
              let bgClass = 'bg-white border-black hover:border-black'
              let badgeColor = 'bg-white text-black border border-black'
              let tableTextColor = 'text-black'
              let detailLineClass = 'text-black border-black'
              let statusLabel = 'Trống'

              if (table.status === 'DINING') {
                badgeColor = 'bg-emerald-600 text-white border border-emerald-700'
                statusLabel = 'Đang ăn'
              } else if (table.status === 'WAITING_FOOD') {
                bgClass = 'bg-white border-black hover:border-black'
                badgeColor = 'bg-yellow-300 text-black border border-yellow-500'
                statusLabel = 'Đang chờ món'
              }

              return (
                <div
                  key={table.id}
                  onClick={() => {
                    setSelectedTableId(table.id)
                    if (table.status === 'EMPTY') {
                      setNewGuestCount(2)
                    }
                    setOrderCart({}) // Clear unsaved orders cart
                  }}
                  className={`border-2 rounded-2xl p-3.5 cursor-pointer relative flex flex-col justify-between text-center select-none shadow-xs transition-all duration-150 ${
                    isSelected ? 'ring-2 ring-black border-black shadow-md bg-white' : bgClass
                  }`}
                >
                  {/* Alert notification request from customers */}
                  {table.assistanceRequested && (
                    <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-6 w-6 bg-primary flex items-center justify-center shadow-md shadow-primary/30">
                        <Bell className="w-3.5 h-3.5 text-white" />
                      </span>
                    </span>
                  )}

                  <span className={`font-serif font-extrabold text-lg ${isSelected ? 'text-primary' : tableTextColor}`}>
                    {table.name}
                  </span>
                  
                  {/* section label removed - show only table name */}

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-1 rounded-md mt-2 tracking-wide self-center ${badgeColor}`}>
                    {statusLabel}
                  </span>

                  {table.status !== 'EMPTY' && (
                    <div className={`mt-2 text-xs font-mono font-bold flex justify-between border-t pt-2 ${isSelected ? 'text-black border-black' : detailLineClass}`}>
                      <span>👤 {table.guests}N</span>
                      <span>⏱️ {table.duration}p</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </section>

        {/* Active table detail opens as an overlay. */}
        {activeTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            onClick={() => {
              setSelectedTableId(null)
              setOrderCart({})
              setIsAddMenuOpen(false)
            }}
          ></div>
        <section className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white border border-[#E2D9C8]/60 rounded-3xl overflow-hidden flex flex-col shadow-premium-lg min-h-[460px]">
          
          {/* Panel Header */}
          <div className="bg-[#FAF6EE] border-b border-[#E2D9C8]/40 px-5 py-4 flex items-center justify-between text-left shrink-0">
            <div>
              <h3 className="font-extrabold text-base text-gray-800 font-serif leading-none">Chi tiết {activeTable?.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold mt-1 font-mono">
                {activeTable?.status !== 'EMPTY' && `CA DÙNG BỮA: ${activeTable?.duration} phút`}
              </p>
            </div>

            {/* Assistance clearing trigger */}
            <div className="flex items-center gap-2">
            {activeTable.assistanceRequested && (
              <button
                onClick={() => {
                  setTables((prev) =>
                    prev.map((t) => (t.id === selectedTableId ? { ...t, assistanceRequested: false } : t))
                  )
                  showToast('Đã phản hồi và tắt báo chuông hỗ trợ.', 'info')
                }}
                className="px-2.5 py-1 bg-primary hover:bg-primary-hover border border-primary text-white text-[9px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 transition-all active-press"
              >
                <Bell className="w-3 h-3 text-white animate-bounce" />
                <span>Tắt báo hỗ trợ</span>
              </button>
            )}
              <button
                onClick={() => {
                  setSelectedTableId(null)
                  setOrderCart({})
                  setIsAddMenuOpen(false)
                }}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
                title="Đóng chi tiết bàn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Panel Body: if Empty table */}
          {activeTable?.status === 'EMPTY' ? (
            <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
              <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                <Utensils className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-gray-800">Bàn này đang trống</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs leading-normal">Bàn chưa được kích hoạt. Hãy đón khách và bấm nút mở bàn ăn phía dưới để bắt đầu phục vụ gọi món.</p>

              <div className="mt-6 w-full max-w-xs space-y-4">
                <div className="flex items-center justify-between bg-[#FAF6EE] border border-[#E2D9C8] p-3.5 rounded-xl">
                  <span className="text-xs font-bold text-gray-500 uppercase font-mono">Khách ngồi</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setNewGuestCount((c) => Math.max(1, c - 1))}
                      className="h-8 w-8 bg-white border border-[#E2D9C8] text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm hover:border-primary/50"
                    >
                      -
                    </button>
                    <span className="font-bold font-mono text-sm text-gray-700 w-4 text-center">{newGuestCount}</span>
                    <button
                      onClick={() => setNewGuestCount((c) => Math.min(12, c + 1))}
                      className="h-8 w-8 bg-white border border-[#E2D9C8] text-gray-600 rounded-lg flex items-center justify-center font-bold text-sm hover:border-primary/50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleOpenTable}
                  className="w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-extrabold rounded-xl text-xs uppercase tracking-wide active-press transition-all shadow-md shadow-primary/20"
                >
                  Mở bàn & Ghi nhận khách
                </button>
              </div>
            </div>
          ) : (
            // Panel Body: if active table has orders
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              
              {/* Ordered items listing view */}
              <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-gray-100">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wider pb-2 shrink-0">
                  <span>Món ăn đã gọi</span>
                  <span>Trạng thái chế biến món</span>
                </div>

                {activeTable?.orders.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center">
                    <ClipboardList className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs font-semibold">Chưa gọi món ăn nào</p>
                    <p className="text-[10px] mt-0.5">Vui lòng click "Gọi thêm món mới" phía dưới để đặt món.</p>
                  </div>
                ) : (
                  activeTable?.orders.map((item) => {
                    const status = item.status || 'pending'
                    return (
                      <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                        <div className="flex items-center gap-3 max-w-full sm:max-w-[45%] min-w-0">
                          {getDishImage(item) && (
                            <img
                              src={getDishImage(item)}
                              alt={item.name}
                              className="h-11 w-11 rounded-lg object-cover border border-gray-100 shrink-0"
                              loading="lazy"
                            />
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-gray-800 leading-snug block">{item.name}</span>
                            <span className="text-[10px] text-gray-400 mt-0.5 font-bold font-mono">
                              {formatPrice(item.price)} x{item.quantity}
                            </span>
                          </div>
                        </div>

                        {/* Interactive status selector pills */}
                        <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 gap-0.5 shrink-0 self-start sm:self-center">
                          <button
                            onClick={() => handleUpdateDishStatus(item.id, 'pending')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                              status === 'pending'
                                ? 'bg-white text-gray-700 shadow-xs border border-gray-200'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            Chờ nấu
                          </button>
                          
                          <button
                            onClick={() => handleUpdateDishStatus(item.id, 'cooking')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                              status === 'cooking'
                                ? 'bg-[#FCF3CF] text-amber-800 shadow-xs border border-amber-200'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            Đang nấu
                          </button>
                          
                          <button
                            onClick={() => handleUpdateDishStatus(item.id, 'served')}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${
                              status === 'served'
                                ? 'bg-emerald-100 text-emerald-800 shadow-xs border border-emerald-200'
                                : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                            Đã lên
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Table calculation and Place additions trigger */}
              <div className="bg-gray-50 border-t border-gray-100 p-5 shrink-0 text-xs">
                {activeTable && activeTable.orders.length > 0 ? (
                  <div className="flex justify-between font-extrabold text-sm text-gray-800 pb-4">
                    <span>TẠM TÍNH BÀN:</span>
                    <span className="font-mono text-primary">{formatPrice(tableOrdersTotal)}</span>
                  </div>
                ) : null}

                <div className="flex gap-3">
                  {/* Place new additions */}
                  <button
                    onClick={() => {
                      setOrderCart({})
                      setIsAddMenuOpen(true)
                    }}
                    className="flex-1 min-h-[46px] bg-primary hover:bg-[#A93226] text-white font-extrabold rounded-xl text-xs uppercase tracking-wide active-press transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/25"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Gọi thêm món mới</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </section>
        </div>
        )}

      </main>

      {/* --- ADD NEW ITEMS POPUP MODAL --- */}
      {isAddMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-left">
          <div className="absolute inset-0" onClick={() => setIsAddMenuOpen(false)}></div>
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-[#C0392B]/10 shadow-premium-lg flex flex-col z-10 animate-slide-up overflow-hidden max-h-[92vh] sm:max-h-[500px]">
            
            {/* Modal Header */}
            <div className="bg-[#FAF6EE] border-b border-[#E2D9C8]/40 px-6 py-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4.5 h-4.5 text-primary" />
                <h3 className="font-extrabold text-base text-gray-800 font-serif leading-none">Gọi thêm món - Bàn {activeTable?.name}</h3>
              </div>
              
              <button
                onClick={() => setIsAddMenuOpen(false)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body split (Left: Browsing, Right: Selection list) */}
            <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Menu Browsing (65% width) */}
              <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-100 p-5">
                {/* Search & Category Pills */}
                <div className="space-y-3 pb-3 shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm đồ ăn, nước uống..."
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="search-input w-full bg-[#FAF6EE] text-xs pl-9 pr-4 py-2 rounded-xl border border-[#E2D9C8]/60 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
                    {([
                      { id: 'all', label: 'Tất cả' },
                      { id: 'mains', label: 'Món chính' },
                      { id: 'appetizers', label: 'Khai vị' },
                      { id: 'drinks', label: 'Đồ uống' }
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveCategory(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-extrabold uppercase whitespace-nowrap transition-all ${
                          activeCategory === tab.id
                            ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items Grid List */}
                <div className="flex-grow overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1 pb-2">
                  {filteredMenuItems.map((item) => {
                    const qtyInCart = orderCart[item.id] || 0
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleAddToCart(item.id)}
                        className="bg-white border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-primary/50 cursor-pointer shadow-xs transition-all active:scale-98 select-none"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {getDishImage(item) && (
                            <img
                              src={getDishImage(item)}
                              alt={item.name}
                              className="h-11 w-11 rounded-lg object-cover border border-gray-100 shrink-0"
                              loading="lazy"
                            />
                          )}
                          <div className="text-left min-w-0">
                            <span className="font-bold text-xs text-gray-800 block leading-tight">{item.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono font-bold mt-1 block">{formatPrice(item.price)}</span>
                          </div>
                        </div>

                        {qtyInCart > 0 ? (
                          <span className="h-6 px-2 bg-primary text-[#FFF8F6] text-[10px] font-bold rounded-lg flex items-center justify-center shrink-0">
                            x{qtyInCart}
                          </span>
                        ) : (
                          <div className="h-6 w-6 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 hover:bg-primary hover:text-white transition-all">
                            <Plus className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Column: Order Additions Cart summary (35% width) */}
              <div className="w-full md:w-[35%] bg-gray-50 flex flex-col justify-between overflow-hidden">
                <div className="flex-grow overflow-y-auto px-4 py-4 divide-y divide-gray-100">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-3 shrink-0">Danh sách món thêm</h4>
                  
                  {Object.keys(orderCart).length === 0 ? (
                    <div className="py-20 text-center text-gray-400">
                      <p className="text-[10px]">Chưa chọn món thêm nào.</p>
                      <p className="text-[9px] mt-0.5">Click vào các món ăn bên trái để thêm vào đây.</p>
                    </div>
                  ) : (
                    Object.entries(orderCart).map(([itemId, qty]) => {
                      const item = menuDatabase.find((m) => m.id === itemId)
                      if (!item) return null

                      return (
                        <div key={itemId} className="py-2.5 flex items-center justify-between gap-2 text-xs text-left">
                          <div className="flex items-center gap-2 min-w-0">
                            {getDishImage(item) && (
                              <img
                                src={getDishImage(item)}
                                alt={item.name}
                                className="h-8 w-8 rounded-md object-cover border border-gray-100 shrink-0"
                                loading="lazy"
                              />
                            )}
                            <span className="font-bold text-gray-700 leading-snug min-w-0">{item.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 shrink-0 bg-white border border-gray-200 rounded-lg p-0.5">
                            <button
                              onClick={() => handleUpdateCartQty(itemId, -1)}
                              className="h-5 w-5 rounded bg-gray-100 flex items-center justify-center font-extrabold text-[10px] text-gray-700"
                            >
                              -
                            </button>
                            <span className="font-bold font-mono text-[10px] w-4 text-center">{qty}</span>
                            <button
                              onClick={() => handleUpdateCartQty(itemId, 1)}
                              className="h-5 w-5 rounded bg-gray-100 flex items-center justify-center font-extrabold text-[10px] text-gray-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Submitting confirm bottom panel */}
                <div className="bg-white border-t border-gray-100 p-4 shrink-0">
                  <button
                    onClick={handleConfirmOrderAdditions}
                    disabled={Object.keys(orderCart).length === 0}
                    className="w-full min-h-[42px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs uppercase tracking-wide disabled:opacity-50 disabled:pointer-events-none active-press flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-white" />
                    <span>Xác nhận gửi bếp</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* dynamic toast Alert Container */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 border shadow-premium-lg px-4 py-3.5 rounded-xl flex items-center gap-2.5 animate-slide-up max-w-sm text-xs font-bold text-left ${
          toast.type === 'warning' ? 'bg-primary border-primary text-white' : 'bg-white border-[#C0392B]/10'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toast.type === 'warning' ? (
            <Bell className="w-5 h-5 text-white shrink-0 animate-bounce" />
          ) : (
            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0" />
          )}
          <span className={`${toast.type === 'warning' ? 'text-white' : 'text-gray-700'} leading-snug`}>{toast.text}</span>
        </div>
      )}

    </div>
  )
}
