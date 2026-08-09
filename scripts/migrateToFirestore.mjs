// Run once: node scripts/migrateToFirestore.mjs
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { config } from "dotenv";
config({ path: ".env" });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const data = {
  customers: [
    { id: "cust_001", name: "Ahmed", email: "ahmed@gmail.com", balance: 100000, status: "active" },
    { id: "9QnCEOdHoH4", name: "Daniyal", email: "dniaz0122@gmail.com", balance: 10000, status: "active" },
  ],
  employees: [
    { id: "emp_001", name: "Ali Raza", email: "ali@bank.com", salary: 60000, status: "active", role: "employee" },
    { id: "PMWUafchMRE", name: "Daniyal", email: "daniyal@bank.com", salary: 100000, status: "active", role: "employee" },
    { id: "1THizBaRCOg", name: "Danish", email: "danish@bank.com", salary: 50000, status: "active", role: "employee" },
  ],
  managers: [
    { id: "mgr_001", name: "Usman Malik", email: "manager@bank.com", role: "manager" },
  ],
  transactions: [
    { id: "txn_001", customerId: "cust_001", type: "deposit", amount: 50000, status: "approved", date: "2026-02-20" },
    { id: "txn_002", customerId: "cust_001", type: "withdraw", amount: 20000, status: "approved", date: "2026-02-21" },
    { id: "pe3utjX2IyY", customerId: "cust_001", type: "deposit", amount: 10000, status: "approved", date: "2026-08-09" },
    { id: "tL3bV8DPNHI", customerId: "cust_001", type: "withdraw", amount: 10000, status: "approved", date: "2026-08-09" },
    { id: "nSUmXKoTdlQ", customerId: "cust_001", type: "donation", amount: 1000, status: "approved", date: "2026-08-09" },
  ],
  loans: [
    { id: "loan_001", customerId: "cust_001", amount: 800000, purpose: "Business Expansion", duration: "12 months", status: "approved", approvedBy: "employee", approvedById: "emp_001" },
    { id: "loan_002", customerId: "cust_001", amount: 1500000, purpose: "Property Purchase", duration: "24 months", status: "approved", approvedBy: "Usman Malik", approvedById: "mgr_001" },
    { id: "bt1z1JLbPRI", customerId: "cust_001", amount: 10000, purpose: "House", duration: "12 months", status: "approved", approvedBy: "Ali Raza", approvedById: "emp_001" },
    { id: "UhC_TIe0eMc", customerId: "cust_001", amount: 3000, purpose: "Car Insurance", duration: "12 months", status: "rejected", approvedBy: "Ali Raza", approvedById: "emp_001" },
    { id: "-OEH79ZSbls", customerId: "cust_001", amount: 19, purpose: "naswar", duration: "1 months", status: "approved", approvedBy: "Ali Raza", approvedById: "emp_001" },
  ],
};

async function migrate() {
  for (const [col, records] of Object.entries(data)) {
    for (const record of records) {
      await setDoc(doc(db, col, String(record.id)), record);
      console.log(`✅ ${col}/${record.id}`);
    }
  }
  console.log("\n🎉 Migration complete!");
  process.exit(0);
}

migrate().catch((err) => { console.error(err); process.exit(1); });
