import { useState } from 'react'
import {
  Search,
  Users,
  Clock,
  Printer,
  Split,
  Tag,
  Calculator,
  Receipt,
  AlertCircle,
  Trash2,
  CheckCircle,
  Coins,
  ChefHat,
  X
} from 'lucide-react'

// Define data models
interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  notes: string
}

interface BillRequest {
  id: string // Bill ID, e.g. B-9832
  tableName: string
  tableId: string
  guests: number
  checkInTime: string
  waitingMinutes: number
  orders: OrderItem[]
  discountCode?: string
  discountPercent: number // e.g. 10 for 10%
}

interface CashierDashboardProps {
  onBackToServerView?: () => void
}

// Helper function to format currency as VND
const formatPrice = (value: number) => {
  return value.toLocaleString('vi-VN') + ' đ'
}

export function CashierDashboard({ onBackToServerView }: CashierDashboardProps) {
  // Mock active bills queue
  const [bills, setBills] = useState<BillRequest[]>([
    {
      id: 'B-9832',
      tableName: 'Bàn A3',
      tableId: 'A3',
      guests: 4,
      checkInTime: '12:30 CH',
      waitingMinutes: 5,
      discountPercent: 10, // Giảm giá 10% VIP mặc định
      discountCode: 'KHOIVIP10',
      orders: [
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 2, notes: 'Ít cay, nhiều rau thơm' },
        { id: 'a1', name: 'Gỏi Cuốn Tươi (3 cuốn)', price: 65000, quantity: 2, notes: 'Nước sốt đậu phộng để riêng' },
        { id: 'd2', name: 'Trà Vải Đặc Biệt', price: 45000, quantity: 4, notes: 'Ít ngọt, nhiều đá' }
      ]
    },
    {
      id: 'B-7123',
      tableName: 'Bàn A7',
      tableId: 'A7',
      guests: 5,
      checkInTime: '11:45 SA',
      waitingMinutes: 8,
      discountPercent: 0,
      orders: [
        { id: 'm4', name: 'Cua Rang Trứng Muối', price: 320000, quantity: 1, notes: 'Thêm sốt lòng đỏ trứng' },
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 3, notes: 'Không hành, nước lèo thật nóng' },
        { id: 'a2', name: 'Gỏi Ngó Sen Tôm Thịt', price: 110000, quantity: 2, notes: 'Nước mắm để riêng' }
      ]
    },
    {
      id: 'B-6482',
      tableName: 'Bàn B2',
      tableId: 'B2',
      guests: 2,
      checkInTime: '01:10 CH',
      waitingMinutes: 2,
      discountPercent: 0,
      orders: [
        { id: 'm4', name: 'Cua Rang Trứng Muối', price: 320000, quantity: 2, notes: 'Cay vừa' },
        { id: 'd3', name: 'Bia Tiger Tươi (Ly)', price: 35000, quantity: 6, notes: 'Yêu cầu ly ướp lạnh' }
      ]
    },
    {
      id: 'B-3498',
      tableName: 'Phòng VIP 1',
      tableId: 'VIP1',
      guests: 8,
      checkInTime: '11:30 SA',
      waitingMinutes: 12,
      discountPercent: 15,
      discountCode: 'KHOISTAF15',
      orders: [
        { id: 'm4', name: 'Cua Rang Trứng Muối', price: 320000, quantity: 4, notes: 'Chất lượng phục vụ khách VIP' },
        { id: 'm5', name: 'Thịt Kho Tàu Nồi Đất Khói', price: 165000, quantity: 4, notes: 'Thêm hành phi giòn' },
        { id: 'a2', name: 'Gỏi Ngó Sen Tôm Thịt', price: 110000, quantity: 3, notes: 'Thêm tiêu đen giã dập' },
        { id: 'd3', name: 'Bia Tiger Tươi (Ly)', price: 35000, quantity: 12, notes: 'Phục vụ lạnh, bia tươi' }
      ]
    },
    {
      id: 'B-2591',
      tableName: 'Phòng VIP 3',
      tableId: 'VIP3',
      guests: 6,
      checkInTime: '12:15 CH',
      waitingMinutes: 6,
      discountPercent: 0,
      orders: [
        { id: 'm1', name: 'Phở Bò Wagyu', price: 150000, quantity: 4, notes: 'Thịt bò tái để đĩa riêng' },
        { id: 'm3', name: 'Mực Nướng Hạ Long', price: 185000, quantity: 2, notes: 'Muối tiêu chanh ớt' },
        { id: 'd2', name: 'Trà Vải Đặc Biệt', price: 45000, quantity: 6, notes: 'Độ ngọt tiêu chuẩn' }
      ]
    }
  ])

  // Component States
  const [selectedBillId, setSelectedBillId] = useState<string>('B-9832')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [cashInput, setCashInput] = useState<string>('')
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null)

  // Voucher modal states
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [voucherCodeInput, setVoucherCodeInput] = useState('')

  // Split bill modal states
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false)
  const [splitCount, setSplitCount] = useState(2)
  const [splitQuantities, setSplitQuantities] = useState<{ [itemId: string]: number }>({})

  // Merge bill modal states
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const [mergeSelectionIds, setMergeSelectionIds] = useState<string[]>([])

  // Payment success display states
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false)
  const [lastPaidReceipt, setLastPaidReceipt] = useState<{
    billId: string
    tableName: string
    total: number
    cashPaid: number
    change: number
  } | null>(null)

  // Current active bill object
  const currentBill = bills.find((b) => b.id === selectedBillId) || bills[0]

  // Search logic for left sidebar queue
  const filteredBills = bills.filter((b) => {
    const query = searchQuery.toLowerCase()
    return b.tableName.toLowerCase().includes(query) || b.id.toLowerCase().includes(query)
  })

  // POS math formulas
  const getBillingSummary = (bill: BillRequest | undefined) => {
    if (!bill) return { subtotal: 0, discount: 0, tax: 0, total: 0 }
    
    const subtotal = bill.orders.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = subtotal * (bill.discountPercent / 100)
    const taxableAmount = Math.max(0, subtotal - discount)
    const tax = taxableAmount * 0.08 // 8% VAT
    const total = taxableAmount + tax

    return {
      subtotal,
      discount,
      tax,
      total
    }
  }

  const { subtotal, discount, tax, total } = getBillingSummary(currentBill)

  // Quick helper to post toast alerts
  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Edit notes interactively
  const handleEditNote = (itemId: string, newNote: string) => {
    if (!currentBill) return
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== currentBill.id) return b
        return {
          ...b,
          orders: b.orders.map((item) =>
            item.id === itemId ? { ...item, notes: newNote } : item
          )
        }
      })
    )
  }

  // Adjust order quantities
  const handleUpdateQty = (itemId: string, change: number) => {
    if (!currentBill) return
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== currentBill.id) return b
        return {
          ...b,
          orders: b.orders
            .map((item) =>
              item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item
            )
            .filter((item) => item.quantity > 0)
        }
      })
    )
    showToast('Đã cập nhật số lượng món ăn.', 'info')
  }

  // Delete line item
  const handleDeleteItem = (itemId: string) => {
    if (!currentBill) return
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== currentBill.id) return b
        return {
          ...b,
          orders: b.orders.filter((item) => item.id !== itemId)
        }
      })
    )
    showToast('Đã xóa món ăn khỏi hóa đơn.', 'error')
  }

  // Numeric keypad tapping logic
  const handleKeyPress = (char: string) => {
    if (char === 'C') {
      setCashInput('')
    } else if (char === '⌫') {
      setCashInput((prev) => prev.slice(0, -1))
    } else if (char === '000') {
      if (cashInput.length > 0 && cashInput.length <= 8) {
        setCashInput((prev) => prev + '000')
      }
    } else {
      // Limit to max length of 10 digits
      if (cashInput.length >= 10) return
      setCashInput((prev) => prev + char)
    }
  }

  // Keypad cash short-cuts
  const handleCashShortcut = (value: number | 'exact') => {
    if (value === 'exact') {
      setCashInput(total.toString())
    } else {
      const current = parseFloat(cashInput) || 0
      setCashInput((current + value).toString())
    }
  }

  // Apply voucher promo codes
  const handleApplyVoucher = () => {
    if (!currentBill) return
    const code = voucherCodeInput.trim().toUpperCase()
    let percent = 0

    if (code === 'KHOIVIP10') {
      percent = 10
      showToast('Đã áp dụng giảm giá thành viên VIP 10%.', 'success')
    } else if (code === 'WELCOME50') {
      percent = 25 // 25% off
      showToast('Đã áp dụng ưu đãi chào mừng 25%.', 'success')
    } else if (code === 'KHOISTAF15') {
      percent = 15
      showToast('Đã áp dụng giảm giá nhân viên 15%.', 'success')
    } else {
      showToast('Mã giảm giá không hợp lệ.', 'error')
      return
    }

    setBills((prev) =>
      prev.map((b) =>
        b.id === currentBill.id
          ? { ...b, discountPercent: percent, discountCode: code }
          : b
      )
    )
    setIsVoucherModalOpen(false)
    setVoucherCodeInput('')
  }

  const mergeOrders = (orders: OrderItem[]) => {
    const merged: OrderItem[] = []

    orders.forEach((item) => {
      const existing = merged.find(
        (entry) => entry.id === item.id && entry.price === item.price && entry.notes === item.notes
      )

      if (existing) {
        existing.quantity += item.quantity
      } else {
        merged.push({ ...item })
      }
    })

    return merged
  }

  const handleToggleMergeBill = (billId: string) => {
    setMergeSelectionIds((prev) =>
      prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId]
    )
  }

  const handleMergeBills = () => {
    if (!currentBill || mergeSelectionIds.length === 0) return

    const billsToMerge = bills.filter((bill) => mergeSelectionIds.includes(bill.id))
    const mergedOrders = mergeOrders([
      ...currentBill.orders,
      ...billsToMerge.flatMap((bill) => bill.orders)
    ])

    const mergedTableName = [currentBill, ...billsToMerge].map((bill) => bill.tableName).join(' + ')
    const mergedGuests = [currentBill, ...billsToMerge].reduce((sum, bill) => sum + bill.guests, 0)
    const maxWaitingMinutes = Math.max(currentBill.waitingMinutes, ...billsToMerge.map((bill) => bill.waitingMinutes))

    setBills((prev) =>
      prev
        .filter((bill) => !mergeSelectionIds.includes(bill.id))
        .map((bill) =>
          bill.id === currentBill.id
            ? {
                ...bill,
                tableName: mergedTableName,
                tableId: `${bill.tableId}+${mergeSelectionIds.join('+')}`,
                guests: mergedGuests,
                waitingMinutes: maxWaitingMinutes,
                orders: mergedOrders,
                discountCode: undefined,
                discountPercent: 0
              }
            : bill
        )
    )

    setCashInput('')
    setMergeSelectionIds([])
    setIsMergeModalOpen(false)
    showToast(`Đã gộp ${billsToMerge.length + 1} hoá đơn vào ${currentBill.id}.`, 'success')
  }

  const handleUpdateSplitQty = (itemId: string, change: number, maxQty: number) => {
    setSplitQuantities((prev) => {
      const nextQty = Math.max(0, Math.min(maxQty, (prev[itemId] || 0) + change))
      const next = { ...prev }

      if (nextQty === 0) {
        delete next[itemId]
      } else {
        next[itemId] = nextQty
      }

      return next
    })
  }

  const handleCreateSplitBill = () => {
    if (!currentBill) return

    const selectedEntries = Object.entries(splitQuantities).filter(([, qty]) => qty > 0)
    if (selectedEntries.length === 0) {
      showToast('Vui lòng chọn món cần tách sang hoá đơn mới.', 'error')
      return
    }

    const selectedTotalQty = selectedEntries.reduce((sum, [, qty]) => sum + qty, 0)
    const currentTotalQty = currentBill.orders.reduce((sum, item) => sum + item.quantity, 0)
    if (selectedTotalQty >= currentTotalQty) {
      showToast('Không thể tách toàn bộ món. Hãy giữ lại ít nhất một món trong hoá đơn gốc.', 'error')
      return
    }

    const splitOrders: OrderItem[] = []
    const remainingOrders = currentBill.orders
      .map((item) => {
        const splitQty = Math.min(splitQuantities[item.id] || 0, item.quantity)
        if (splitQty > 0) {
          splitOrders.push({ ...item, quantity: splitQty })
        }
        return { ...item, quantity: item.quantity - splitQty }
      })
      .filter((item) => item.quantity > 0)

    const newBillId = `B-S${Math.floor(Math.random() * 9000 + 1000)}`
    const newBill: BillRequest = {
      ...currentBill,
      id: newBillId,
      tableName: `${currentBill.tableName} / Tách`,
      tableId: `${currentBill.tableId}-S`,
      guests: Math.max(1, Math.min(currentBill.guests, selectedTotalQty)),
      waitingMinutes: 0,
      discountCode: undefined,
      discountPercent: 0,
      orders: splitOrders
    }

    setBills((prev) =>
      prev.flatMap((bill) =>
        bill.id === currentBill.id
          ? [{ ...bill, orders: remainingOrders }, newBill]
          : [bill]
      )
    )

    setSelectedBillId(newBillId)
    setCashInput('')
    setSplitQuantities({})
    setIsSplitModalOpen(false)
    showToast(`Đã tách ${selectedTotalQty} món sang hoá đơn ${newBillId}.`, 'success')
  }

  // Confirm payment sequence
  const handleConfirmPayment = () => {
    if (!currentBill) return
    
    const cash = parseFloat(cashInput) || 0
    if (cash < total && total > 0) {
      showToast('Tiền khách đưa không đủ thanh toán!', 'error')
      return
    }

    const change = cash - total

    // Record receipt copy for final popup
    setLastPaidReceipt({
      billId: currentBill.id,
      tableName: currentBill.tableName,
      total: total,
      cashPaid: cash,
      change: change
    })

    setIsPaymentSuccessOpen(true)
    
    // Dequeue paid table from left list
    setBills((prev) => prev.filter((b) => b.id !== currentBill.id))
    
    // Clear cash reading
    setCashInput('')
    
    // Select the next bill in line if available
    const remaining = bills.filter((b) => b.id !== currentBill.id)
    if (remaining.length > 0) {
      setSelectedBillId(remaining[0].id)
    }
  }

  // Split bill split details
  const splitAmount = total / splitCount

  return (
    <div className="min-h-screen lg:h-screen w-full bg-app-bg text-[#2C3E50] font-sans flex flex-col overflow-x-hidden lg:overflow-hidden relative select-none">
      
      {/* POS Top Header */}
      <header className="bg-white border-b border-[#C0392B]/10 px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <ChefHat className="text-white w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-primary font-serif">KHÓI POS</span>
              <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">THU NGÂN</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">Quầy số #01 • Quầy thu ngân chính</p>
          </div>
        </div>

        {/* Dynamic status pill */}
        <div className="w-full lg:w-auto flex items-center justify-center lg:justify-start gap-2 bg-[#FAF6EE] border border-[#E2D9C8] px-3.5 py-1.5 rounded-xl text-xs font-bold">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span>Thiết bị POS: Đang hoạt động</span>
          <span className="text-[10px] text-gray-400 ml-1.5 border-l border-[#E2D9C8] pl-2 font-mono">2026-05-27 12:12</span>
        </div>

        {/* Back navigation button */}
        {onBackToServerView && (
          <button
            onClick={onBackToServerView}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <span>Về màn hình phục vụ</span>
          </button>
        )}
      </header>

      {/* Main Split-Screen Dashboard (Optimized for 16:9 widescreen layout) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden">
        
        {/* 1. Left Sidebar (35% width) - Queue of active tables requesting bill */}
        <aside className="w-full lg:w-[35%] bg-white border-b lg:border-b-0 lg:border-r border-[#C0392B]/10 flex flex-col overflow-hidden max-h-[420px] lg:max-h-none">
          
          {/* Queue Search Component */}
          <div className="p-4 border-b border-gray-100 bg-[#FFF8F6]/20 shrink-0">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest text-left mb-3">
              Hàng đợi thanh toán ({bills.length})
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm theo Bàn hoặc Mã hoá đơn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input w-full bg-[#FAF6EE] text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Queue Scrolling list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredBills.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Receipt className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                <p className="text-xs font-bold">Không có yêu cầu thanh toán nào.</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Hệ thống POS đã được quyết toán xong.</p>
              </div>
            ) : (
              filteredBills.map((bill) => {
                const isActive = bill.id === selectedBillId
                const billSummary = getBillingSummary(bill)
                const isUrgent = bill.waitingMinutes >= 8

                return (
                  <div
                    key={bill.id}
                    onClick={() => {
                      setSelectedBillId(bill.id)
                      setCashInput('')
                    }}
                    className={`border-2 rounded-2xl p-4 cursor-pointer transition-all active:scale-98 select-none relative ${
                      isActive
                        ? 'bg-white border-orange-500 shadow-premium'
                        : 'bg-white border-orange-400 hover:border-orange-500'
                    }`}
                  >
                    {/* Urgent alert bell overlay */}
                    {isUrgent && (
                      <span className="absolute top-2.5 right-2.5 rounded-md bg-primary px-2 py-1 text-[9px] font-extrabold text-white uppercase">
                        Gấp
                      </span>
                    )}

                    <div className="flex justify-between items-start">
                      <div className="text-left">
                        <h4 className="font-extrabold text-base text-black font-serif">
                          {bill.tableName}
                        </h4>
                        <span className="text-[10px] font-mono text-black font-bold block mt-0.5">
                          Mã hoá đơn: #{bill.id}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-primary font-mono block">
                          {formatPrice(billSummary.total)}
                        </span>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <Users className="w-3 h-3 text-black" />
                          <span className="text-[10px] font-bold text-black">{bill.guests} khách</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-orange-200 pt-2.5 mt-3 text-[10px] font-extrabold text-black font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-black" />
                        <span className={isUrgent ? 'text-primary font-bold' : ''}>
                          Chờ: {bill.waitingMinutes} phút
                        </span>
                      </div>
                      <span className="font-sans text-black font-bold">
                        Vào: {bill.checkInTime}
                      </span>
                    </div>

                  </div>
                )
              })
            )}
          </div>
        </aside>

        {/* 2. Main Billing Panel (65% width) */}
        <main className="w-full lg:w-[65%] bg-[#FFF8F6] flex flex-col overflow-visible lg:overflow-hidden">
          {bills.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center p-12 text-center">
              <div className="h-16 w-16 bg-[#FAF6EE] rounded-3xl border border-[#E2D9C8] flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-extrabold text-xl text-gray-800 font-serif">Đã quyết toán hết</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Tất cả các hoá đơn thanh toán đã được xử lý. Quay lại màn hình phục vụ để mở bàn mới.
              </p>
            </div>
          ) : (
            <div className="flex-grow flex flex-col overflow-visible lg:overflow-hidden">
              
              {/* Header details section */}
              <section className="bg-white border-b border-[#C0392B]/10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0 text-left shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-lg text-gray-800 font-serif tracking-tight">
                      Thanh toán cho {currentBill.tableName}
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Khách ngồi: <span className="font-bold text-gray-700">{currentBill.guests} khách</span> • Giờ vào: <span className="font-bold text-gray-700 font-mono">{currentBill.checkInTime}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md font-mono">
                    MÃ HOÁ ĐƠN: {currentBill.id}
                  </span>
                  <p className="text-xs text-gray-500 mt-1 font-mono">Thu ngân: Emma Watson</p>
                </div>
              </section>

              {/* Center Scrolling receipt block and Summary Split Grid */}
              <section className="flex-1 flex flex-col lg:flex-row overflow-visible lg:overflow-hidden p-4 sm:p-6 gap-6">
                
                {/* Center-Left: Receipt Line item POS grid table */}
                <div className="flex-1 bg-white border border-[#E2D9C8] rounded-2xl overflow-hidden flex flex-col shadow-sm">
                  
                  {/* Table Header labels */}
                  <div className="hidden sm:grid bg-gray-50 border-b border-gray-100 px-4 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider grid-cols-12 text-left shrink-0">
                    <span className="col-span-5">Món ăn / Ghi chú</span>
                    <span className="col-span-2 text-center">SL</span>
                    <span className="col-span-2 text-right">Đơn giá</span>
                    <span className="col-span-2 text-right">Thành tiền</span>
                    <span className="col-span-1"></span>
                  </div>

                  {/* Receipt Rows */}
                  <div className="flex-grow overflow-y-auto divide-y divide-gray-100">
                    {currentBill.orders.map((item) => (
                      <div key={item.id} className="px-4 py-3 grid grid-cols-6 sm:grid-cols-12 items-center gap-y-2 text-xs text-left group">
                        
                        {/* Name and Notes column (Notes editable with local input) */}
                        <div className="col-span-6 sm:col-span-5 flex flex-col justify-center">
                          <span className="font-bold text-gray-800 leading-tight block">{item.name}</span>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleEditNote(item.id, e.target.value)}
                            className="text-[10px] text-primary bg-transparent focus:bg-[#FAF6EE] focus:outline-none border-b border-transparent focus:border-primary/50 py-0.5 mt-1 max-w-[90%] font-mono truncate"
                            placeholder="Thêm hướng dẫn chế biến..."
                            title="Nhấp để sửa hướng dẫn"
                          />
                        </div>

                        {/* Interactive Qty columns */}
                        <div className="col-span-2 flex items-center justify-start sm:justify-center gap-1.5">
                          <button
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="h-6 w-6 rounded-full bg-gray-100 text-gray-500 font-extrabold flex items-center justify-center hover:bg-gray-200 active:scale-90"
                          >
                            -
                          </button>
                          <span className="font-bold font-mono text-gray-800 w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="h-6 w-6 rounded-full bg-gray-100 text-gray-500 font-extrabold flex items-center justify-center hover:bg-gray-200 active:scale-90"
                          >
                            +
                          </button>
                        </div>

                        {/* Unit price */}
                        <span className="col-span-2 text-right font-mono text-gray-500 font-medium">
                          {formatPrice(item.price)}
                        </span>

                        {/* Total Line item cost */}
                        <span className="col-span-2 text-right font-mono font-bold text-gray-800">
                          {formatPrice(item.price * item.quantity)}
                        </span>

                        {/* Trash actions */}
                        <div className="col-span-6 sm:col-span-1 flex justify-end">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-gray-400 hover:text-primary transition-all active:scale-90 opacity-0 group-hover:opacity-100 shrink-0"
                            title="Xoá món"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Sub-summary metrics block */}
                  <div className="border-t border-gray-100 p-4 bg-gray-50 shrink-0 text-xs">
                    <div className="flex justify-between text-gray-500 font-medium my-0.5">
                      <span>Tạm tính món</span>
                      <span className="font-mono">{formatPrice(subtotal)}</span>
                    </div>

                    {/* Member VIP discount display */}
                    {discount > 0 && (
                      <div className="flex justify-between text-[#B7950B] font-bold my-0.5">
                        <span className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#B7950B]" />
                          <span>Giảm giá đã áp dụng ({currentBill.discountCode})</span>
                        </span>
                        <span className="font-mono">-{formatPrice(discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-500 font-medium my-0.5">
                      <span>Thuế VAT (8%)</span>
                      <span className="font-mono">{formatPrice(tax)}</span>
                    </div>

                    {/* Massive Bold Grand Total styled in solid red */}
                    <div className="flex justify-between font-extrabold pt-2 border-t border-dashed border-gray-200 mt-2 text-lg text-primary">
                      <span>TỔNG CỘNG THANH TOÁN</span>
                      <span className="font-mono text-xl">{formatPrice(total)}</span>
                    </div>
                  </div>

                </div>

                {/* Center-Right: Numeric Keypad cash calculator & Cash Received summary */}
                <div className="w-full lg:w-[42%] flex flex-col gap-4 shrink-0">
                  
                  {/* Keyboard readout display */}
                  <div className="bg-[#FAF6EE] border border-[#E2D9C8] rounded-2xl p-4 flex flex-col text-left">
                    <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                      <span>Tiền mặt nhận của khách</span>
                      <span className="text-[10px] text-gray-400 font-mono">VNĐ (đ)</span>
                    </div>

                    <div className="text-2xl font-bold font-mono text-gray-800 my-2 overflow-x-auto text-right">
                      {cashInput ? formatPrice(parseFloat(cashInput)) : '0 đ'}
                    </div>

                    {/* Change due mathematical output */}
                    {parseFloat(cashInput) > 0 && (
                      <div className="border-t border-dashed border-[#E2D9C8] pt-2 mt-2 flex items-center justify-between text-xs font-extrabold text-gray-600">
                        <span>Tiền thừa trả khách:</span>
                        <span className="font-mono text-emerald-600 text-sm font-bold">
                          {formatPrice(Math.max(0, parseFloat(cashInput) - total))}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3x4 POS Numeric Keypad */}
                  <div className="grid grid-cols-3 gap-2 bg-white border border-gray-200 p-3.5 rounded-2xl shadow-sm">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'C'].map((key) => (
                      <button
                        key={key}
                        onClick={() => handleKeyPress(key === 'C' ? 'C' : key)}
                        className={`min-h-[46px] text-sm font-extrabold rounded-xl active-press flex items-center justify-center ${
                          key === 'C'
                            ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-[#FAF6EE]/50 hover:bg-[#FAF6EE] text-gray-700 border border-gray-200'
                        }`}
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  {/* Keypad Quick cash shortcuts */}
                  <div className="grid grid-cols-4 gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCashShortcut('exact')}
                      className="py-2.5 text-[10px] font-extrabold bg-[#C0392B]/10 border border-[#C0392B]/20 text-[#C0392B] hover:bg-primary hover:text-white rounded-xl uppercase transition-all active-press"
                      title="Thanh toán chính xác số tiền"
                    >
                      Đủ tiền
                    </button>
                    {[50000, 100000, 500000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleCashShortcut(amount)}
                        className="py-2.5 text-[10px] font-extrabold bg-white border border-[#E2D9C8] text-gray-600 hover:border-primary/50 hover:text-primary rounded-xl transition-all active-press font-mono"
                      >
                        +{amount / 1000}k
                      </button>
                    ))}
                  </div>

                </div>

              </section>

              {/* Bottom Cashier Action Button Row (Split bill, Print, Voucher, Confirm) */}
              <section className="bg-white border-t border-gray-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 sm:flex sm:items-center gap-3 w-full sm:w-auto">
                  {/* Action: Merge Bill */}
                  <button
                    onClick={() => {
                      setMergeSelectionIds([])
                      setIsMergeModalOpen(true)
                    }}
                    disabled={bills.length < 2}
                    className="min-h-[46px] flex-1 sm:flex-initial px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-2 active-press disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Receipt className="w-4 h-4 text-gray-500" />
                    <span>Gộp HĐ</span>
                  </button>

                  {/* Action: Split Bill */}
                  <button
                    onClick={() => {
                      setSplitQuantities({})
                      setIsSplitModalOpen(true)
                    }}
                    className="min-h-[46px] flex-1 sm:flex-initial px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-2 active-press"
                  >
                    <Split className="w-4 h-4 text-gray-500" />
                    <span>Tách HĐ</span>
                  </button>

                  {/* Action: Apply Voucher */}
                  <button
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="min-h-[46px] flex-1 sm:flex-initial px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-2 active-press"
                  >
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span>Mã KM</span>
                  </button>

                  {/* Action: Print Temp Bill */}
                  <button
                    onClick={() => showToast('Đã in hoá đơn tạm tính vào hàng đợi.', 'success')}
                    className="min-h-[46px] flex-1 sm:flex-initial px-4 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase transition-all flex items-center justify-center gap-2 active-press"
                  >
                    <Printer className="w-4 h-4 text-gray-500" />
                    <span>In tạm tính</span>
                  </button>
                </div>

                {/* Massive prominent CONFIRM PAYMENT button bottom-right */}
                <div className="w-full sm:w-auto flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleConfirmPayment}
                    className="min-h-[48px] w-full sm:w-64 bg-primary hover:bg-[#A93226] text-[#FFF8F6] font-extrabold rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 active-press cursor-pointer"
                  >
                    <Coins className="w-5 h-5 text-white" />
                    <span>Xác nhận thanh toán</span>
                  </button>
                </div>
              </section>

            </div>
          )}
        </main>
      </div>

      {/* --- EXTRA POS INTERACTION MODALS --- */}

      {/* MODAL A: Apply Voucher popup */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsVoucherModalOpen(false)}></div>
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">Áp dụng mã giảm giá</h3>
              <button
                onClick={() => setIsVoucherModalOpen(false)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-normal">
              Nhập mã giảm giá thành viên VIP hoặc mã chiến dịch của nhà hàng dưới đây để điều chỉnh tổng thanh toán.
            </p>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Ví dụ: KHOIVIP10"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value)}
                className="w-full bg-[#FAF6EE] text-sm font-mono font-bold px-4 py-2.5 rounded-xl border border-[#E2D9C8] focus:border-primary focus:outline-none uppercase"
              />

              <div className="border border-dashed border-gray-200 p-3 rounded-xl bg-gray-50 space-y-1.5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Dữ liệu khuyến mãi POS</span>
                <div 
                  onClick={() => setVoucherCodeInput('KHOIVIP10')}
                  className="flex justify-between items-center text-xs font-bold text-gray-700 cursor-pointer hover:text-primary transition-all py-0.5"
                >
                  <span className="font-mono">KHOIVIP10</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md">Thành viên VIP giảm 10%</span>
                </div>
                <div 
                  onClick={() => setVoucherCodeInput('WELCOME50')}
                  className="flex justify-between items-center text-xs font-bold text-gray-700 cursor-pointer hover:text-primary transition-all py-0.5"
                >
                  <span className="font-mono">WELCOME50</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md">Chào mừng giảm 25%</span>
                </div>
                <div 
                  onClick={() => setVoucherCodeInput('KHOISTAF15')}
                  className="flex justify-between items-center text-xs font-bold text-gray-700 cursor-pointer hover:text-primary transition-all py-0.5"
                >
                  <span className="font-mono">KHOISTAF15</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md">Nhân viên giảm 15%</span>
                </div>
              </div>

              <button
                onClick={handleApplyVoucher}
                disabled={!voucherCodeInput.trim()}
                className="w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide disabled:opacity-50 active-press"
              >
                Kiểm tra và áp dụng mã
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B1: Merge bills into current bill */}
      {isMergeModalOpen && currentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsMergeModalOpen(false)}></div>
          <div className="w-full max-w-lg bg-white rounded-2xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-gray-800 font-serif">Gộp hoá đơn thanh toán</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Chọn các bill cần gộp vào <span className="font-bold text-primary font-mono">#{currentBill.id}</span>.
                </p>
              </div>
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {bills
                .filter((bill) => bill.id !== currentBill.id)
                .map((bill) => {
                  const billSummary = getBillingSummary(bill)
                  const isSelected = mergeSelectionIds.includes(bill.id)

                  return (
                    <button
                      key={bill.id}
                      onClick={() => handleToggleMergeBill(bill.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all active-press ${
                        isSelected
                          ? 'bg-primary/5 border-primary text-gray-900'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-extrabold">{bill.tableName}</p>
                          <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                            #{bill.id} • {bill.guests} khách • {bill.orders.length} dòng món
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-extrabold font-mono text-primary">
                            {formatPrice(billSummary.total)}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-0.5">
                            {isSelected ? 'Đã chọn' : 'Chọn gộp'}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>

            <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-600">
              <div className="flex justify-between font-bold">
                <span>Số bill sẽ gộp:</span>
                <span>{mergeSelectionIds.length + 1}</span>
              </div>
              <div className="flex justify-between font-bold mt-1">
                <span>Ước tính sau gộp:</span>
                <span className="font-mono text-primary">
                  {formatPrice(
                    getBillingSummary(currentBill).total +
                      bills
                        .filter((bill) => mergeSelectionIds.includes(bill.id))
                        .reduce((sum, bill) => sum + getBillingSummary(bill).total, 0)
                  )}
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setIsMergeModalOpen(false)}
                className="min-h-[44px] flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs uppercase active-press"
              >
                Huỷ
              </button>
              <button
                onClick={handleMergeBills}
                disabled={mergeSelectionIds.length === 0}
                className="min-h-[44px] flex-[1.5] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide disabled:opacity-50 disabled:pointer-events-none active-press"
              >
                Xác nhận gộp bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL B: Split Bill details modal */}
      {isSplitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsSplitModalOpen(false)}></div>
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">Tách hoá đơn thanh toán</h3>
              <button
                onClick={() => setIsSplitModalOpen(false)}
                className="h-8 w-8 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all active-press"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-5 leading-normal">
              Chia đều tổng số tiền hoá đơn <span className="font-bold text-gray-700 font-mono">{formatPrice(total)}</span> cho số khách tại bàn.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div>
                <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                  Món cần tách
                </h4>
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {currentBill?.orders.map((item) => {
                    const selectedQty = splitQuantities[item.id] || 0

                    return (
                      <div key={item.id} className="border border-gray-200 rounded-xl p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800 leading-snug">{item.name}</p>
                            <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                              {formatPrice(item.price)} • còn {item.quantity} phần
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 border border-gray-200 rounded-lg p-1">
                            <button
                              onClick={() => handleUpdateSplitQty(item.id, -1, item.quantity)}
                              className="h-7 w-7 rounded bg-white border border-gray-200 text-gray-700 font-extrabold"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-bold font-mono text-gray-800">{selectedQty}</span>
                            <button
                              onClick={() => handleUpdateSplitQty(item.id, 1, item.quantity)}
                              className="h-7 w-7 rounded bg-white border border-gray-200 text-gray-700 font-extrabold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        {selectedQty > 0 && (
                          <div className="mt-2 flex justify-between text-[10px] font-bold text-primary border-t border-dashed border-gray-100 pt-2">
                            <span>Sẽ tách</span>
                            <span className="font-mono">{formatPrice(item.price * selectedQty)}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <h4 className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                    Bill mới
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between font-bold text-gray-600">
                      <span>Số món đã chọn:</span>
                      <span>{Object.values(splitQuantities).reduce((sum, qty) => sum + qty, 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-600">
                      <span>Tạm tính bill tách:</span>
                      <span className="font-mono text-primary">
                        {formatPrice(
                          currentBill?.orders.reduce(
                            (sum, item) => sum + item.price * (splitQuantities[item.id] || 0),
                            0
                          ) || 0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-600">
                      <span>VAT 8%:</span>
                      <span className="font-mono">
                        {formatPrice(
                          (currentBill?.orders.reduce(
                            (sum, item) => sum + item.price * (splitQuantities[item.id] || 0),
                            0
                          ) || 0) * 0.08
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-extrabold text-primary border-t border-dashed border-gray-200 pt-2 mt-2">
                      <span>Tổng bill tách:</span>
                      <span className="font-mono">
                        {formatPrice(
                          (currentBill?.orders.reduce(
                            (sum, item) => sum + item.price * (splitQuantities[item.id] || 0),
                            0
                          ) || 0) * 1.08
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCreateSplitBill}
                    disabled={Object.keys(splitQuantities).length === 0}
                    className="mt-4 w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide disabled:opacity-50 disabled:pointer-events-none active-press"
                  >
                    Tạo bill tách mới
                  </button>
                </div>
              
              {/* Divider counter widget */}
              <div className="bg-[#FAF6EE] border border-[#E2D9C8] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">Số phần chia</span>
                  <span className="text-lg font-bold text-gray-800 font-mono">{splitCount} người</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSplitCount((c) => Math.max(2, c - 1))}
                    className="h-10 w-10 bg-white border border-[#E2D9C8] text-gray-700 rounded-lg flex items-center justify-center hover:border-primary/50 transition-all font-extrabold text-sm active-press"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setSplitCount((c) => Math.min(10, c + 1))}
                    className="h-10 w-10 bg-white border border-[#E2D9C8] text-gray-700 rounded-lg flex items-center justify-center hover:border-primary/50 transition-all font-extrabold text-sm active-press"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tally result */}
              <div className="text-center bg-gray-50 border border-gray-100 rounded-xl p-5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-1">Số tiền trên mỗi người</span>
                <span className="text-3xl font-extrabold text-primary font-mono block">
                  {formatPrice(splitAmount)}
                </span>
                <span className="text-[10px] text-gray-400 block mt-1.5 font-mono">
                  {splitCount} × {formatPrice(splitAmount)} = {formatPrice(total)}
                </span>
              </div>

              {/* Close split popup */}
              <button
                onClick={() => {
                  setCashInput(Math.round(splitAmount).toString())
                  setIsSplitModalOpen(false)
                  showToast(`Đã nhập số tiền chia ${formatPrice(splitAmount)} vào máy tính!`, 'success')
                }}
                className="w-full min-h-[44px] bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4 text-white" />
                <span>Áp dụng số tiền chia vào ô nhập tiền</span>
              </button>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* MODAL C: Thermal Invoice Paid Receipt Popup */}
      {isPaymentSuccessOpen && lastPaidReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="absolute inset-0" onClick={() => setIsPaymentSuccessOpen(false)}></div>
          <div className="w-full max-w-sm bg-white rounded-t-[2rem] sm:rounded-[2rem] border border-[#C0392B]/10 shadow-premium-lg p-6 z-10 animate-slide-up text-left">
            <div className="text-center border-b border-dashed border-gray-200 pb-5">
              <div className="h-12 w-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-emerald-600 animate-bounce" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-800 font-serif">Thanh toán thành công</h3>
              <p className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-md inline-block uppercase tracking-wider mt-1.5">
                HOÁ ĐƠN ĐÃ THANH TOÁN
              </p>
            </div>

            {/* Receipt Summary Details */}
            <div className="py-5 font-mono text-xs space-y-2 border-b border-dashed border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-400">Bàn ăn thanh toán:</span>
                <span className="font-bold text-gray-700">{lastPaidReceipt.tableName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mã hoá đơn POS:</span>
                <span className="font-bold text-gray-700">#{lastPaidReceipt.billId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tổng thanh toán:</span>
                <span className="font-bold text-primary">{formatPrice(lastPaidReceipt.total)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <span className="text-gray-400">Tiền mặt khách đưa:</span>
                <span className="font-bold text-gray-700">{formatPrice(lastPaidReceipt.cashPaid)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tiền thừa trả lại:</span>
                <span className="font-bold text-emerald-600">{formatPrice(lastPaidReceipt.change)}</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  setIsPaymentSuccessOpen(false)
                  showToast('Đang in lại hoá đơn cho khách...', 'info')
                }}
                className="min-h-[44px] flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs uppercase active-press flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-gray-500" />
                <span>In lại</span>
              </button>
              <button
                onClick={() => setIsPaymentSuccessOpen(false)}
                className="min-h-[44px] flex-1 bg-primary hover:bg-[#A93226] text-white font-bold rounded-xl text-xs uppercase tracking-wide active-press"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Toast Alert Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-[#C0392B]/10 shadow-premium-lg px-4 py-3.5 rounded-xl flex items-center gap-2.5 animate-slide-up max-w-sm text-xs font-bold">
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
          ) : (
            <Calculator className="w-5 h-5 text-[#B7950B] shrink-0" />
          )}
          <span className="text-gray-700">{toastMessage.text}</span>
        </div>
      )}

    </div>
  )
}
