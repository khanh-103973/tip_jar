Dựa vào câu trả lời của bạn — địa chỉ cố định, có lời nhắn + lịch sử tip, giao diện tối giản — đây là kế hoạch đầy đủ:

---

## Implementation Plan: USDC Tip Jar

### Summary
Một trang tip đơn giản cho phép người dùng kết nối ví và gửi USDC kèm lời nhắn đến một địa chỉ creator cố định trên Arc Testnet. Lịch sử tip được đọc trực tiếp từ blockchain thông qua event logs.

### Architecture
- **Blockchain:** Arc Testnet — USDC là native gas token, phí giao dịch ổn định và nhanh, phù hợp cho người mới
- **Contract:** Không cần smart contract riêng — dùng trực tiếp ERC-20 `transfer` của USDC kèm event log để lưu lịch sử. Lời nhắn được ghi vào một contract nhỏ (`TipJar.sol`) để emit event `TipSent(address sender, uint256 amount, string message)`
- **Frontend:** React + Vite + Tailwind CSS, wagmi hooks cho onchain interaction, ConnectKit cho wallet connection
- **Wallet:** ConnectKit (mặc định)

### Files to Create/Modify

1. `contracts/src/TipJar.sol` — Smart contract nhận tip, emit event `TipSent` kèm lời nhắn và số tiền
2. `src/config.ts` — Thêm địa chỉ creator cố định và địa chỉ contract sau khi deploy
3. `src/providers/Web3Provider.tsx` — Cấu hình wagmi + ConnectKit cho Arc Testnet
4. `src/App.tsx` — Layout chính: header với nút kết nối ví, khu vực tip form và lịch sử
5. `src/components/TipForm.tsx` — Form gửi tip: preset amounts ($0.01, $0.05, $0.10, $0.25), custom amount, ô nhập lời nhắn, nút Send, trạng thái giao dịch
6. `src/components/TipHistory.tsx` — Đọc event `TipSent` từ contract, hiển thị danh sách tip gần nhất (địa chỉ rút gọn, số tiền, lời nhắn, thời gian)
7. `src/components/USDCBalance.tsx` — Hiển thị số dư USDC của ví đang kết nối
8. `src/index.css` — Style tối giản, clean

### Build Sequence

1. **Viết và deploy contract** — `TipJar.sol` nhận USDC transfer + emit event có lời nhắn; deploy lên Arc Testnet, lưu địa chỉ vào `src/config.ts`
2. **Cấu hình Web3** — Setup wagmi + ConnectKit trong `Web3Provider.tsx`, kết nối Arc Testnet
3. **Build TipForm** — Preset amount buttons, custom input, message field, chain validation, gọi `writeContract` đến TipJar, hiển thị trạng thái (pending → confirming → success + link explorer)
4. **Build TipHistory** — Dùng `useContractEvents` / `getLogs` đọc event `TipSent`, render danh sách đẹp
5. **Build USDCBalance + App layout** — Header, balance display, ghép các component lại
6. **Polish UI** — Tailwind styling tối giản, responsive, faucet reminder cho testnet

### Done When

- [ ] Ví kết nối được qua ConnectKit trên Arc Testnet
- [ ] Chọn preset amount hoặc nhập custom amount thành công
- [ ] Nhập lời nhắn và gửi tip — transaction được confirm trên chain
- [ ] Link explorer hiển thị sau khi giao dịch thành công
- [ ] Lịch sử tip hiển thị đúng: địa chỉ, số tiền, lời nhắn
- [ ] Số dư USDC hiển thị và cập nhật sau khi gửi
- [ ] Xử lý đúng các lỗi: sai chain, insufficient balance, user reject

---

## Ready to build?

Bấm **Approve** để build agent bắt đầu thực hiện theo đúng kế hoạch này. Nếu bạn muốn thay đổi gì (ví dụ thêm avatar creator, đổi preset amounts) hãy cho tôi biết trước. Kế hoạch đã được lưu vào `arc-studio-plans/PLAN.md`.

Chuyển sang **Build mode** để bắt đầu xây dựng, hoặc cho tôi biết nếu bạn muốn điều chỉnh gì trước.
