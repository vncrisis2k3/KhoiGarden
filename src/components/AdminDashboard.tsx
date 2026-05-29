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
  ChefHat,
  Pencil,
  Trash2
} from 'lucide-react'

// Define data models
interface MenuItem {
  id: string
  name: string
  category: 'mains' | 'appetizers' | 'desserts' | 'drinks'
  price: number
  imageUrl?: string
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
  shift: 'Ca sáng (08:00 - 16:00)' | 'Ca tối (16:00 - 24:00)' | 'Parttime'
  status: 'Đang làm' | 'Nghỉ'
  accountUsername: string
  accountPassword: string
}

interface DiningTableConfig {
  id: string
  name: string
  capacity: number
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
    { id: 'm1', name: 'Phở Bò Wagyu', category: 'mains', price: 150000, imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 120 },
    { id: 'm2', name: 'Bún Chả Hà Nội Than Hoa', category: 'mains', price: 95000, imageUrl: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 98 },
    { id: 'm3', name: 'Mực Nướng Hạ Long', category: 'mains', price: 185000, imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 84 },
    { id: 'm4', name: 'Cua Rang Trứng Muối', category: 'mains', price: 320000, imageUrl: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 65 },
    { id: 'm5', name: 'Thịt Kho Tàu Nồi Đất Khói', category: 'mains', price: 165000, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 142 },
    { id: 'a1', name: 'Gỏi Cuốn Tươi (3 cuốn)', category: 'appetizers', price: 65000, imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 110 },
    { id: 'a2', name: 'Gỏi Ngó Sen Tôm Thịt', category: 'appetizers', price: 110000, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', inStock: false, portionsSold: 42 },
    { id: 'a3', name: 'Chả Giò Chiên Giòn', category: 'appetizers', price: 85000, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 76 },
    { id: 'ds1', name: 'Chè Khúc Bạch', category: 'desserts', price: 55000, imageUrl: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 58 },
    { id: 'ds2', name: 'Bánh Flan Caramel', category: 'desserts', price: 45000, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 71 },
    { id: 'ds3', name: 'Kem Dừa Thái', category: 'desserts', price: 60000, imageUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 39 },
    { id: 'd1', name: 'Cà Phê Trứng Việt Nam', category: 'drinks', price: 45000, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 130 },
    { id: 'd2', name: 'Trà Vải Đặc Biệt', category: 'drinks', price: 45000, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 115 },
    { id: 'd3', name: 'Bia Tiger Tươi (Ly)', category: 'drinks', price: 35000, imageUrl: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 180 },
    { id: 'd4', name: 'Trà Đào Sả Lạnh', category: 'drinks', price: 40000, imageUrl: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=600&q=80', inStock: true, portionsSold: 54 }
  ])

  // 3. Mock Manager approvals overrides feed
  const [overrideLogs, setOverrideLogs] = useState<OverrideLog[]>([
    { id: 'L-5892', timestamp: '12:05 CH', action: 'Duyệt giảm giá 20% khách thân thiết cho Bàn B2', manager: 'Emma W. (QL)', severity: 'medium' },
    { id: 'L-5731', timestamp: '11:42 SA', action: 'Cho phép huỷ món Phở Bò Wagyu trên Phiếu #A4', manager: 'Emma W. (QL)', severity: 'high' },
    { id: 'L-5642', timestamp: '10:15 SA', action: 'Xử lý chênh lệch ngăn kéo tiền mặt (50.000 đ)', manager: 'John D. (Trưởng Ca)', severity: 'low' },
    { id: 'L-5520', timestamp: '09:30 SA', action: 'Vượt giới hạn sức chứa để xếp 8 khách vào Bàn 20', manager: 'Emma W. (QL)', severity: 'medium' },
    { id: 'L-5411', timestamp: '08:45 SA', action: 'Duyệt điều chỉnh giá khuyến mãi Bia Tiger cho Bàn A1', manager: 'John D. (Trưởng Ca)', severity: 'low' }
  ])

  // 4. Staff management database
  const [staffList, setStaffList] = useState<StaffMember[]>([
    { id: 'S-1', name: 'Alex Mercer', role: 'Quản lý', shift: 'Ca sáng (08:00 - 16:00)', status: 'Đang làm', accountUsername: 'alex.mercer', accountPassword: 'Admin@123' },
    { id: 'S-2', name: 'Emma Watson', role: 'Thu ngân', shift: 'Ca sáng (08:00 - 16:00)', status: 'Đang làm', accountUsername: 'emma.watson', accountPassword: 'Cashier@123' },
    { id: 'S-3', name: 'Nguyễn An', role: 'Bếp trưởng', shift: 'Parttime', status: 'Đang làm', accountUsername: 'nguyen.an', accountPassword: 'Kitchen@123' },
    { id: 'S-4', name: 'Trần Bình', role: 'Phục vụ', shift: 'Ca sáng (08:00 - 16:00)', status: 'Nghỉ', accountUsername: 'tran.binh', accountPassword: 'Waiter@123' },
    { id: 'S-5', name: 'Lê Chi', role: 'Phục vụ', shift: 'Ca tối (16:00 - 24:00)', status: 'Nghỉ', accountUsername: 'le.chi', accountPassword: 'Waiter@456' },
    { id: 'S-6', name: 'Phạm Đan', role: 'Thu ngân', shift: 'Parttime', status: 'Nghỉ', accountUsername: 'pham.dan', accountPassword: 'Cashier@456' }
  ])

  // 5. Settled Invoices logs (read-only display data)
  const invoices: SettledInvoice[] = [
    { id: 'INV-9831', table: 'Bàn A3', subtotal: 830000, discount: 83000, tax: 59760, total: 806760, method: 'VietQR', timestamp: '12:10 CH' },
    { id: 'INV-9830', table: 'Bàn B2', subtotal: 940000, discount: 188000, tax: 60160, total: 812160, method: 'Card', timestamp: '12:05 CH' },
    { id: 'INV-9829', table: 'Bàn A1', subtotal: 425000, discount: 0, tax: 34000, total: 459000, method: 'Cash', timestamp: '11:32 SA' },
    { id: 'INV-9828', table: 'Bàn A9', subtotal: 1200000, discount: 120000, tax: 86400, total: 1166400, method: 'VietQR', timestamp: '10:50 SA' },
    { id: 'INV-9827', table: 'Bàn 20', subtotal: 3100000, discount: 465000, tax: 210800, total: 2845800, method: 'Card', timestamp: '10:15 SA' }
  ]

  // Local state UI controls
  const [inventorySearch, setInventorySearch] = useState<string>('')
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'mains' | 'appetizers' | 'desserts' | 'drinks'>('all')
  const [newOverrideAction, setNewOverrideAction] = useState<string>('')
  
  // Custom dialogs
  const [isNewDishOpen, setIsNewDishOpen] = useState(false)
  const [editingDishId, setEditingDishId] = useState<string | null>(null)
  const [newDishName, setNewDishName] = useState('')
  const [newDishCategory, setNewDishCategory] = useState<'mains' | 'appetizers' | 'desserts' | 'drinks'>('mains')
  const [newDishPrice, setNewDishPrice] = useState('')
  const [newDishImageUrl, setNewDishImageUrl] = useState('')

  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false)
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null)
  const [staffName, setStaffName] = useState('')
  const [staffRole, setStaffRole] = useState<StaffMember['role']>('Phục vụ')
  const [staffShift, setStaffShift] = useState<StaffMember['shift']>('Ca sáng (08:00 - 16:00)')
  const [staffStatus, setStaffStatus] = useState<StaffMember['status']>('Đang làm')
  const [staffUsername, setStaffUsername] = useState('')
  const [staffPassword, setStaffPassword] = useState('')

  const [tableLayout, setTableLayout] = useState<DiningTableConfig[]>([
    { id: 'A1', name: 'Bàn A1', capacity: 4 },
    { id: 'A2', name: 'Bàn A2', capacity: 4 },
    { id: 'A3', name: 'Bàn A3', capacity: 4 },
    { id: 'A4', name: 'Bàn A4', capacity: 4 },
    { id: 'A5', name: 'Bàn A5', capacity: 4 },
    { id: 'A6', name: 'Bàn A6', capacity: 4 },
    { id: 'A7', name: 'Bàn A7', capacity: 4 },
    { id: 'A8', name: 'Bàn A8', capacity: 4 },
    { id: 'A9', name: 'Bàn A9', capacity: 4 },
    { id: 'A10', name: 'Bàn A10', capacity: 4 },
    { id: 'A11', name: 'Bàn A11', capacity: 4 },
    { id: 'A12', name: 'Bàn A12', capacity: 4 },
    { id: 'B1', name: 'Bàn B1', capacity: 6 },
    { id: 'B2', name: 'Bàn B2', capacity: 6 },
    { id: 'B3', name: 'Bàn B3', capacity: 6 },
    { id: 'B4', name: 'Bàn B4', capacity: 6 },
    { id: 'B5', name: 'Bàn B5', capacity: 6 },
    { id: 'B6', name: 'Bàn B6', capacity: 6 },
    { id: 'VIP1', name: 'Bàn VIP1', capacity: 10 },
    { id: 'VIP2', name: 'Bàn VIP2', capacity: 10 },
    { id: 'VIP3', name: 'Bàn VIP3', capacity: 10 },
    { id: 'VIP4', name: 'Bàn VIP4', capacity: 10 }
  ])

  const [isTableFormOpen, setIsTableFormOpen] = useState(false)
  const [editingTableId, setEditingTableId] = useState<string | null>(null)
  const [tableCode, setTableCode] = useState('')
  const [tableName, setTableName] = useState('')
  const [tableCapacity, setTableCapacity] = useState('4')

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

  const resetDishForm = () => {
    setEditingDishId(null)
    setNewDishName('')
    setNewDishCategory('mains')
    setNewDishPrice('')
    setNewDishImageUrl('')
  }

  const openAddDishModal = () => {
    resetDishForm()
    setIsNewDishOpen(true)
  }

  const openEditDishModal = (dish: MenuItem) => {
    setEditingDishId(dish.id)
    setNewDishName(dish.name)
    setNewDishCategory(dish.category)
    setNewDishPrice(String(dish.price))
    setNewDishImageUrl(dish.imageUrl || '')
    setIsNewDishOpen(true)
  }

  // Add or update item in database
  const handleSaveDish = () => {
    const price = parseFloat(newDishPrice)
    if (!newDishName.trim() || isNaN(price) || price <= 0) {
      showToast('Vui lòng nhập tên món và giá hợp lệ.', 'error')
      return
    }

    const normalizedImageUrl = newDishImageUrl.trim() || undefined

    if (editingDishId) {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === editingDishId
            ? {
                ...item,
                name: newDishName,
                category: newDishCategory,
                price,
                imageUrl: normalizedImageUrl
              }
            : item
        )
      )
      setIsNewDishOpen(false)
      showToast(`Đã cập nhật ${newDishName} thành công!`, 'success')
      resetDishForm()
      return
    }

    const newDish: MenuItem = {
      id: `m-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: newDishName,
      category: newDishCategory,
      price,
      imageUrl: normalizedImageUrl,
      inStock: true,
      portionsSold: 0
    }

    setInventory((prev) => [...prev, newDish])
    setIsNewDishOpen(false)
    showToast(`Đã thêm ${newDishName} vào danh mục ${newDishCategory} thành công!`, 'success')
    resetDishForm()
  }

  const handleDeleteDish = (dishId: string) => {
    const dish = inventory.find((item) => item.id === dishId)
    if (!dish) return

    setInventory((prev) => prev.filter((item) => item.id !== dishId))
    if (editingDishId === dishId) {
      setIsNewDishOpen(false)
      resetDishForm()
    }
    showToast(`Đã xoá ${dish.name} khỏi thực đơn.`, 'info')
  }

  const resetStaffForm = () => {
    setEditingStaffId(null)
    setStaffName('')
    setStaffRole('Phục vụ')
    setStaffShift('Ca sáng (08:00 - 16:00)')
    setStaffStatus('Đang làm')
    setStaffUsername('')
    setStaffPassword('')
  }

  const openAddStaffModal = () => {
    resetStaffForm()
    setIsStaffFormOpen(true)
  }

  const openEditStaffModal = (staff: StaffMember) => {
    setEditingStaffId(staff.id)
    setStaffName(staff.name)
    setStaffRole(staff.role)
    setStaffShift(staff.shift)
    setStaffStatus(staff.status)
    setStaffUsername(staff.accountUsername)
    setStaffPassword(staff.accountPassword)
    setIsStaffFormOpen(true)
  }

  const handleSaveStaff = () => {
    if (!staffName.trim() || !staffUsername.trim() || !staffPassword.trim()) {
      showToast('Vui lòng nhập đầy đủ tên, tài khoản và mật khẩu.', 'error')
      return
    }

    if (editingStaffId) {
      setStaffList((prev) =>
        prev.map((staff) =>
          staff.id === editingStaffId
            ? {
                ...staff,
                name: staffName,
                role: staffRole,
                shift: staffShift,
                status: staffStatus,
                accountUsername: staffUsername,
                accountPassword: staffPassword
              }
            : staff
        )
      )
      showToast(`Đã cập nhật thông tin nhân viên ${staffName}.`, 'success')
      setIsStaffFormOpen(false)
      resetStaffForm()
      return
    }

    const newStaff: StaffMember = {
      id: `S-${Math.floor(Math.random() * 9000 + 1000)}`,
      name: staffName,
      role: staffRole,
      shift: staffShift,
      status: staffStatus,
      accountUsername: staffUsername,
      accountPassword: staffPassword
    }

    setStaffList((prev) => [...prev, newStaff])
    showToast(`Đã tạo tài khoản cho nhân viên ${staffName}.`, 'success')
    setIsStaffFormOpen(false)
    resetStaffForm()
  }

  const handleDeleteStaff = (staffId: string) => {
    const staff = staffList.find((item) => item.id === staffId)
    if (!staff) return

    setStaffList((prev) => prev.filter((item) => item.id !== staffId))
    if (editingStaffId === staffId) {
      setIsStaffFormOpen(false)
      resetStaffForm()
    }
    showToast(`Đã xoá nhân viên ${staff.name}.`, 'info')
  }

  const resetTableForm = () => {
    setEditingTableId(null)
    setTableCode('')
    setTableName('')
    setTableCapacity('4')
  }

  const openAddTableModal = () => {
    resetTableForm()
    setIsTableFormOpen(true)
  }

  const openEditTableModal = (table: DiningTableConfig) => {
    setEditingTableId(table.id)
    setTableCode(table.id)
    setTableName(table.name)
    setTableCapacity(String(table.capacity))
    setIsTableFormOpen(true)
  }

  const handleSaveTable = () => {
    const parsedCapacity = parseInt(tableCapacity, 10)
    const normalizedCode = tableCode.trim().toUpperCase()
    const normalizedName = tableName.trim() || (normalizedCode ? `Bàn ${normalizedCode}` : '')

    if (!normalizedCode || !normalizedName || isNaN(parsedCapacity) || parsedCapacity < 1) {
      showToast('Vui lòng nhập mã bàn, tên bàn và sức chứa hợp lệ.', 'error')
      return
    }

    const duplicateTable = tableLayout.some((table) => table.id === normalizedCode && table.id !== editingTableId)
    if (duplicateTable) {
      showToast('Mã bàn đã tồn tại, vui lòng chọn mã khác.', 'error')
      return
    }

    if (editingTableId) {
      setTableLayout((prev) =>
        prev.map((table) =>
          table.id === editingTableId
            ? {
                ...table,
                id: normalizedCode,
                name: normalizedName,
                capacity: parsedCapacity
              }
            : table
        )
      )
      showToast(`Đã cập nhật ${normalizedName}.`, 'success')
      setIsTableFormOpen(false)
      resetTableForm()
      return
    }

    setTableLayout((prev) => [
      ...prev,
      {
        id: normalizedCode,
        name: normalizedName,
        capacity: parsedCapacity
      }
    ])
    showToast(`Đã thêm ${normalizedName} vào sơ đồ bàn ăn.`, 'success')
    setIsTableFormOpen(false)
    resetTableForm()
  }

  const handleDeleteTable = (tableId: string) => {
    const table = tableLayout.find((item) => item.id === tableId)
    if (!table) return

    setTableLayout((prev) => prev.filter((item) => item.id !== tableId))
    if (editingTableId === tableId) {
      setIsTableFormOpen(false)
      resetTableForm()
    }
    showToast(`Đã xoá ${table.name} khỏi sơ đồ bàn ăn.`, 'info')
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
  const activeTablesCount = `${tableLayout.length} bàn`

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
    <div className="min-h-screen lg:h-screen w-full bg-app-bg text-[#2C3E50] font-sans flex flex-col lg:flex-row overflow-x-hidden lg:overflow-hidden selection:bg-primary selection:text-white">
      
      {/* 1. Left Sticky Navigation Sidebar (Vertical Sidebar component) */}
      <aside className="admin-sidebar w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-[#C0392B]/10 flex flex-col lg:justify-between shrink-0 h-auto lg:h-full z-20">
        <div className="flex flex-col overflow-visible lg:overflow-y-auto">
          
          {/* Logo segment */}
          <div className="px-4 sm:px-6 py-4 lg:py-6 border-b border-[#C0392B]/5 flex items-center gap-3">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <ChefHat className="text-white w-5 h-5 animate-pulse-slow" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-lg tracking-wider text-primary font-serif">KHÓI ADMIN</span>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5 leading-none">BISTRO HQ</p>
            </div>
          </div>

          {/* Sidebar Tabs */}
          <nav className="p-3 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:block gap-2 lg:space-y-1.5 text-left">
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
        <div className="hidden lg:block p-4 border-t border-gray-100 space-y-2">
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
      <main className="flex-1 flex flex-col overflow-visible lg:overflow-hidden min-w-0">
        
        {/* Top bar header */}
        <header className="bg-white border-b border-[#C0392B]/10 px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 shadow-xs z-10">
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
        <div className="flex-grow overflow-y-auto p-4 sm:p-8 bg-[#FFF8F6] space-y-8">
          
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
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Tổng số bàn</p>
                    <h3 className="text-2xl font-bold text-gray-800 font-mono mt-1">{activeTablesCount}</h3>
                    <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span>Gồm toàn bộ bàn đã cấu hình</span>
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
                        className="search-input flex-1 bg-[#FAF6EE] text-xs px-3 py-2 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
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
                      className="search-input w-full bg-[#FAF6EE] text-xs pl-8 pr-3 py-1.5 rounded-lg border border-[#E2D9C8] focus:outline-none"
                    />
                  </div>

                  <div className="bg-[#FAF6EE] p-0.5 rounded-lg border border-[#E2D9C8] flex items-center">
                    {([
                      { id: 'all', label: 'Tất cả' },
                      { id: 'mains', label: 'Món chính' },
                      { id: 'appetizers', label: 'Khai vị' },
                      { id: 'desserts', label: 'Tráng miệng' },
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
                    onClick={openAddDishModal}
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
                      <th className="py-3 text-center w-28">Thao tác</th>
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
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-10 w-10 rounded-lg object-cover border border-primary/10"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary font-mono text-[10px] font-extrabold">
                                {item.id.toUpperCase()}
                              </div>
                            )}
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
                              : item.category === 'desserts'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}>
                            {item.category === 'mains'
                              ? 'Món chính'
                              : item.category === 'appetizers'
                              ? 'Khai vị'
                              : item.category === 'desserts'
                              ? 'Tráng miệng'
                              : 'Đồ uống'}
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
                        <td className="py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditDishModal(item)}
                              className="h-8 w-8 rounded-lg border border-[#E2D9C8] bg-white text-gray-700 hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                              title="Sửa món"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDish(item.id)}
                              className="h-8 w-8 rounded-lg border border-[#F5B7B1] bg-white text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                              title="Xoá món"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-800 font-serif">Sơ đồ bàn ăn toàn nhà hàng</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Admin có thể thêm, sửa, xoá số bàn và sức chứa.
                  </p>
                </div>
                <button
                  onClick={() => openAddTableModal()}
                  className="px-4 py-2 bg-primary hover:bg-[#A93226] text-white text-xs font-bold rounded-xl active-press transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-primary/25"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Thêm bàn mới</span>
                </button>
              </div>

              <div className="border border-dashed border-gray-200 rounded-2xl p-4 bg-[#FAF6EE]/50">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase">Danh sách bàn</h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{tableLayout.length} bàn trong sơ đồ</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {tableLayout.map((table) => (
                    <div key={table.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-bold font-serif text-gray-800 block">{table.name}</span>
                          <span className="block text-[8px] text-gray-400 font-mono font-bold mt-1">{table.id}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditTableModal(table)}
                            className="h-7 w-7 rounded-md border border-[#E2D9C8] bg-white text-gray-700 hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                            title="Sửa bàn"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="h-7 w-7 rounded-md border border-[#F5B7B1] bg-white text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                            title="Xoá bàn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <span className="block text-[8px] text-gray-400 font-mono font-bold mt-2">
                        SỨC CHỨA: {table.capacity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= VIEW 4: STAFF MANAGEMENT ================= */}
          {activeTab === 'staff' && (
            <div className="bg-white border border-[#E2D9C8] p-6 rounded-2xl shadow-sm text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-extrabold text-lg text-gray-800 font-serif mb-1">DANH SÁCH NHÂN VIÊN</h3>
                  <p className="text-xs text-gray-500">Admin có thể thêm, sửa, xoá nhân viên, chức vụ và tài khoản đăng nhập.</p>
                </div>
                <button
                  onClick={openAddStaffModal}
                  className="px-4 py-2 bg-primary hover:bg-[#A93226] text-white text-xs font-bold rounded-xl active-press transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-primary/25"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Thêm nhân viên</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider pb-3">
                      <th className="py-3">Họ tên</th>
                      <th className="py-3">Chức vụ</th>
                      <th className="py-3">Ca làm việc</th>
                      <th className="py-3">Tài khoản</th>
                      <th className="py-3 text-center">Trạng thái</th>
                      <th className="py-3 text-center w-28">Thao tác</th>
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
                        <td className="py-3.5 text-gray-700">
                          <div className="flex flex-col">
                            <span className="font-mono font-bold text-[10px]">@{st.accountUsername}</span>
                            <span className="text-[9px] text-gray-400">Mật khẩu: {st.accountPassword ? 'Đã tạo' : 'Chưa có'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`text-[9px] font-extrabold px-2 py-1 rounded-lg border uppercase tracking-wider ${
                            st.status === 'Đang làm'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditStaffModal(st)}
                              className="h-8 w-8 rounded-lg border border-[#E2D9C8] bg-white text-gray-700 hover:border-primary hover:text-primary transition-all flex items-center justify-center"
                              title="Sửa nhân viên"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(st.id)}
                              className="h-8 w-8 rounded-lg border border-[#F5B7B1] bg-white text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center"
                              title="Xoá nhân viên"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                        <td className="py-3.5 font-bold font-mono text-gray-700">{inv.id}</td>
                        <td className="py-3.5 font-bold text-gray-800">{inv.table}</td>
                        <td className="py-3.5 text-right font-mono text-gray-700">{formatPrice(inv.subtotal)}</td>
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
                        <td className="py-3.5 text-right font-mono text-gray-700">{inv.timestamp}</td>
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

      {/* --- STAFF MANAGEMENT POPUP MODAL --- */}
      {isStaffFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => { setIsStaffFormOpen(false); resetStaffForm() }}></div>
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">
                {editingStaffId ? 'Sửa nhân viên' : 'Thêm nhân viên mới'}
              </h3>
              <button
                onClick={() => { setIsStaffFormOpen(false); resetStaffForm() }}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Họ tên</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                  placeholder="VD: Nguyễn Văn A"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Chức vụ</label>
                  <select
                    value={staffRole}
                    onChange={(e: any) => setStaffRole(e.target.value)}
                    className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                  >
                    <option value="Quản lý">Quản lý</option>
                    <option value="Bếp trưởng">Bếp trưởng</option>
                    <option value="Phục vụ">Phục vụ</option>
                    <option value="Thu ngân">Thu ngân</option>
                  </select>
                </div>

                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Ca làm việc</label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      'Ca sáng (08:00 - 16:00)',
                      'Ca tối (16:00 - 24:00)',
                      'Parttime'
                    ] as const).map((shiftOption) => (
                      <button
                        key={shiftOption}
                        type="button"
                        onClick={() => setStaffShift(shiftOption)}
                        className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                          staffShift === shiftOption
                            ? 'bg-primary text-white border-primary'
                            : 'bg-[#FAF6EE] text-gray-700 border-[#E2D9C8] hover:border-primary'
                        }`}
                      >
                        {shiftOption}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Trạng thái</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Đang làm', 'Nghỉ'] as const).map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() => setStaffStatus(statusOption)}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
                        staffStatus === statusOption
                          ? statusOption === 'Đang làm'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-gray-800 text-white border-gray-800'
                          : 'bg-[#FAF6EE] text-gray-700 border-[#E2D9C8] hover:border-primary'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Tài khoản đăng nhập</label>
                <input
                  type="text"
                  value={staffUsername}
                  onChange={(e) => setStaffUsername(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                  placeholder="VD: nguyen.vana"
                />
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Mật khẩu tài khoản</label>
                <input
                  type="text"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                  placeholder="VD: Staff@123"
                />
              </div>

              <button
                onClick={handleSaveStaff}
                className="w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press"
              >
                {editingStaffId ? 'Lưu thay đổi' : 'Tạo tài khoản nhân viên'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD NEW DISH POPUP MODAL --- */}
      {isNewDishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsNewDishOpen(false)}></div>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">
                {editingDishId ? 'Sửa món ăn' : 'Thêm món ăn mới'}
              </h3>
              <button
                onClick={() => {
                  setIsNewDishOpen(false)
                  resetDishForm()
                }}
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
                  <option value="appetizers">Khai vị</option>
                  <option value="desserts">Tráng miệng</option>
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

              {/* Image URL */}
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">
                  URL hinh anh mon
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newDishImageUrl}
                  onChange={(e) => setNewDishImageUrl(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                />
                {newDishImageUrl.trim() && (
                  <img
                    src={newDishImageUrl}
                    alt={newDishName || 'Mon moi'}
                    className="mt-3 h-28 w-full rounded-xl object-cover border border-[#E2D9C8]"
                  />
                )}
              </div>

              <button
                onClick={handleSaveDish}
                className="w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press"
              >
                {editingDishId ? 'Lưu thay đổi' : 'Thêm món vào thực đơn'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- TABLE LAYOUT POPUP MODAL --- */}
      {isTableFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => { setIsTableFormOpen(false); resetTableForm() }}></div>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">
                {editingTableId ? 'Sửa bàn ăn' : 'Thêm bàn ăn mới'}
              </h3>
              <button
                onClick={() => { setIsTableFormOpen(false); resetTableForm() }}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Mã bàn</label>
                <input
                  type="text"
                  value={tableCode}
                  onChange={(e) => setTableCode(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none uppercase"
                  placeholder="VD: A13 hoặc B20"
                />
              </div>

              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Tên hiển thị</label>
                <input
                  type="text"
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                  placeholder="VD: Bàn A13"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="text-left">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Sức chứa</label>
                  <input
                    type="number"
                    min={1}
                    value={tableCapacity}
                    onChange={(e) => setTableCapacity(e.target.value)}
                    className="w-full bg-[#FAF6EE] text-sm px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none"
                    placeholder="4"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveTable}
                className="w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press"
              >
                {editingTableId ? 'Lưu thay đổi' : 'Thêm bàn vào sơ đồ'}
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
