const express = require("express");
const router = express.Router();
const cors = require("cors");

// ✅ Allowed origins for CORS
const allowedOrigins = [
  'https://anon-stake-verse.vercel.app',
  'https://anon-stake-verse-kyc.vercel.app',
];

// ✅ CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type,Authorization',
};

// ✅ Apply CORS globally to all requests
router.use(cors(corsOptions));

// ✅ Handle preflight requests for all routes
router.options('*', cors(corsOptions));

// ✅ Import all controllers
const {
  test,
  Delete,
  Decline,
  Approve,
  loginUser,
  createUser,
  deleteChat,
  getMessage,
  loginAdmin,
  chatSend,
  getUser,
  getUsers,
  addBalance,
  withdrawBank,
  getAdminChat,
  getAccountLevel,
  withdrawCrypto,
  AdminGetCrypto,
  AdminGetBankR,
  upgradeAccount,
  getBankRecords,
  getNotification,
  getCryptoRecords,
  notificationAdder,
  userNotification,
  DeclineKyc,
  DeleteKyc,
  ApproveKyc,
  fetchAllKyc,
  fetchKyc,
  fetchOTP,
  verifyOtp,
  getOTP,
  userInfo,
  citizenId,
  createNotification
} = require("../controllers/authController");

// ✅ Define routes
router.get('/test', test);
router.post("/Delete", Delete);
router.post("/Approve", Approve);
router.post("/Decline", Decline);
router.post("/getUser", getUser);
router.get("/getUsers", getUsers);
router.post('/login', loginUser);
router.post("/getOTP", getOTP);
router.post("/approveKyc", ApproveKyc);
router.post("/deleteKyc", DeleteKyc);
router.post("/declineKyc", DeclineKyc);
router.post("/userInfo", userInfo);
router.post("/fetchOTP", fetchOTP);
router.post("/fetchKyc", fetchKyc);
router.post("/verifyOtp", verifyOtp);
router.get("/fetchAllKyc", fetchAllKyc);
router.post("/citizenId", citizenId);
router.post("/chatSend", chatSend);
router.post('/register', createUser);
router.post('/adminAuth', loginAdmin);
router.post('/addBalance', addBalance);
router.post("/deleteChat", deleteChat);
router.post("/getMessage", getMessage);
router.post("/getAdminChat", getAdminChat);
router.post("/withdrawBank", withdrawBank);
router.post("/AdminGetBankR", AdminGetBankR);
router.post("/upgradeAccount", upgradeAccount);
router.post("/AdminGetCrypto", AdminGetCrypto);
router.post("/withdrawCrypto", withdrawCrypto);
router.post("/getBankRecords", getBankRecords);
router.post("/userMessage", notificationAdder);
router.post("/getAccountLevel", getAccountLevel);
router.post("/getNotification", getNotification);
router.post("/userNotification", userNotification);
router.post("/getCryptoRecords", getCryptoRecords);
router.post("/notification", createNotification);

module.exports = router;
