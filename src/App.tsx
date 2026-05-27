import { useState, useEffect, useRef } from 'react'
import { CashierDashboard } from './components/CashierDashboard'
import { AdminDashboard } from './components/AdminDashboard'
import { CustomerOrderPortal } from './components/CustomerOrderPortal'
import { ServerStaffPortal } from './components/ServerStaffPortal'
import {
  ChefHat,
  Flame,
  RefreshCw,
  Search,
  Users,
  Clock,
  Utensils,
  Bell,
  Plus,
  Check,
  X,
  CreditCard,
  ArrowLeftRight,
  AlertCircle,
  DollarSign,
  CheckCircle,
  HelpCircle
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
  duration: number // elapsed minutes
  guests: number
  assistanceRequested: boolean
  orders: OrderItem[]
}

interface Toast {
  id: number
  message: string
  type: 'success' | 'info' | 'error' | 'warning'
}

// Helper function to format currency as VND
const formatPrice = (value: number) => {
  return value.toLocaleString('vi-VN') + ' đ'
}

// Initial Menu Items for the Add Item panel
const MENU_DATABASE: Omit<OrderItem, 'quantity'>[] = [
  { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, category: 'mains' },
  { id: 'm2', name: 'Bún Chả Hà Nội', price: 95000, category: 'mains' },
  { id: 'm3', name: 'Mực Nướng Hạ Long', price: 185000, category: 'mains' },
  { id: 'm4', name: 'Cua Rang Trứng Muối', price: 320000, category: 'mains' },
  { id: 'm5', name: 'Thịt Kho Tàu Nồi Đất Khói', price: 165000, category: 'mains' },
  { id: 'a1', name: 'Gỏi Cuốn Tươi (3 cuốn)', price: 65000, category: 'appetizers' },
  { id: 'a2', name: 'Gỏi Ngó Sen Tôm Thịt', price: 110000, category: 'appetizers' },
  { id: 'a3', name: 'Nem Rán Giòn Cung Đình', price: 85000, category: 'appetizers' },
  { id: 'd1', name: 'Cà Phê Trứng Việt Nam', price: 45000, category: 'drinks' },
  { id: 'd2', name: 'Trà Vải Đặc Biệt', price: 45000, category: 'drinks' },
  { id: 'd3', name: 'Bia Tiger Tươi (Ly)', price: 35000, category: 'drinks' },
  { id: 'd4', name: 'Trà Đào Sả Lạnh', price: 40000, category: 'drinks' }
]

function App() {
  // App States
  const [viewMode, setViewMode] = useState<'server' | 'cashier' | 'admin' | 'customer' | 'waiter'>('server')
  const [tables, setTables] = useState<Table[]>([
    // Tầng 1 (A1 đến A12)
    { id: 'A1', name: 'Bàn A1', section: 'floor_1', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    {
      id: 'A2',
      name: 'Bàn A2',
      section: 'floor_1',
      status: 'DINING',
      duration: 45,
      guests: 4,
      assistanceRequested: false,
      orders: [
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 2, category: 'mains' },
        { id: 'a1', name: 'Gỏi Cuốn Tươi (3 cuốn)', price: 65000, quantity: 2, category: 'appetizers' },
        { id: 'd2', name: 'Trà Vải Đặc Biệt', price: 45000, quantity: 4, category: 'drinks' }
      ]
    },
    {
      id: 'A3',
      name: 'Bàn A3',
      section: 'floor_1',
      status: 'WAITING_FOOD',
      duration: 12,
      guests: 2,
      assistanceRequested: true,
      orders: [
        { id: 'm3', name: 'Mực Nướng Hạ Long', price: 185000, quantity: 1, category: 'mains' },
        { id: 'd4', name: 'Trà Đào Sả Lạnh', price: 40000, quantity: 2, category: 'drinks' }
      ]
    },
    {
      id: 'A4',
      name: 'Bàn A4',
      section: 'floor_1',
      status: 'DINING',
      duration: 72,
      guests: 3,
      assistanceRequested: false,
      orders: [
        { id: 'm5', name: 'Thịt Kho Tàu Nồi Đất Khói', price: 165000, quantity: 2, category: 'mains' },
        { id: 'a3', name: 'Nem Rán Giòn Cung Đình', price: 85000, quantity: 1, category: 'appetizers' },
        { id: 'd3', name: 'Bia Tiger Tươi (Ly)', price: 35000, quantity: 5, category: 'drinks' }
      ]
    },
    { id: 'A5', name: 'Bàn A5', section: 'floor_1', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    {
      id: 'A6',
      name: 'Bàn A6',
      section: 'floor_1',
      status: 'DINING',
      duration: 28,
      guests: 2,
      assistanceRequested: false,
      orders: [
        { id: 'm2', name: 'Bún Chả Hà Nội', price: 95000, quantity: 2, category: 'mains' },
        { id: 'd1', name: 'Cà Phê Trứng Việt Nam', price: 45000, quantity: 2, category: 'drinks' }
      ]
    },
    {
      id: 'A7',
      name: 'Bàn A7',
      section: 'floor_1',
      status: 'WAITING_FOOD',
      duration: 22,
      guests: 5,
      assistanceRequested: false,
      orders: [
        { id: 'm4', name: 'Cua Rang Trứng Muối', price: 320000, quantity: 1, category: 'mains' },
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 3, category: 'mains' },
        { id: 'a2', name: 'Gỏi Ngó Sen Tôm Thịt', price: 110000, quantity: 2, category: 'appetizers' }
      ]
    },
    { id: 'A8', name: 'Bàn A8', section: 'floor_1', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    { id: 'A9', name: 'Bàn A9', section: 'floor_1', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    {
      id: 'A10',
      name: 'Bàn A10',
      section: 'floor_1',
      status: 'DINING',
      duration: 60,
      guests: 2,
      assistanceRequested: false,
      orders: [
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 2, category: 'mains' },
        { id: 'd3', name: 'Bia Tiger Tươi (Ly)', price: 35000, quantity: 2, category: 'drinks' }
      ]
    },
    { id: 'A11', name: 'Bàn A11', section: 'floor_1', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    { id: 'A12', name: 'Bàn A12', section: 'floor_1', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },

    // Tầng 2 (B1 đến B6)
    {
      id: 'B1',
      name: 'Bàn B1',
      section: 'floor_2',
      status: 'DINING',
      duration: 50,
      guests: 2,
      assistanceRequested: false,
      orders: [
        { id: 'm2', name: 'Bún Chả Hà Nội', price: 95000, quantity: 2, category: 'mains' },
        { id: 'a1', name: 'Gỏi Cuốn Tươi (3 cuốn)', price: 65000, quantity: 1, category: 'appetizers' }
      ]
    },
    {
      id: 'B2',
      name: 'Bàn B2',
      section: 'floor_2',
      status: 'WAITING_FOOD',
      duration: 8,
      guests: 4,
      assistanceRequested: true,
      orders: [
        { id: 'm4', name: 'Cua Rang Trứng Muối', price: 320000, quantity: 2, category: 'mains' },
        { id: 'd3', name: 'Bia Tiger Tươi (Ly)', price: 35000, quantity: 6, category: 'drinks' }
      ]
    },
    { id: 'B3', name: 'Bàn B3', section: 'floor_2', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    {
      id: 'B4',
      name: 'Bàn B4',
      section: 'floor_2',
      status: 'DINING',
      duration: 110,
      guests: 3,
      assistanceRequested: false,
      orders: [
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 3, category: 'mains' },
        { id: 'd1', name: 'Cà Phê Trứng Việt Nam', price: 45000, quantity: 3, category: 'drinks' }
      ]
    },
    { id: 'B5', name: 'Bàn B5', section: 'floor_2', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    { id: 'B6', name: 'Bàn B6', section: 'floor_2', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },

    // Phòng VIP (VIP1 đến VIP4)
    {
      id: 'VIP1',
      name: 'Phòng VIP 1',
      section: 'vip',
      status: 'DINING',
      duration: 125,
      guests: 8,
      assistanceRequested: false,
      orders: [
        { id: 'm4', name: 'Cua Rang Trứng Muối', price: 320000, quantity: 4, category: 'mains' },
        { id: 'm5', name: 'Thịt Kho Tàu Nồi Đất Khói', price: 165000, quantity: 4, category: 'mains' },
        { id: 'a2', name: 'Gỏi Ngó Sen Tôm Thịt', price: 110000, quantity: 3, category: 'appetizers' },
        { id: 'd3', name: 'Bia Tiger Tươi (Ly)', price: 35000, quantity: 12, category: 'drinks' }
      ]
    },
    { id: 'VIP2', name: 'Phòng VIP 2', section: 'vip', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] },
    {
      id: 'VIP3',
      name: 'Phòng VIP 3',
      section: 'vip',
      status: 'WAITING_FOOD',
      duration: 18,
      guests: 6,
      assistanceRequested: false,
      orders: [
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 4, category: 'mains' },
        { id: 'm3', name: 'Mực Nướng Hạ Long', price: 185000, quantity: 2, category: 'mains' },
        { id: 'd2', name: 'Trà Vải Đặc Biệt', price: 45000, quantity: 6, category: 'drinks' }
      ]
    },
    { id: 'VIP4', name: 'Phòng VIP 4', section: 'vip', status: 'EMPTY', duration: 0, guests: 0, assistanceRequested: false, orders: [] }
  ])

  // UI Filtering and Searching
  const [activeFilterTab, setActiveFilterTab] = useState<'all' | 'floor_1' | 'floor_2' | 'vip'>('all')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'EMPTY' | 'DINING' | 'WAITING_FOOD'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date())

  // Modal / Bottom Sheet State
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [modalMode, setModalMode] = useState<'main' | 'add_item' | 'transfer' | 'billing'>('main')

  // Transfer Table State
  const [targetTableId, setTargetTableId] = useState<string>('')

  // Add Item Submenu States
  const [menuSearch, setMenuSearch] = useState('')
  const [menuTab, setMenuTab] = useState<'all' | 'mains' | 'appetizers' | 'drinks'>('all')

  // Billing State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'qr'>('qr')
  const [cashReceived, setCashReceived] = useState<string>('')

  // Toast System State
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdCounter = useRef(0)

  // Simulation Controls
  const [isSimulationActive, setIsSimulationActive] = useState(true)

  // Add a Toast Notification Helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' | 'warning' = 'success') => {
    const id = ++toastIdCounter.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // 1. Simulation Timer (Dynamic elapsed dining duration counting)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isSimulationActive) return

      // Increment durations for dining tables, and randomly trigger requests/food arrivals
      setTables((prevTables) =>
        prevTables.map((table) => {
          let updated = { ...table }
          
          if (table.status !== 'EMPTY') {
            updated.duration += 1
          }

          // Random assistance request trigger (1.5% chance per tick per dining table)
          if (
            table.status !== 'EMPTY' &&
            !table.assistanceRequested &&
            Math.random() < 0.015
          ) {
            updated.assistanceRequested = true
            showToast(`${table.name} yêu cầu nhân viên hỗ trợ!`, 'warning')
          }

          // Random kitchen food ready trigger (2% chance for WAITING_FOOD tables to change to DINING)
          if (table.status === 'WAITING_FOOD' && Math.random() < 0.02) {
            updated.status = 'DINING'
            showToast(`Món ăn đã sẵn sàng cho ${table.name}! Trạng thái cập nhật thành Đang ăn.`, 'success')
          }

          return updated
        })
      )
    }, 20000) // update simulation tick every 20 seconds for demonstration, normally 60000ms

    return () => clearInterval(timer)
  }, [isSimulationActive])

  // Update selected table in real-time if table list changes due to simulation
  useEffect(() => {
    if (selectedTable) {
      const activeState = tables.find((t) => t.id === selectedTable.id)
      if (activeState) {
        setSelectedTable(activeState)
      }
    }
  }, [tables, selectedTable])

  // Manual Refresh / Sync trigger
  const handleManualSync = () => {
    setIsSyncing(true)
    showToast('Đang đồng bộ đơn hàng và hệ thống POS với bếp...', 'info')
    setTimeout(() => {
      setIsSyncing(false)
      setLastSyncTime(new Date())
      showToast('Đồng bộ POS hoàn tất thành công!', 'success')
    }, 1200)
  }

  // Filter & Search Logic
  const filteredTables = tables.filter((table) => {
    const matchesFilterTab = activeFilterTab === 'all' || table.section === activeFilterTab
    const matchesStatus = statusFilter === 'ALL' || table.status === statusFilter
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          table.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilterTab && matchesStatus && matchesSearch
  })

  // POS billing mathematics
  const calculateTotal = (orders: OrderItem[]) => {
    const subtotal = orders.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const vat = subtotal * 0.08 // 8% VAT
    const serviceCharge = subtotal * 0.05 // 5% service charge
    return {
      subtotal,
      vat,
      serviceCharge,
      total: subtotal + vat + serviceCharge
    }
  }

  // --- ACTIONS IN THE MODAL ---

  // Action: Open a Table (Initial seating)
  const handleOpenTable = (tableId: string, guestsCount: number) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: 'WAITING_FOOD',
              guests: guestsCount,
              duration: 1,
              assistanceRequested: false,
              orders: []
            }
          : t
      )
    )
    showToast(`Đã mở ${tableId} với ${guestsCount} khách. Xếp bàn thành công!`, 'success')
  }

  // Action: Toggle table status directly
  const handleSetStatus = (tableId: string, newStatus: TableStatus) => {
    setTables((prev) =>
      prev.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status: newStatus,
              duration: newStatus === 'EMPTY' ? 0 : t.duration || 1,
              orders: newStatus === 'EMPTY' ? [] : t.orders,
              guests: newStatus === 'EMPTY' ? 0 : t.guests
            }
          : t
      )
    )
    showToast(`Trạng thái của ${tableId} đã chuyển thành ${newStatus}`, 'info')
  }

  // Action: Clear assistance alert
  const handleClearAssistance = (tableId: string) => {
    setTables((prev) =>
      prev.map((t) => (t.id === tableId ? { ...t, assistanceRequested: false } : t))
    )
    showToast(`Đã tắt yêu cầu hỗ trợ của ${tableId}.`, 'success')
  }

  // Action: Add Item to order
  const handleAddItemToOrder = (menuItem: Omit<OrderItem, 'quantity'>) => {
    if (!selectedTable) return

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTable.id) return t

        const existingItem = t.orders.find((o) => o.id === menuItem.id)
        let updatedOrders: OrderItem[]

        if (existingItem) {
          updatedOrders = t.orders.map((o) =>
            o.id === menuItem.id ? { ...o, quantity: o.quantity + 1 } : o
          )
        } else {
          updatedOrders = [...t.orders, { ...menuItem, quantity: 1 } as OrderItem]
        }

        // If the table was EMPTY, automatically shift status to WAITING_FOOD
        const newStatus = t.status === 'EMPTY' ? 'WAITING_FOOD' : t.status
        const newGuests = t.guests === 0 ? 2 : t.guests
        const newDuration = t.duration === 0 ? 1 : t.duration

        return {
          ...t,
          status: newStatus,
          guests: newGuests,
          duration: newDuration,
          orders: updatedOrders
        }
      })
    )

    showToast(`Đã thêm ${menuItem.name} vào ${selectedTable.name}`, 'success')
  }

  // Action: Remove / Decrease quantity of order item
  const handleDecreaseItemQuantity = (menuItemId: string) => {
    if (!selectedTable) return

    setTables((prev) =>
      prev.map((t) => {
        if (t.id !== selectedTable.id) return t

        const updatedOrders = t.orders
          .map((o) => {
            if (o.id === menuItemId) {
              return { ...o, quantity: o.quantity - 1 }
            }
            return o
          })
          .filter((o) => o.quantity > 0)

        return {
          ...t,
          orders: updatedOrders
        }
      })
    )
    showToast(`Đã giảm số lượng món ăn của ${selectedTable.name}`, 'info')
  }

  // Action: Transfer Table
  const handleTransferTableConfirm = () => {
    if (!selectedTable || !targetTableId) return

    const targetTable = tables.find((t) => t.id === targetTableId)
    if (!targetTable || targetTable.status !== 'EMPTY') {
      showToast('Bàn đích được chọn phải là bàn trống!', 'error')
      return
    }

    setTables((prev) =>
      prev.map((t) => {
        // Clear old table
        if (t.id === selectedTable.id) {
          return {
            ...t,
            status: 'EMPTY',
            duration: 0,
            guests: 0,
            assistanceRequested: false,
            orders: []
          }
        }
        // Transfer all content to new table
        if (t.id === targetTableId) {
          return {
            ...t,
            status: selectedTable.status,
            duration: selectedTable.duration,
            guests: selectedTable.guests,
            assistanceRequested: selectedTable.assistanceRequested,
            orders: selectedTable.orders
          }
        }
        return t
      })
    )

    showToast(`Đã chuyển toàn bộ món từ ${selectedTable.name} sang ${targetTable.name}!`, 'success')
    setTargetTableId('')
    setSelectedTable(null)
    setModalMode('main')
  }

  // Action: Confirm Bill Request & Settle Payment
  const handleSettlePayment = () => {
    if (!selectedTable) return

    const { total } = calculateTotal(selectedTable.orders)

    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTable.id
          ? {
              ...t,
              status: 'EMPTY',
              duration: 0,
              guests: 0,
              assistanceRequested: false,
              orders: []
            }
          : t
      )
    )

    showToast(`In hoá đơn thanh toán thành công cho ${selectedTable.name}! Đã thanh toán ${formatPrice(total)}.`, 'success')
    setSelectedTable(null)
    setModalMode('main')
    setCashReceived('')
  }

  // Section stats counting helper
  const stats = {
    total: tables.length,
    occupied: tables.filter((t) => t.status === 'DINING').length,
    waiting: tables.filter((t) => t.status === 'WAITING_FOOD').length,
    empty: tables.filter((t) => t.status === 'EMPTY').length,
    assistance: tables.filter((t) => t.assistanceRequested).length
  }

  // Add Item - Filtering database of meals
  const filteredMenuItems = MENU_DATABASE.filter((item) => {
    const matchesTab = menuTab === 'all' || item.category === menuTab
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Format dynamic last sync timestamp text
  const getSyncText = () => {
    const elapsed = Math.round((new Date().getTime() - lastSyncTime.getTime()) / 1000)
    if (elapsed < 5) return 'Vừa mới đồng bộ'
    return `Đồng bộ ${elapsed} giây trước`
  }

  // A tiny local timer to force-refresh dynamic sync text string on POS header
  const [, forceUpdate] = useState(0)
  useEffect(() => {
    const syncTextTimer = setInterval(() => {
      forceUpdate((x) => x + 1)
    }, 5000)
    return () => clearInterval(syncTextTimer)
  }, [])

  if (viewMode === 'cashier') {
    return <CashierDashboard onBackToServerView={() => setViewMode('server')} />
  }

  if (viewMode === 'admin') {
    return <AdminDashboard onBackToServerView={() => setViewMode('server')} />
  }

  if (viewMode === 'customer') {
    return (
      <CustomerOrderPortal
        tables={tables}
        setTables={setTables}
        menuDatabase={MENU_DATABASE}
        onBackToServerView={() => setViewMode('server')}
        formatPrice={formatPrice}
        defaultTableId={selectedTable?.id}
      />
    )
  }

  if (viewMode === 'waiter') {
    return (
      <ServerStaffPortal
        tables={tables}
        setTables={setTables}
        menuDatabase={MENU_DATABASE}
        onBackToServerView={() => setViewMode('server')}
        formatPrice={formatPrice}
      />
    )
  }

  return (
    <div className="min-h-screen bg-app-bg text-[#2C3E50] pb-24 relative selection:bg-primary selection:text-white antialiased flex flex-col font-sans">
      
      {/* 1. Header component */}
      <header className="sticky top-0 z-40 bg-[#FFF8F6]/90 backdrop-blur-md border-b border-[#C0392B]/10 shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Brand/Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              <ChefHat className="text-[#FFF8F6] w-6 h-6 sm:w-7 sm:h-7 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-2xl tracking-tight text-primary font-serif">KHÓI</span>
                <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-mono">Phục vụ</span>
              </div>
              <p className="text-xs text-gray-500 font-medium">Boutique Bistro Hub</p>
            </div>
          </div>

          {/* Center Search Bar for Tablet View */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm bàn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FAF6EE] text-[#2C3E50] text-sm pl-9 pr-4 py-2 rounded-xl border border-[#E2D9C8] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Server Profile & Real-time Sync Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            {/* View Switchers to Cashier & Admin Dashboard */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setViewMode('waiter')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl uppercase transition-all active:scale-95 cursor-pointer shadow-sm shadow-indigo-100"
                title="Mở màn hình phục vụ ca trực cho nhân viên"
              >
                <span>Nhân viên phục vụ</span>
              </button>
              <button
                onClick={() => setViewMode('customer')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl uppercase transition-all active:scale-95 cursor-pointer shadow-sm shadow-emerald-100"
                title="Mở màn hình tự phục vụ cho khách hàng"
              >
                <span>Khách gọi món</span>
              </button>
              <button
                onClick={() => setViewMode('cashier')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C0392B] hover:bg-[#A93226] text-white text-xs font-extrabold rounded-xl uppercase transition-all active:scale-95 cursor-pointer shadow-sm shadow-primary/20"
                title="Chuyển sang màn hình thu ngân POS"
              >
                <span>Thu ngân POS</span>
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#FAF6EE] text-gray-700 border border-[#E2D9C8] text-xs font-extrabold rounded-xl uppercase transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Chuyển sang màn hình quản lý admin"
              >
                <span>Quản lý</span>
              </button>
            </div>

            {/* Live Sync Status Pill */}
            <div 
              onClick={handleManualSync}
              className="flex items-center gap-2 bg-[#FAF6EE] border border-[#E2D9C8] px-3 py-1.5 rounded-xl cursor-pointer hover:border-primary transition-all active:bg-[#FDEDEC]"
            >
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-600 leading-none">ĐỒNG BỘ POS HOẠT ĐỘNG</p>
                <p className="text-[9px] text-gray-400 font-mono mt-0.5">{getSyncText()}</p>
              </div>
              <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ml-1 hover:text-primary transition-all ${isSyncing ? 'animate-spin text-primary' : ''}`} />
            </div>

            {/* Server Avatar and Name */}
            <div className="flex items-center gap-2.5 border-l border-gray-200 pl-3 sm:pl-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-primary/10 border-2 border-primary/20 overflow-hidden flex items-center justify-center">
                <span className="text-sm font-bold text-primary">AM</span>
              </div>
              <div className="text-left hidden sm:block">
                <h4 className="text-sm font-bold text-gray-800 leading-none">Alex Mercer</h4>
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider font-mono">QUẢN LÝ TẦNG</span>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 w-full flex-grow">
        
        {/* Dynamic Mini Dashboard Cards */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
          <div className="bg-[#FAF6EE] border border-[#E2D9C8] p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Tất cả bàn</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1">{stats.total}</h3>
            </div>
            <div className="h-9 w-9 bg-gray-200/50 rounded-xl flex items-center justify-center">
              <Utensils className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <div className="bg-[#FDEDEC] border border-[#E6B0AA] p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
            <div>
              <p className="text-xs text-primary font-bold uppercase">Đang dùng bữa</p>
              <h3 className="text-2xl font-bold text-primary mt-1">{stats.occupied}</h3>
            </div>
            <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
            <div>
              <p className="text-xs text-amber-700 font-bold uppercase">Chờ món</p>
              <h3 className="text-2xl font-bold text-amber-700 mt-1">{stats.waiting}</h3>
            </div>
            <div className="h-9 w-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="bg-white border border-[#E2D9C8] p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Bàn trống</p>
              <h3 className="text-2xl font-bold text-gray-700 mt-1">{stats.empty}</h3>
            </div>
            <div className="h-9 w-9 bg-[#FAF6EE] rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-gray-500" />
            </div>
          </div>
          <div className={`col-span-2 sm:col-span-4 lg:col-span-1 border p-3 sm:p-4 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all cursor-pointer ${stats.assistance > 0 ? 'bg-orange-50 border-orange-300 animate-pulse' : 'bg-white border-[#E2D9C8]'}`}>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase">Yêu cầu hỗ trợ</p>
              <h3 className={`text-2xl font-bold mt-1 ${stats.assistance > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
                {stats.assistance} đang gọi
              </h3>
            </div>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${stats.assistance > 0 ? 'bg-orange-200' : 'bg-gray-100'}`}>
              <Bell className={`w-5 h-5 ${stats.assistance > 0 ? 'text-orange-600 animate-bounce' : 'text-gray-400'}`} />
            </div>
          </div>
        </section>

        {/* Search & Simulation Controller for Mobile */}
        <section className="flex flex-col sm:flex-row gap-3 mb-6 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm bàn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-sm pl-9 pr-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {/* Quick status filter for mobile */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#E2D9C8] text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-primary font-medium"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="EMPTY">Trống</option>
              <option value="DINING">Đang ăn</option>
              <option value="WAITING_FOOD">Chờ món</option>
            </select>

            <button 
              onClick={() => setIsSimulationActive(!isSimulationActive)}
              className={`text-xs px-3 py-2 rounded-xl font-bold border transition-all flex items-center gap-1.5 active:scale-95 ${isSimulationActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
            >
              <div className={`w-2 h-2 rounded-full ${isSimulationActive ? 'bg-primary animate-ping' : 'bg-gray-400'}`}></div>
              Mô phỏng
            </button>
          </div>
        </section>

        {/* 2. Filter Tabs component */}
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-[#C0392B]/10 pb-4 mb-6 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            <button
              onClick={() => setActiveFilterTab('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all uppercase whitespace-nowrap active:scale-95 ${
                activeFilterTab === 'all'
                  ? 'bg-primary text-[#FFF8F6] shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border border-[#E2D9C8] hover:border-primary/50'
              }`}
            >
              Tất cả bàn
            </button>
            <button
              onClick={() => setActiveFilterTab('floor_1')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all uppercase whitespace-nowrap active:scale-95 ${
                activeFilterTab === 'floor_1'
                  ? 'bg-primary text-[#FFF8F6] shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border border-[#E2D9C8] hover:border-primary/50'
              }`}
            >
              Tầng 1 (A)
            </button>
            <button
              onClick={() => setActiveFilterTab('floor_2')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all uppercase whitespace-nowrap active:scale-95 ${
                activeFilterTab === 'floor_2'
                  ? 'bg-primary text-[#FFF8F6] shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border border-[#E2D9C8] hover:border-primary/50'
              }`}
            >
              Tầng 2 (B)
            </button>
            <button
              onClick={() => setActiveFilterTab('vip')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all uppercase whitespace-nowrap active:scale-95 ${
                activeFilterTab === 'vip'
                  ? 'bg-primary text-[#FFF8F6] shadow-md shadow-primary/20'
                  : 'bg-white text-gray-600 border border-[#E2D9C8] hover:border-primary/50'
              }`}
            >
              Phòng VIP
            </button>
          </div>

          {/* Desktop/Tablet Extra Filters */}
          <div className="hidden md:flex items-center gap-3">
            {/* Simulation toggle */}
            <button 
              onClick={() => setIsSimulationActive(!isSimulationActive)}
              className={`text-xs px-3 py-2 rounded-xl font-bold border transition-all flex items-center gap-2 hover:opacity-90 active:scale-95 ${isSimulationActive ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
              title="Kích hoạt mô phỏng thời gian ăn uống của khách, báo chuông hỗ trợ ngẫu nhiên và bếp làm xong món"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulationActive ? 'bg-primary animate-ping' : 'bg-gray-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSimulationActive ? 'bg-primary' : 'bg-gray-400'}`}></span>
              </span>
              Mô phỏng: {isSimulationActive ? 'BẬT' : 'TẮT'}
            </button>

            {/* Status Pills */}
            <div className="bg-[#FAF6EE] p-1 rounded-xl border border-[#E2D9C8] flex items-center gap-1">
              {(['ALL', 'EMPTY', 'DINING', 'WAITING_FOOD'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-white text-primary shadow-sm border border-[#E2D9C8]'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {st === 'ALL' ? 'TẤT CẢ' : st === 'EMPTY' ? 'TRỐNG' : st === 'DINING' ? 'ĐANG ĂN' : 'CHỜ MÓN'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Table Grid Matrix */}
        <section>
          {filteredTables.length === 0 ? (
            <div className="bg-white border border-[#E2D9C8] rounded-2xl p-12 text-center shadow-premium">
              <AlertCircle className="w-12 h-12 text-primary/40 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-gray-800">Không tìm thấy bàn nào khớp</h3>
              <p className="text-sm text-gray-500 mt-1">Thử cập nhật bộ lọc trạng thái hoặc tìm số bàn khác.</p>
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('ALL'); setActiveFilterTab('all'); }} 
                className="mt-4 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl active-press"
              >
                Xoá tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredTables.map((table) => {
                
                // Set status style properties according to specification
                let cardStyle = ''
                let statusLabel = ''
                let borderAnimation = ''
                
                if (table.status === 'EMPTY') {
                  cardStyle = 'bg-status-empty-bg border-status-empty-border hover:border-gray-400'
                  statusLabel = 'TRỐNG'
                } else if (table.status === 'DINING') {
                  cardStyle = 'bg-status-dining-bg border-status-dining-border hover:border-primary'
                  statusLabel = 'ĐANG ĂN'
                } else if (table.status === 'WAITING_FOOD') {
                  cardStyle = 'bg-status-waiting-bg animate-blink'
                  statusLabel = 'CHỜ MÓN'
                  borderAnimation = 'border-amber-400'
                }

                // Total order items tally count
                const itemCount = table.orders.reduce((sum, item) => sum + item.quantity, 0)
                
                return (
                  <div
                    key={table.id}
                    onClick={() => {
                      setSelectedTable(table)
                      setModalMode('main')
                    }}
                    className={`border-2 rounded-2xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-1 hover:shadow-premium-lg relative overflow-hidden select-none active:scale-95 duration-200 ${cardStyle} ${borderAnimation}`}
                  >
                    {/* Active alarm ring overlay */}
                    {table.assistanceRequested && (
                      <div className="absolute top-0 right-0 left-0 bg-orange-600 text-white text-[9px] font-extrabold uppercase py-1 px-3 flex items-center justify-center gap-1.5 animate-pulse">
                        <Bell className="w-2.5 h-2.5 animate-bounce" />
                        <span>Yêu cầu phục vụ</span>
                      </div>
                    )}

                    {/* Table ID and Guest count row */}
                    <div className="flex justify-between items-start mt-2">
                      <h3 className="font-extrabold text-xl text-gray-800 font-serif tracking-tight">
                        {table.name}
                      </h3>
                      {table.status !== 'EMPTY' && (
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xs px-2 py-0.5 rounded-lg border border-[#E2D9C8] text-[10px] font-bold text-gray-600">
                          <Users className="w-3 h-3 text-gray-400" />
                          <span>{table.guests}p</span>
                        </div>
                      )}
                    </div>

                    {/* Mid segment: Table Information summary */}
                    <div className="my-5 min-h-[40px] flex flex-col justify-center">
                      {table.status === 'EMPTY' ? (
                        <span className="text-[10px] text-gray-400 font-extrabold tracking-widest uppercase">Open Seat</span>
                      ) : (
                        <div className="text-left">
                          {/* Order list snippets preview */}
                          <p className="text-[11px] font-bold text-gray-700 truncate">
                            {table.orders.length > 0
                              ? table.orders.map((o) => `${o.quantity}x ${o.name.split(' ')[0]}`).join(', ')
                              : 'No items yet'}
                          </p>
                          {itemCount > 0 && (
                            <span className="text-[10px] bg-primary/10 text-primary font-extrabold px-1.5 py-0.5 rounded-md mt-1 inline-block">
                              {itemCount} item{itemCount > 1 ? 's' : ''} ordered
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Lower segment: Time & Status tag */}
                    <div className="flex items-center justify-between border-t border-black/5 pt-3 mt-1">
                      {/* Dining duration timer */}
                      {table.status !== 'EMPTY' ? (
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-gray-500 font-mono">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{table.duration} phút</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-gray-400">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Trống</span>
                        </div>
                      )}

                      {/* Status dot and label */}
                      <span
                        className={`text-[9px] font-extrabold px-2 py-1 rounded-lg border uppercase tracking-wider ${
                          table.status === 'EMPTY'
                            ? 'bg-gray-100 text-gray-500 border-gray-200'
                            : table.status === 'DINING'
                            ? 'bg-[#FADBD8] text-[#922B21] border-[#E6B0AA]'
                            : 'bg-[#FCF3CF] text-[#B7950B] border-[#F7DC6F]'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* 4. Quick Action Modal / Bottom Sheet */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          
          {/* Overlay click to close */}
          <div className="absolute inset-0" onClick={() => setSelectedTable(null)}></div>

          {/* Modal Box */}
          <div className="w-full sm:max-w-2xl bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-premium-lg border-t sm:border border-[#C0392B]/15 overflow-hidden z-10 animate-slide-up flex flex-col max-h-[92vh] sm:max-h-[85vh]">
            
            {/* Pull handle indicator on mobile */}
            <div className="h-1.5 w-16 bg-gray-300 rounded-full mx-auto my-3 sm:hidden"></div>

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  selectedTable.status === 'EMPTY' ? 'bg-gray-100' : 'bg-primary/10'
                }`}>
                  <Utensils className={`w-5 h-5 ${
                    selectedTable.status === 'EMPTY' ? 'text-gray-400' : 'text-primary'
                  }`} />
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-xl text-gray-800 font-serif">
                    {selectedTable.name} <span className="text-xs text-gray-400 font-sans">({selectedTable.section === 'floor_1' ? 'Tầng 1' : selectedTable.section === 'floor_2' ? 'Tầng 2' : 'Khu VIP'})</span>
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {selectedTable.status !== 'EMPTY' && (
                      <span className="text-xs font-bold text-gray-500 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Đã ngồi: {selectedTable.duration} phút trước
                      </span>
                    )}
                    {selectedTable.assistanceRequested && (
                      <span className="text-[9px] font-extrabold bg-orange-600 text-white px-2 py-0.5 rounded-md animate-pulse uppercase">
                        Cần hỗ trợ
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedTable(null)}
                className="h-10 w-10 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Interactive Modes Render */}
            
            {/* MODE 1: Main Panel Dashboard */}
            {modalMode === 'main' && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-6 flex-1 flex flex-col lg:flex-row gap-6">
                  
                  {/* Left Column: Table Details, Seating, and Status settings */}
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3">Trạng thái bàn POS</h4>
                      
                      {/* Set seating configuration */}
                      {selectedTable.status === 'EMPTY' ? (
                        <div className="bg-[#FAF6EE] border border-[#E2D9C8] rounded-2xl p-4 text-center">
                          <p className="text-xs font-semibold text-gray-600 mb-3">Sức chứa: 2 đến 6 khách</p>
                          <div className="flex items-center justify-center gap-2">
                            {[2, 3, 4, 6].map((num) => (
                              <button
                                key={num}
                                onClick={() => handleOpenTable(selectedTable.id, num)}
                                className="h-11 w-12 bg-white text-gray-800 border border-[#E2D9C8] font-bold rounded-xl hover:border-primary hover:text-primary transition-all active-press flex items-center justify-center gap-0.5 text-sm"
                              >
                                <span>{num}</span>
                                <Users className="w-3 h-3 text-gray-400" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {(['EMPTY', 'DINING', 'WAITING_FOOD'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleSetStatus(selectedTable.id, status)}
                              className={`py-3 px-2 rounded-xl text-[10px] font-extrabold uppercase border text-center transition-all active-press ${
                                selectedTable.status === status
                                  ? status === 'EMPTY'
                                    ? 'bg-gray-100 text-gray-500 border-gray-300'
                                    : status === 'DINING'
                                    ? 'bg-status-dining-bg text-status-dining-text border-[#E6B0AA]'
                                    : 'bg-status-waiting-bg text-status-waiting-text border-[#F7DC6F] shadow-inner'
                                  : 'bg-white border-[#E2D9C8] text-gray-600 hover:border-primary/50'
                              }`}
                            >
                              {status === 'EMPTY' ? 'TRỐNG' : status === 'DINING' ? 'ĐANG ĂN' : 'CHỜ MÓN'}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Table Details Info Block */}
                    <div className="bg-[#FAF6EE]/50 border border-[#E2D9C8]/65 rounded-2xl p-4 mt-2">
                      <h4 className="text-xs font-bold text-gray-700 uppercase mb-2">Tổng quan phục vụ</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                          <span className="text-gray-400 block text-[9px] font-bold uppercase">Số khách ngồi</span>
                          <span className="text-sm font-bold text-gray-800 font-mono">{selectedTable.guests || 'Không'}</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-gray-100">
                          <span className="text-gray-400 block text-[9px] font-bold uppercase">Thời gian ngồi</span>
                          <span className="text-sm font-bold text-gray-800 font-mono">{selectedTable.status === 'EMPTY' ? '--' : `${selectedTable.duration} phút`}</span>
                        </div>
                      </div>

                      {/* Assistance Alert Banner */}
                      {selectedTable.assistanceRequested && (
                        <div className="bg-orange-50 border border-orange-200 text-orange-800 rounded-xl p-3 mt-3 flex items-start gap-2.5">
                          <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                          <div className="text-left">
                            <p className="text-xs font-bold leading-tight">Yêu cầu nhân viên hỗ trợ!</p>
                            <p className="text-[10px] text-orange-600 mt-0.5">Khách đã nhấn chuông báo động POS. Tắt chuông này sau khi phục vụ.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Ordered Items List & pricing summary */}
                  <div className="flex-1 bg-[#FAF6EE]/30 border border-[#E2D9C8]/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                        <span>Món ăn đã gọi</span>
                        <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          {selectedTable.orders.reduce((sum, i) => sum + i.quantity, 0)} món
                        </span>
                      </h4>

                      {/* Orders scrolling area */}
                      <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2.5">
                        {selectedTable.orders.length === 0 ? (
                          <div className="text-center py-12 text-gray-400">
                            <Utensils className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-xs font-medium">Chưa gọi món nào.</p>
                          </div>
                        ) : (
                          selectedTable.orders.map((item) => (
                            <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-between shadow-sm">
                              <div className="text-left max-w-[65%]">
                                <p className="text-xs font-bold text-gray-800 leading-tight">{item.name}</p>
                                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                                  {formatPrice(item.price)} / món
                                </span>
                              </div>
                              
                              {/* Quantity Adjustment buttons (touch-friendly min 44px clickable areas) */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleDecreaseItemQuantity(item.id)}
                                  className="h-8 w-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all font-extrabold text-sm"
                                  title="Giảm số lượng"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold font-mono text-gray-800 w-4 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleAddItemToOrder(item)}
                                  className="h-8 w-8 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-200 active:scale-90 transition-all font-extrabold text-sm"
                                  title="Tăng số lượng"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Receipt Cost Tally */}
                    {selectedTable.orders.length > 0 && (
                      <div className="border-t border-[#E2D9C8] pt-3 mt-4">
                        <div className="flex justify-between text-xs text-gray-500 font-medium my-0.5">
                          <span>Tạm tính</span>
                          <span className="font-mono">{formatPrice(calculateTotal(selectedTable.orders).subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-medium my-0.5">
                          <span>VAT (8%) & Phí dịch vụ (5%)</span>
                          <span className="font-mono">
                            {formatPrice(calculateTotal(selectedTable.orders).vat + calculateTotal(selectedTable.orders).serviceCharge)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-extrabold text-gray-800 pt-2 border-t border-dashed border-gray-200 mt-2">
                          <span>Tổng cộng</span>
                          <span className="text-primary font-mono">{formatPrice(calculateTotal(selectedTable.orders).total)}</span>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Main Action Buttons Grid (Touch-friendly minimum 44px height) */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end">
                  
                  {/* Action 1: Transfer Table */}
                  <button
                    onClick={() => {
                      setModalMode('transfer')
                      setTargetTableId('')
                    }}
                    disabled={selectedTable.status === 'EMPTY'}
                    className="min-h-[44px] flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none active-press"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-gray-500" />
                    <span>Chuyển bàn</span>
                  </button>

                  {/* Action 2: Assistance Cleared */}
                  <button
                    onClick={() => handleClearAssistance(selectedTable.id)}
                    disabled={!selectedTable.assistanceRequested}
                    className="min-h-[44px] flex-1 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold rounded-xl text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none active-press"
                  >
                    <Bell className="w-4 h-4 text-emerald-600" />
                    <span>Tắt báo chuông</span>
                  </button>

                  {/* Action 3: Add Item */}
                  <button
                    onClick={() => setModalMode('add_item')}
                    className="min-h-[44px] flex-1 bg-white hover:bg-[#FDEDEC] border border-[#E6B0AA] text-primary font-bold rounded-xl text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center gap-2 active:scale-95 active-press"
                  >
                    <Plus className="w-4.5 h-4.5 text-primary" />
                    <span>Thêm món</span>
                  </button>

                  {/* Action 4: Request Bill */}
                  <button
                    onClick={() => setModalMode('billing')}
                    disabled={selectedTable.orders.length === 0}
                    className="min-h-[44px] flex-[1.5] bg-primary hover:bg-[#A93226] text-[#FFF8F6] font-bold rounded-xl text-xs sm:text-sm tracking-wide uppercase shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none active-press"
                  >
                    <CreditCard className="w-4.5 h-4.5 text-white" />
                    <span>Yêu cầu thanh toán</span>
                  </button>

                </div>
              </div>
            )}

            {/* MODE 2: Add Item (POSIX Digital POS ordering) */}
            {modalMode === 'add_item' && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Search and Category pills */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="text"
                      placeholder="Tìm món ăn hoặc thức uống..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="w-full bg-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-1.5 mt-3 overflow-x-auto no-scrollbar">
                    {([
                      { id: 'all', label: 'Tất cả danh mục' },
                      { id: 'mains', label: 'Món chính' },
                      { id: 'appetizers', label: 'Khai vị' },
                      { id: 'drinks', label: 'Đồ uống' }
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setMenuTab(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all uppercase ${
                          menuTab === tab.id
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-500 border border-gray-200 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items Grid Matrix */}
                <div className="p-6 flex-1 max-h-[300px] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredMenuItems.map((item) => {
                    const quantityInCurrent = selectedTable.orders.find((o) => o.id === item.id)?.quantity || 0

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleAddItemToOrder(item)}
                        className={`border rounded-xl p-3 flex items-center justify-between hover:border-primary/50 cursor-pointer active:scale-98 transition-all select-none ${
                          quantityInCurrent > 0 ? 'bg-[#FDEDEC] border-[#E6B0AA]' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="text-left">
                          <p className="text-xs font-bold text-gray-800 leading-tight">{item.name}</p>
                          <span className="text-[10px] text-primary font-mono font-bold mt-1 block">
                            {formatPrice(item.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {quantityInCurrent > 0 && (
                            <span className="bg-primary text-[#FFF8F6] text-[10px] font-extrabold h-6 px-2 rounded-lg flex items-center justify-center font-mono">
                              {quantityInCurrent} phần
                            </span>
                          )}
                          <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all">
                            <Plus className="w-4 h-4 text-primary hover:text-white" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Close Bottom Buttons */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">
                    Thêm món trực tiếp vào {selectedTable.name}
                  </span>
                  <button
                    onClick={() => setModalMode('main')}
                    className="min-h-[44px] px-6 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press"
                  >
                    Hoàn tất chọn món
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: Transfer Table Overlay */}
            {modalMode === 'transfer' && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-2xl p-4 text-xs text-left mb-5 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0" />
                      <div>
                        <p className="font-bold">Chuyển bàn phục vụ</p>
                        <p className="mt-0.5">Hành động này sẽ chuyển toàn bộ khách, bộ đếm giờ hoạt động và các món ăn đã gọi từ {selectedTable.name} sang bàn trống được chọn.</p>
                      </div>
                    </div>

                    <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 text-left">
                      Chọn bàn trống đích
                    </h4>

                    {/* Empty tables buttons selection grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                      {tables
                        .filter((t) => t.status === 'EMPTY')
                        .map((emptyTable) => (
                          <button
                            key={emptyTable.id}
                            onClick={() => setTargetTableId(emptyTable.id)}
                            className={`min-h-[44px] py-2 px-3 border rounded-xl font-extrabold text-xs transition-all active-press ${
                              targetTableId === emptyTable.id
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-white border-[#E2D9C8] text-gray-700 hover:border-primary/50'
                            }`}
                          >
                            {emptyTable.name}
                          </button>
                        ))}
                      
                      {tables.filter((t) => t.status === 'EMPTY').length === 0 && (
                        <p className="col-span-3 sm:col-span-4 py-8 text-center text-xs text-gray-400 font-bold">
                          Tất cả các bàn đều đã có khách! Không có bàn trống.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-8">
                    <button
                      onClick={() => setModalMode('main')}
                      className="min-h-[44px] flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase active-press"
                    >
                      Quay lại
                    </button>
                    
                    <button
                      onClick={handleTransferTableConfirm}
                      disabled={!targetTableId}
                      className="min-h-[44px] flex-[1.5] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide disabled:opacity-50 disabled:pointer-events-none active-press flex items-center justify-center gap-2"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-white" />
                      <span>Xác nhận chuyển</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MODE 4: Billing POS Receipt printing */}
            {modalMode === 'billing' && (
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-6 flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left: Interactive Payment Settings */}
                  <div className="flex flex-col justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-3 text-left">
                        Chọn phương thức thanh toán
                      </h4>

                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { id: 'qr', label: 'Chuyển khoản VietQR', icon: Flame },
                          { id: 'card', label: 'Thẻ tín dụng', icon: CreditCard },
                          { id: 'cash', label: 'Tiền mặt', icon: DollarSign }
                        ] as const).map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setPaymentMethod(method.id)}
                            className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 text-center transition-all active-press ${
                              paymentMethod === method.id
                                ? 'bg-primary/5 text-primary border-primary shadow-sm'
                                : 'bg-white border-[#E2D9C8] text-gray-600 hover:border-primary/50'
                            }`}
                          >
                            <method.icon className="w-5 h-5 shrink-0" />
                            <span className="text-[10px] font-extrabold uppercase leading-tight">{method.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Cash calculator if cash selected */}
                      {paymentMethod === 'cash' && (
                        <div className="mt-4 bg-[#FAF6EE] border border-[#E2D9C8] rounded-xl p-3.5 text-left">
                          <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">
                            Tiền khách đưa (VNĐ)
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 font-bold text-gray-400">đ</span>
                            <input
                              type="number"
                              placeholder="0"
                              value={cashReceived}
                              onChange={(e) => setCashReceived(e.target.value)}
                              className="w-full bg-white text-sm pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono font-bold"
                            />
                          </div>

                          {parseFloat(cashReceived) > 0 && (
                            <div className="mt-2.5 flex items-center justify-between text-xs font-bold text-gray-600 border-t border-dashed border-[#E2D9C8] pt-2">
                              <span>Tiền thừa:</span>
                              <span className="font-mono text-emerald-600 font-bold">
                                {formatPrice(Math.max(0, parseFloat(cashReceived) - calculateTotal(selectedTable.orders).total))}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* QR Display if QR selected */}
                      {paymentMethod === 'qr' && (
                        <div className="mt-4 bg-[#FDEDEC]/30 border border-[#E6B0AA]/40 rounded-xl p-3 text-center flex items-center gap-3">
                          {/* Mock QR box */}
                          <div className="h-16 w-16 bg-white border border-[#E2D9C8] rounded-lg shrink-0 flex flex-wrap items-center justify-center p-1.5 shadow-sm">
                            <div className="grid grid-cols-4 gap-1 w-full h-full">
                              {Array.from({ length: 16 }).map((_, i) => (
                                <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 2 ? 'bg-primary' : 'bg-transparent'}`}></div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="text-left">
                            <p className="text-xs font-bold text-gray-800">Quét mã để thanh toán</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Mã VietQR giả lập được tạo ngay lập tức. Thu ngân sẽ tự động xác nhận thông báo nhận tiền.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FAF6EE]/50 border border-[#E2D9C8]/40 rounded-xl p-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-gray-400 shrink-0" />
                      <span className="text-[10px] text-gray-500 text-left leading-normal">
                        Để thanh toán bàn này, hãy xác nhận thanh toán và in hoá đơn. Bàn ăn sẽ được chuyển về trạng thái trống.
                      </span>
                    </div>
                  </div>

                  {/* Right: Mock Printed Bill Receipt */}
                  <div className="bg-[#FAF6EE] border-2 border-dashed border-[#E2D9C8] rounded-2xl p-4 font-mono text-xs flex flex-col justify-between shadow-inner">
                    <div className="text-center border-b border-dashed border-gray-300 pb-3">
                      <span className="font-extrabold text-base tracking-widest text-[#C0392B]">KHÓI BISTRO</span>
                      <p className="text-[9px] text-gray-400 font-sans mt-0.5">38 Phố Cổ Hà Nội, Việt Nam</p>
                      <div className="flex justify-between items-center text-[9px] text-gray-500 font-sans mt-2.5">
                        <span>Mã HĐ: #{selectedTable.id}-{Math.floor(Math.random() * 9000 + 1000)}</span>
                        <span>Ngày: 2026-05-27</span>
                      </div>
                    </div>

                    {/* Receipt line items */}
                    <div className="py-4 space-y-2 max-h-[140px] overflow-y-auto">
                      {selectedTable.orders.map((item) => (
                        <div key={item.id} className="flex justify-between items-start text-gray-700">
                          <span className="text-left w-[65%]">
                            {item.name} <span className="text-gray-400">x{item.quantity}</span>
                          </span>
                          <span className="text-right shrink-0">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-dashed border-gray-300 pt-3 text-[10px] text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Tạm tính món</span>
                        <span>{formatPrice(calculateTotal(selectedTable.orders).subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Thuế VAT (8%)</span>
                        <span>{formatPrice(calculateTotal(selectedTable.orders).vat)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phí dịch vụ (5%)</span>
                        <span>{formatPrice(calculateTotal(selectedTable.orders).serviceCharge)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-primary border-t border-dashed border-gray-300 pt-2 mt-2">
                        <span>TỔNG CỘNG</span>
                        <span>{formatPrice(calculateTotal(selectedTable.orders).total)}</span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setModalMode('main')}
                    className="min-h-[44px] flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase active-press"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={handleSettlePayment}
                    className="min-h-[44px] flex-[1.5] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 active-press"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>In & Thanh toán</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Interactive Toast Notification Portal Container */}
      <div className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 sm:w-96 z-50 flex flex-col gap-2.5">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border text-xs font-bold text-left flex items-start gap-3 animate-slide-up duration-150 ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : toast.type === 'warning'
                ? 'bg-orange-50 border-orange-200 text-orange-800 animate-pulse'
                : toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : toast.type === 'warning' ? (
              <Bell className="w-5 h-5 text-orange-600 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <RefreshCw className="w-5 h-5 text-indigo-600 shrink-0 animate-spin" />
            )}
            <div className="flex-1">
              <p className="leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-gray-600 font-extrabold text-sm ml-2.5"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Floating Bottom Navigator for Servers on Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFF8F6]/95 backdrop-blur-md border-t border-[#C0392B]/10 py-3.5 px-6 shadow-lg flex items-center justify-around sm:hidden">
        <button 
          onClick={() => { setActiveFilterTab('all'); setStatusFilter('ALL'); }}
          className="flex flex-col items-center gap-1.5 text-gray-500 focus:text-primary transition-all active:scale-90"
        >
          <Utensils className="w-5 h-5" />
          <span className="text-[10px] font-bold">TẤT CẢ BÀN</span>
        </button>

        <button 
          onClick={() => { setActiveFilterTab('vip'); }}
          className="flex flex-col items-center gap-1.5 text-gray-500 focus:text-primary transition-all active:scale-90"
        >
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="text-[10px] font-bold">PHÒNG VIP</span>
        </button>

        <div className="relative -top-5">
          <button 
            onClick={handleManualSync}
            className="h-12 w-12 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25 border-4 border-white text-white active:scale-95 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <button 
          onClick={() => { setStatusFilter('WAITING_FOOD'); }}
          className="flex flex-col items-center gap-1.5 text-gray-500 focus:text-primary transition-all active:scale-90"
        >
          <Clock className="w-5 h-5 text-amber-600" />
          <span className="text-[10px] font-bold text-amber-600">ĐANG CHỜ</span>
        </button>

        <button 
          onClick={() => { 
            // Quick alarm filter
            const alarmed = tables.find((t) => t.assistanceRequested)
            if (alarmed) {
              setSelectedTable(alarmed)
              setModalMode('main')
            } else {
              showToast('Không có yêu cầu hỗ trợ nào tại thời điểm này.', 'info')
            }
          }}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${
            stats.assistance > 0 ? 'text-orange-600' : 'text-gray-400'
          }`}
        >
          <Bell className={`w-5 h-5 ${stats.assistance > 0 ? 'animate-bounce text-orange-600' : ''}`} />
          <span className="text-[10px] font-bold">BÁO ĐỘNG</span>
        </button>
      </nav>

    </div>
  )
}

export default App
