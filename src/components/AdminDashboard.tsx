import { useState } from 'react'
import {
  Search,
  Users,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Award,
  ShieldAlert,
  Utensils,
  Settings,
  Activity,
  FileText,
  X,
  Plus,
  CheckCircle,
  ChefHat
} from 'lucide-react'

// Define data models
interface MenuItem {
  id: string
  name: string
  category: 'mains' | 'appetizers' | 'drinks'
  price: number
  inStock: boolean
  portionsSold: number
}

interface OverrideLog {
  id: string
  timestamp: string
  action: string
  manager: string
  severity: 'low' | 'medium' | 'high'
}

interface StaffMember {
  id: string
  name: string
  role: 'Quản lý' | 'Bếp trưởng' | 'Phục vụ' | 'Thu ngân'
  shift: 'Ca sáng (08:00 - 16:00)' | 'Ca tối (16:00 - 24:00)' | 'Cả ngày'
  status: 'Đang làm' | 'Nghỉ' | 'Đang nghỉ giải lao'
}

interface SettledInvoice {
  id: string
  table: string
  subtotal: number
  discount: number
  tax: number
  total: number
  method: 'VietQR' | 'Card' | 'Cash'
  timestamp: string
}

interface AdminDashboardProps {
  onBackToServerView?: () => void
}

// Helper function to format currency as VND
const formatPrice = (value: number) => {
  return value.toLocaleString('vi-VN') + ' đ'
}

export function AdminDashboard({ onBackToServerView }: AdminDashboardProps) {
  // 1. Sidebar Active tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'menu' | 'tables' | 'staff' | 'invoices' | 'settings'>('dashboard')

  // 2. Mock Inventory database
  const [inventory, setInventory] = useState<MenuItem[]>([
    { id: 'm1', name: 'Phở Bò Wagyu', category: 'mains', price: 150000, inStock: true, portionsSold: 120 },
    { id: 'm2', name: 'Bún Chả Hà Nội Than Hoa', category: 'mains', price: 95000, inStock: true, portionsSold: 98 },
    { id: 'm3', name: 'Mực Nướng Hạ Long', category: 'mains', price: 185000, inStock: true, portionsSold: 84 },
    { id: 'm4', name: 'Cua Rang Trứng Muối', category: 'mains', price: 320000, inStock: true, portionsSold: 65 },
    { id: 'm5', name: 'Thịt Kho Tàu Nồi Đất Khói', category: 'mains', price: 165000, inStock: true, portionsSold: 142 },
    { id: 'a1', name: 'Gỏi Cuốn Tươi (3 cuốn)', category: 'appetizers', price: 65000, inStock: true, portionsSold: 110 },
    { id: 'a2', name: 'Gỏi Ngó Sen Tôm Thịt', category: 'appetizers', price: 110000, inStock: false, portionsSold: 42 },
    { id: 'a3', name: 'Chả Giò Chiên Giòn', category: 'appetizers', price: 85000, inStock: true, portionsSold: 76 },
    { id: 'd1', name: 'Cà Phê Trứng Việt Nam', category: 'drinks', price: 45000, inStock: true, portionsSold: 130 },
    { id: 'd2', name: 'Trà Vải Đặc Biệt', category: 'drinks', price: 45000, inStock: true, portionsSold: 115 },
    { id: 'd3', name: 'Bia Tiger Tươi (Ly)', category: 'drinks', price: 35000, inStock: true, portionsSold: 180 },
    { id: 'd4', name: 'Trà Đào Sả Lạnh', category: 'drinks', price: 40000, inStock: true, portionsSold: 54 }
  ])

  // 3. Mock Manager approvals overrides feed
  const [overrideLogs, setOverrideLogs] = useState<OverrideLog[]>([
    { id: 'L-5892', timestamp: '12:05 CH', action: 'Duyệt giảm giá 20% khách thân thiết cho Bàn B2', manager: 'Emma W. (QL)', severity: 'medium' },
    { id: 'L-5731', timestamp: '11:42 SA', action: 'Cho phép huỷ món Phở Bò Wagyu trên Phiếu #A4', manager: 'Emma W. (QL)', severity: 'high' },
    { id: 'L-5642', timestamp: '10:15 SA', action: 'Xử lý chênh lệch ngăn kéo tiền mặt (50.000 đ)', manager: 'John D. (Trưởng Ca)', severity: 'low' },
    { id: 'L-5520', timestamp: '09:30 SA', action: 'Vượt giới hạn sức chứa để xếp 8 khách vào Phòng VIP 4', manager: 'Emma W. (QL)', severity: 'medium' },
    { id: 'L-5411', timestamp: '08:45 SA', action: 'Duyệt điều chỉnh giá khuyến mãi Bia Tiger cho Bàn A1', manager: 'John D. (Trưởng Ca)', severity: 'low' }
  ])

  // 4. Staff Shifts database (read-only display data)
  const staffList: StaffMember[] = [
    { id: 'S-1', name: 'Alex Mercer', role: 'Quản lý', shift: 'Ca sáng (08:00 - 16:00)', status: 'Đang làm' },
    { id: 'S-2', name: 'Emma Watson', role: 'Thu ngân', shift: 'Ca sáng (08:00 - 16:00)', status: 'Đang làm' },
    { id: 'S-3', name: 'Nguyễn An', role: 'Bếp trưởng', shift: 'Cả ngày', status: 'Đang làm' },
    { id: 'S-4', name: 'Trần Bình', role: 'Phục vụ', shift: 'Ca sáng (08:00 - 16:00)', status: 'Đang nghỉ giải lao' },
    { id: 'S-5', name: 'Lê Chi', role: 'Phục vụ', shift: 'Ca tối (16:00 - 24:00)', status: 'Nghỉ' },
    { id: 'S-6', name: 'Phạm Đan', role: 'Thu ngân', shift: 'Ca tối (16:00 - 24:00)', status: 'Nghỉ' }
  ]

  // 5. Settled Invoices logs (read-only display data)
  const invoices: SettledInvoice[] = [
    { id: 'INV-9831', table: 'Bàn A3', subtotal: 830000, discount: 83000, tax: 59760, total: 806760, method: 'VietQR', timestamp: '12:10 CH' },
    { id: 'INV-9830', table: 'Bàn B2', subtotal: 940000, discount: 188000, tax: 60160, total: 812160, method: 'Card', timestamp: '12:05 CH' },
    { id: 'INV-9829', table: 'Bàn A1', subtotal: 425000, discount: 0, tax: 34000, total: 459000, method: 'Cash', timestamp: '11:32 SA' },
    { id: 'INV-9828', table: 'Bàn A9', subtotal: 1200000, discount: 120000, tax: 86400, total: 1166400, method: 'VietQR', timestamp: '10:50 SA' },
    { id: 'INV-9827', table: 'Phòng VIP 2', subtotal: 3100000, discount: 465000, tax: 210800, total: 2845800, method: 'Card', timestamp: '10:15 SA' }
  ]

  // Local state UI controls
  const [inventorySearch, setInventorySearch] = useState<string>('')
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'mains' | 'appetizers' | 'drinks'>('all')
  const [newOverrideAction, setNewOverrideAction] = useState<string>('')
  
  // Custom dialogs
  const [isNewDishOpen, setIsNewDishOpen] = useState(false)
  const [newDishName, setNewDishName] = useState('')
  const [newDishCategory, setNewDishCategory] = useState<'mains' | 'appetizers' | 'drinks'>('mains')
  const [newDishPrice, setNewDishPrice] = useState('')

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null)

  // POS configurations
  const [autoSyncRate, setAutoSyncRate] = useState('30s')
  const [printerConnected, setPrinterConnected] = useState(true)
  const [backupPOSReady, setBackupPOSReady] = useState(true)

  // Show dynamic toast alerts
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Toggle Live Stock status
  const handleToggleStock = (id: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updatedStock = !item.inStock
        showToast(
          `${item.name} đã chuyển sang ${updatedStock ? 'CÒN HÀNG' : 'HẾT HÀNG'}. Thực đơn cập nhật tức thì.`,
          updatedStock ? 'success' : 'error'
        )
        return { ...item, inStock: updatedStock }
      })
    )
  }

  // Add new item to database
  const handleAddDish = () => {
    const price = parseFloat(newDishPrice)
    if (!newDishName.trim() || isNaN(price) || price <= 0) {
      showToast('Vui lòng nhập tên món và giá hợp lệ.', 'error')
      return
    }

    const newDish: MenuItem = {
      id: `m-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: newDishName,
      category: newDishCategory,
      price: price,
      inStock: true,
      portionsSold: 0
    }

    setInventory((prev) => [...prev, newDish])
    setIsNewDishOpen(false)
    setNewDishName('')
    setNewDishPrice('')
    showToast(`Đã thêm ${newDishName} vào danh mục ${newDishCategory} thành công!`, 'success')
  }

  // Record manual manager approval log override
  const handleAddManualOverride = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newOverrideAction.trim()) return

    const newLog: OverrideLog = {
      id: `L-${Math.floor(Math.random() * 9000 + 1000)}`,
      timestamp: 'Vừa xong',
      action: newOverrideAction,
      manager: 'Emma W. (GM)',
      severity: 'medium'
    }

    setOverrideLogs((prev) => [newLog, ...prev])
    setNewOverrideAction('')
    showToast('Đã ghi lệnh phê duyệt thủ công vào nhật ký kiểm toán POS.', 'success')
  }

  // Section calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
  const activeTablesCount = '18/20'

  // Filtered menu inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesCategory = inventoryFilter === 'all' || item.category === inventoryFilter
    const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Peak times hourly chart data (mocking custom bar chart drawing)
  const chartData = [
    { hour: '11:00 AM', revenue: 4200000, active: 6 },
    { hour: '12:00 PM', revenue: 9500000, active: 16 },
    { hour: '01:00 PM', revenue: 12500000, active: 20 },
    { hour: '02:00 PM', revenue: 5800000, active: 10 },
    { hour: '05:00 PM', revenue: 6400000, active: 12 },
    { hour: '06:00 PM', revenue: 14800000, active: 19 },
    { hour: '07:00 PM', revenue: 18200000, active: 20 },
    { hour: '08:00 PM', revenue: 15600000, active: 18 },
    { hour: '09:00 PM', revenue: 8900000, active: 11 }
  ]

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue))

  return (
    <div className="h-screen w-full bg-app-bg text-[#2C3E50] font-sans flex overflow-hidden selection:bg-primary selection:text-white">
      
      {/* 1. Left Sticky Navigation Sidebar (Vertical Sidebar component) */}
      <aside className="w-64 bg-white border-r border-[#C0392B]/10 flex flex-col justify-between shrink-0 h-full z-20">
        <div className="flex flex-col overflow-y-auto">
          
          {/* Logo segment */}
          <div className="px-6 py-6 border-b border-[#C0392B]/5 flex items-center gap-3">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <ChefHat className="text-white w-5 h-5 animate-pulse-slow" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-lg tracking-wider text-primary font-serif">KHÓI ADMIN</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 leading-none">BISTRO HQ</p>
            </div>
          </div>

          {/* Sidebar Tabs */}
          <nav className="p-4 space-y-1.5 text-left">
            {[
              { id: 'dashboard', label: 'Tổng quan', icon: Activity },
              { id: 'menu', label: 'Quản lý thực đơn', icon: Utensils },
              { id: 'tables', label: 'Sơ đồ bàn ăn', icon: Users },
              { id: 'staff', label: 'Phân ca nhân viên', icon: Users },
              { id: 'invoices', label: 'Lịch sử hoá đơn', icon: FileText },
              { id: 'settings', label: 'Cài đặt hệ thống', icon: Settings }
            ].map((tab) => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-4 py-3 rounded-xl text-xs font-bold tracking-wide uppercase transition-all flex items-center gap-3 active:scale-98 cursor-pointer ${
                    isActive
                      ? 'bg-primary text-[#FFF8F6] shadow-md shadow-primary/20'
                      : 'bg-white text-gray-500 hover:text-gray-900 hover:bg-[#FAF6EE]'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer options */}
        <div className="p-4 border-t border-gray-100 space-y-2">
          {onBackToServerView && (
            <button
              onClick={onBackToServerView}
              className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl text-[10px] font-extrabold uppercase transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <span>Về màn hình phục vụ</span>
            </button>
          )}
          <div className="text-center text-[9px] text-gray-400 font-medium">
            <span>Khói POS HQ Server v2.4.1</span>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top bar header */}
        <header className="bg-white border-b border-[#C0392B]/10 px-8 py-4 flex items-center justify-between shrink-0 shadow-xs z-10">
          <div className="text-left">
            <h1 className="font-extrabold text-xl text-gray-800 font-serif tracking-tight">
              {activeTab === 'dashboard' && 'Bảng điều hành quản lý'}
              {activeTab === 'menu' && 'Quản lý kho thực đơn'}
              {activeTab === 'tables' && 'Cấu hình sơ đồ phòng ăn'}
              {activeTab === 'staff' && 'Lịch làm việc nhân viên'}
              {activeTab === 'invoices' && 'Nhật ký kiểm toán hoá đơn POS'}
              {activeTab === 'settings' && 'Cài đặt hệ thống POS nhà hàng'}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Xin chào, <span className="font-bold text-gray-700">Emma Watson (Quản lý cấp cao)</span> • Đang trực ca
            </p>
          </div>

          {/* Sync & Alarm Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-[#FAF6EE] border border-[#E2D9C8] px-3.5 py-1.5 rounded-xl text-xs font-bold font-mono">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <span>ĐÃ ĐỒNG BỘ CLOUD</span>
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <div className="flex-grow overflow-y-auto p-8 bg-[#FFF8F6] space-y-8">
          
          {/* ================= VIEW 1: DASHBOARD OVERVIEW ================= */}
          {activeTab === 'dashboard' && (
            <>
              {/* 2. Top Analytics Cards (Row of 4) */}
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                
                {/* Analytics 1: Revenue */}
                <div className="bg-white border border-[#E2D9C8] p-5 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Doanh thu hôm nay</p>
                    <h3 className="text-2xl font-bold text-gray-800 font-mono mt-1">${totalRevenue.toFixed(2)}</h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+12.4% so với hôm qua</span>
                    </span>
                  </div>
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Analytics 2: Occupied Tables */}
                <div className="bg-white border border-[#E2D9C8] p-5 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Bàn đang hoạt động</p>
                    <h3 className="text-2xl font-bold text-gray-800 font-mono mt-1">{activeTablesCount}</h3>
                    <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>90.0% công suất phòng</span>
                    </span>
                  </div>
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Analytics 3: Orders Placed */}
                <div className="bg-white border border-[#E2D9C8] p-5 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Tổng khách phục vụ</p>
                    <h3 className="text-2xl font-bold text-gray-800 font-mono mt-1">248 lượt</h3>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>+8.2% xu hướng đông</span>
                    </span>
                  </div>
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Analytics 4: Top Selling Dish */}
                <div className="bg-white border border-[#E2D9C8] p-5 rounded-2xl flex items-center justify-between shadow-premium hover:-translate-y-0.5 transition-all">
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Món bán chạy nhất</p>
                    <h3 className="text-sm font-extrabold text-gray-800 mt-2 line-clamp-1">Thịt Kho Nồi Đất Khói</h3>
                    <span className="text-[10px] text-primary font-bold flex items-center gap-1 mt-1">
                      <Award className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>142 suất đã bán</span>
                    </span>
                  </div>
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                </div>

              </section>

              {/* Middle Section: Peak Hourly Busy Peak Custom Chart Layout */}
              <section className="bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                  Biểu đồ doanh thu & giờ cao điểm trong ngày hôm nay
                </h3>

                {/* Pixel-perfect purely CSS custom chart representing busy hours */}
                <div className="h-44 w-full flex items-end gap-3 sm:gap-6 border-b border-gray-200 pb-2 px-4 relative mt-8">
                  {chartData.map((d, idx) => {
                    const pct = (d.revenue / maxRevenue) * 100
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end cursor-pointer">
                        
                        {/* Hover reading block */}
                        <div className="absolute bottom-full mb-2 bg-gray-800 text-white rounded-lg p-2 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-10 w-28 text-center shadow-lg animate-fade-in">
                          <p className="font-bold text-primary">{formatPrice(d.revenue)}</p>
                          <p className="text-[9px] text-gray-400 mt-0.5">{d.active} bàn hoạt động</p>
                        </div>

                        {/* Bar node with subtle shadow */}
                        <div
                          style={{ height: `${pct}%` }}
                          className="w-full bg-[#E2D9C8] hover:bg-primary transition-all rounded-t-md relative flex justify-center shadow-sm"
                        >
                          <span className="absolute -top-6 text-[9px] font-bold text-gray-500 font-mono group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                            {d.revenue >= 1000000 ? (d.revenue / 1000000).toFixed(1) + ' Tr' : (d.revenue / 1000).toFixed(0) + 'k'}
                          </span>
                        </div>

                        {/* Hourly label */}
                        <span className="text-[9px] text-gray-400 font-mono font-bold mt-2 truncate w-full text-center">
                          {d.hour.split(' ')[0]}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>

              {/* Lower Section (Split Screen): Menu Inventory and Override log */}
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 3. Menu Inventory Toggle Section (Left Col: 7 / 12 width) */}
                <div className="lg:col-span-7 bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm flex flex-col justify-between text-left">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                          Thực đơn đang kinh doanh
                        </h3>
                        <p className="text-[10px] text-gray-500 mt-0.5">Bật/tắt trạng thái để cập nhật ngay tức thì cho thu ngân & phục vụ.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('menu')}
                        className="text-xs text-primary font-bold hover:underline"
                      >
                        Xem toàn bộ →
                      </button>
                    </div>

                    {/* Compact Item Matrix Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                            <th className="py-2.5">Tên món</th>
                            <th className="py-2.5">Danh mục</th>
                            <th className="py-2.5 text-right">Giá</th>
                            <th className="py-2.5 text-center w-24">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {inventory.slice(0, 5).map((item) => (
                            <tr
                              key={item.id}
                              className={`transition-all duration-200 ${
                                item.inStock ? '' : 'opacity-50 bg-rose-50/20'
                              }`}
                            >
                              <td className="py-3 font-bold text-gray-800 flex items-center gap-2">
                                <span>{item.name}</span>
                                {!item.inStock && (
                                  <span className="text-[8px] bg-primary text-white font-extrabold px-1 rounded-sm uppercase tracking-wider shrink-0">
                                    Hết hàng
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-gray-500 font-medium capitalize">{item.category}</td>
                              <td className="py-3 text-right font-mono font-bold text-gray-700">
                                {formatPrice(item.price)}
                              </td>
                              <td className="py-3 text-center">
                                
                                {/* 3. Live Status Switch Component */}
                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={() => handleToggleStock(item.id)}
                                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                      item.inStock ? 'bg-primary' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                        item.inStock ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>

                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* 4. Manager Override Log (Right Col: 5 / 12 width) */}
                <div className="lg:col-span-5 bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-4">
                      Nhật ký phê duyệt quản lý
                    </h3>

                    {/* Override stepper vertical list */}
                    <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                      {overrideLogs.map((log) => {
                        let severityColor = 'bg-gray-100 text-gray-500'
                        if (log.severity === 'high') severityColor = 'bg-[#FADBD8] text-[#922B21]'
                        else if (log.severity === 'medium') severityColor = 'bg-amber-100 text-amber-800'

                        return (
                          <div key={log.id} className="flex gap-3 items-start border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                            <div className="h-7 w-7 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <ShieldAlert className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 text-xs">
                              <p className="font-bold text-gray-800 leading-snug">{log.action}</p>
                              <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 font-mono">
                                <span>{log.manager} • {log.timestamp}</span>
                                <span className={`text-[8px] font-extrabold px-1 rounded-sm uppercase tracking-wider ${severityColor}`}>
                                  {log.severity}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Quick override logger form */}
                  <form onSubmit={handleAddManualOverride} className="border-t border-gray-100 pt-4 mt-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ghi lệnh phê duyệt thủ công..."
                        value={newOverrideAction}
                        onChange={(e) => setNewOverrideAction(e.target.value)}
                        className="flex-1 bg-[#FAF6EE] text-xs px-3 py-2 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newOverrideAction.trim()}
                        className="px-4 py-2 bg-primary text-[#FFF8F6] text-xs font-bold rounded-xl active-press disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                      >
                        Ghi
                      </button>
                    </div>
                  </form>

                </div>

              </section>
            </>
          )}

          {/* ================= VIEW 2: MENU MANAGEMENT ================= */}
          {activeTab === 'menu' && (
            <div className="bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4 mb-6 gap-4">
                
                {/* Search & Categories */}
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                  <div className="relative w-52 shrink-0">
                    <Search className="absolute left-2.5 top-2 text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm món ăn..."
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      className="w-full bg-[#FAF6EE] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E2D9C8] focus:outline-none"
                    />
                  </div>

                  <div className="bg-[#FAF6EE] p-0.5 rounded-lg border border-[#E2D9C8] flex items-center">
                    {([
                      { id: 'all', label: 'Tất cả' },
                      { id: 'mains', label: 'Món chính' },
                      { id: 'appetizers', label: 'Khai vị' },
                      { id: 'drinks', label: 'Đồ uống' }
                    ] as const).map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setInventoryFilter(tab.id)}
                        className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase transition-all whitespace-nowrap ${
                          inventoryFilter === tab.id
                            ? 'bg-white text-primary shadow-xs border border-[#E2D9C8]'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Item trigger */}
                <button
                  onClick={() => setIsNewDishOpen(true)}
                  className="px-4 py-2 bg-primary hover:bg-[#A93226] text-white text-xs font-bold rounded-xl active-press transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-primary/25"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Thêm món mới</span>
                </button>
              </div>

              {/* Inventory Table Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-200 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider pb-3">
                      <th className="py-3">Tên món</th>
                      <th className="py-3">Danh mục</th>
                      <th className="py-3 text-right">Đã bán</th>
                      <th className="py-3 text-right">Đơn giá</th>
                      <th className="py-3 text-center w-36">Trạng thái kho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-all duration-200 hover:bg-gray-50/50 ${
                          item.inStock ? '' : 'opacity-50 bg-rose-50/20'
                        }`}
                      >
                        <td className="py-4 font-bold text-gray-800 text-sm">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-mono text-[10px] font-extrabold">
                              {item.id.toUpperCase()}
                            </div>
                            <div className="text-left">
                              <span className="font-bold text-gray-800 block leading-tight">{item.name}</span>
                              <span className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider mt-0.5">ID: #{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                          <span className={`px-2.5 py-1 rounded-md border ${
                            item.category === 'mains' 
                              ? 'bg-status-dining-bg text-status-dining-text border-[#E6B0AA]' 
                              : item.category === 'appetizers'
                              ? 'bg-status-waiting-bg text-status-waiting-text border-[#F7DC6F]'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-4 text-right font-mono font-bold text-gray-600 text-sm">
                          {item.portionsSold} suất
                        </td>
                        <td className="py-4 text-right font-mono font-extrabold text-gray-800 text-sm">
                          {formatPrice(item.price)}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${
                              item.inStock ? 'text-emerald-600' : 'text-primary'
                            }`}>
                              {item.inStock ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                            <button
                              onClick={() => handleToggleStock(item.id)}
                              className={`relative inline-flex h-5.5 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                item.inStock ? 'bg-primary' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                  item.inStock ? 'translate-x-5.5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 3: TABLES LAYOUT OVERVIEW ================= */}
          {activeTab === 'tables' && (
            <div className="bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">Sơ đồ bàn ăn toàn nhà hàng</h3>
              <p className="text-xs text-gray-500 mt-1 mb-6">
                Cấu hình lưới phòng ăn vật lý, giới hạn sức chứa và mã định tuyến bàn POS.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-dashed border-gray-200 rounded-2xl p-6 bg-[#FAF6EE]/50">
                  <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Tầng 1 (Khu A)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-xs">
                        <span className="text-xs font-bold font-serif text-gray-800">A{i+1}</span>
                        <span className="block text-[8px] text-gray-400 font-mono font-bold mt-1">SỨC CHỨA: 4</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-dashed border-gray-200 rounded-2xl p-6 bg-[#FAF6EE]/50">
                  <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Tầng 2 (Khu B)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-xs">
                        <span className="text-xs font-bold font-serif text-gray-800">B{i+1}</span>
                        <span className="block text-[8px] text-gray-400 font-mono font-bold mt-1">SỨC CHỨA: 6</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-dashed border-gray-200 rounded-2xl p-6 bg-[#FAF6EE]/50">
                  <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Phòng VIP</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-xs">
                        <span className="text-xs font-bold font-serif text-gray-800">VIP {i+1}</span>
                        <span className="block text-[8px] text-[#B7950B] font-mono font-bold mt-1">SỨC CHỨA: 10</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 4: STAFF MANAGEMENT ================= */}
          {activeTab === 'staff' && (
            <div className="bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif mb-1">Lịch làm việc & Phân quyền nhân viên</h3>
              <p className="text-xs text-gray-500 mb-6">Phân công nhiệm vụ, theo dõi ca trực và vị trí làm việc của từng nhân viên.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider pb-3">
                      <th className="py-3">Họ tên</th>
                      <th className="py-3">Vị trí</th>
                      <th className="py-3">Ca làm việc</th>
                      <th className="py-3 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {staffList.map((st) => (
                      <tr key={st.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 font-bold text-gray-800 text-sm">{st.name}</td>
                        <td className="py-3.5">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                            {st.role}
                          </span>
                        </td>
                        <td className="py-3.5 font-medium text-gray-600">{st.shift}</td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[9px] font-extrabold px-2 py-1 rounded-lg border uppercase tracking-wider ${
                            st.status === 'Đang làm' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : st.status === 'Đang nghỉ giải lao' 
                              ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' 
                              : 'bg-gray-100 text-gray-400 border-gray-200'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 5: INVOICES HISTORY ================= */}
          {activeTab === 'invoices' && (
            <div className="bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif mb-1">Kho lưu trữ hoá đơn POS</h3>
              <p className="text-xs text-gray-500 mb-6">Kiểm toán đầy đủ lịch sử giao dịch, phương thức thanh toán và khoản giảm giá.</p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider pb-3">
                      <th className="py-3">Mã hoá đơn</th>
                      <th className="py-3">Bàn</th>
                      <th className="py-3 text-right">Tạm tính</th>
                      <th className="py-3 text-right">Giảm giá</th>
                      <th className="py-3 text-right">Tổng thanh toán</th>
                      <th className="py-3 text-center">Phương thức</th>
                      <th className="py-3 text-right">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 font-bold font-mono text-gray-500">{inv.id}</td>
                        <td className="py-3.5 font-bold text-gray-800">{inv.table}</td>
                        <td className="py-3.5 text-right font-mono text-gray-500">{formatPrice(inv.subtotal)}</td>
                        <td className="py-3.5 text-right font-mono text-[#B7950B] font-bold">
                          {inv.discount > 0 ? `-${formatPrice(inv.discount)}` : '--'}
                        </td>
                        <td className="py-3.5 text-right font-mono font-extrabold text-primary">{formatPrice(inv.total)}</td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            inv.method === 'VietQR' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : inv.method === 'Card' 
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200' 
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {inv.method}
                          </span>
                        </td>
                        <td className="py-3.5 text-right font-mono text-gray-400">{inv.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VIEW 6: SYSTEM SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left max-w-2xl">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif mb-1">Cài đặt cấu hình hệ thống POS</h3>
              <p className="text-xs text-gray-500 mb-6">Điều chỉnh tần suất đồng bộ tự động, kết nối thiết bị ngoại vi POS và sao lưu an toàn.</p>

              <div className="space-y-6">
                
                {/* Syncer rate */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Tần suất đồng bộ POS tự động</h4>
                    <p className="text-xs text-gray-400">Thiết lập tần suất kiểm tra đồng bộ hàng đợi gọi món.</p>
                  </div>
                  <select
                    value={autoSyncRate}
                    onChange={(e) => setAutoSyncRate(e.target.value)}
                    className="bg-[#FAF6EE] border border-[#E2D9C8] text-xs font-bold rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="10s">10 seconds peak</option>
                    <option value="30s">30 seconds standard</option>
                    <option value="60s">1 minute low bandwidth</option>
                  </select>
                </div>

                {/* Printer trigger */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Hệ thống máy in nhiệt nhà bếp</h4>
                    <p className="text-xs text-gray-400">Cho phép in hoá đơn thủ công thông qua thiết bị POS.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setPrinterConnected(!printerConnected)
                      showToast(printerConnected ? 'Đã ngắt kết nối máy in nhiệt.' : 'Đã kết nối máy in nhiệt POS.', 'info')
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      printerConnected ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        printerConnected ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* POS Backup redundancy toggle */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Sao lưu dự phòng ngoại tuyến POS</h4>
                    <p className="text-xs text-gray-400">Lưu trữ phiếu gọi món cục bộ trong bộ nhớ trình duyệt nếu mất kết nối.</p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setBackupPOSReady(!backupPOSReady)
                      showToast(backupPOSReady ? 'Đã tắt bộ nhớ dự phòng.' : 'Đã kích hoạt chế độ phục hồi ngoại tuyến.', 'info')
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      backupPOSReady ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        backupPOSReady ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Print Diagnostics button */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => showToast('Đã in bản chẩn đoán hệ thống vào hàng đợi.', 'success')}
                    className="min-h-[44px] px-6 bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press"
                  >
                    In chẩn đoán hệ thống POS
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      {/* --- ADD NEW DISH POPUP MODAL --- */}
      {isNewDishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsNewDishOpen(false)}></div>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">Thêm món ăn mới</h3>
              <button
                onClick={() => setIsNewDishOpen(false)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dish Name */}
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  Tên món ăn
                </label>
                <input
                  type="text"
                  placeholder="VD: Cá trê kho nồi đất"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                />
              </div>

              {/* Category */}
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  Danh mục món
                </label>
                <select
                  value={newDishCategory}
                  onChange={(e: any) => setNewDishCategory(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                >
                  <option value="mains">Món chính</option>
                  <option value="appetizers">Món khai vị</option>
                  <option value="drinks">Đồ uống</option>
                </select>
              </div>

              {/* Price */}
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  Đơn giá cơ bản (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="Ví dụ: 150000"
                  value={newDishPrice}
                  onChange={(e) => setNewDishPrice(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm font-mono px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                />
              </div>

              <button
                onClick={handleAddDish}
                className="w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press"
              >
                Thêm món vào thực đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Toast Alert Container */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-[#C0392B]/10 shadow-premium-lg px-4 py-3.5 rounded-xl flex items-center gap-2.5 animate-slide-up max-w-sm text-xs font-bold">
          {toast.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <ShieldAlert className="w-5 h-5 text-primary shrink-0 animate-bounce" />
          ) : (
            <Activity className="w-5 h-5 text-indigo-600 shrink-0 animate-spin" />
          )}
          <span className="text-gray-700">{toast.text}</span>
        </div>
      )}

    </div>
  )
}
