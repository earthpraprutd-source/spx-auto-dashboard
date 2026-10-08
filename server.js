const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ให้ Node.js อ่าน JSON
app.use(express.json());

// ให้เปิดไฟล์ HTML, CSS, JS ในโฟลเดอร์เดียวกัน
app.use(express.static(path.join(__dirname)));

// API ทดสอบ
app.get("/api/health", (req, res) => {
    res.json({
        status: "OK",
        message: "SPX Auto Dashboard API is running",
        time: new Date().toISOString()
    });
});

// API สำหรับ Work Orders
// ตอนนี้ใช้ข้อมูลทดสอบก่อน
app.get("/api/work-orders", (req, res) => {
    const workOrders = [
        {
            id: "CM-HUB04743",
            time: "28/09/2026",
            email: "bad.a-dae@spxexpress.com",
            tel: "0980464454",
            hub: "ASDAO-B",
            priority: "High",
            item: "หลอดไฟโคมไฮเบย์",
            cause: "หลอดไฟเสีย",
            qty: 6
        },
        {
            id: "CM-HUB04744",
            time: "28/09/2026",
            email: "rujipas.han@spxexpress.com",
            tel: "0877665432",
            hub: "HPKNG-D",
            priority: "High",
            item: "หลอดไฟ",
            cause: "LED ชำรุดตามอายุ",
            qty: 2
        }
    ];

    res.json(workOrders);
});

// เปิดหน้าเว็บ
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Start Server
app.listen(PORT, () => {
    console.log(`SPX Auto Dashboard running on port ${PORT}`);
});
