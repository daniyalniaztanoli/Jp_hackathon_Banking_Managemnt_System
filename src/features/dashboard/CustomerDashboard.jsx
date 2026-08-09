import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Grid, Card, CardContent, Typography, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Chip, AppBar, Toolbar, Avatar, CircularProgress, Alert, IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import bankLogo from "../../assets/bank-logo.svg";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import { fetchTransactions, createTransactionRequest } from "../transactions/transactionsSlice";
import { fetchLoans, requestLoan } from "../loans/loansSlice";
import { logoutUser } from "../auth/authSlice";
import { updateCustomerBalance } from "../customers/customersSlice";
import { fsSubscribe } from "../../firebase/firestoreService";

const statusColor = { approved: "success", pending: "warning", rejected: "error" };

const StatCard = ({ icon, label, value, gradient }) => (
  <Card sx={{ background: gradient, color: "white", border: "none", boxShadow: "0 4px 20px rgba(11,31,58,0.18)" }}>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: "20px !important" }}>
      <Box sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 3 }}>{icon}</Box>
      <Box>
        <Typography variant="body2" sx={{ opacity: 0.8, mb: 0.3 }}>{label}</Typography>
        <Typography variant="h6" fontWeight={700}>{value}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const transactions = useSelector((state) => state.transactions.list);
  const loans = useSelector((state) => state.loans.list);
  const txStatus = useSelector((state) => state.transactions.status);
  const loanStatus = useSelector((state) => state.loans.status);

  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [txType, setTxType] = useState("deposit");
  const [txAmount, setTxAmount] = useState("");
  const [txError, setTxError] = useState("");

  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanPurpose, setLoanPurpose] = useState("");
  const [loanDuration, setLoanDuration] = useState("");
  const [loanError, setLoanError] = useState("");

  const customerId = user?.profile?.id;

  useEffect(() => {
    if (!customerId) return;
    const unsubTx = fsSubscribe("transactions", (data) => {
      dispatch({ type: "transactions/fetchAll/fulfilled", payload: data.filter((t) => t.customerId === customerId) });
    }, "customerId", customerId);
    const unsubLoans = fsSubscribe("loans", (data) => {
      dispatch({ type: "loans/fetchAll/fulfilled", payload: data.filter((l) => l.customerId === customerId) });
    }, "customerId", customerId);
    return () => { unsubTx(); unsubLoans(); };
  }, [dispatch, customerId]);

  const WITHDRAW_MANAGER_LIMIT = 100000;

  const handleTxSubmit = async () => {
    const amount = Number(txAmount);
    if (!txAmount || amount <= 0) return setTxError("Please enter a valid amount.");

    if (txType === "withdraw") {
      const currentBalance = user?.profile?.balance || 0;
      if (amount > currentBalance) return setTxError(`Insufficient balance. Your balance is Rs ${currentBalance.toLocaleString()}.`);

      if (amount >= WITHDRAW_MANAGER_LIMIT) {
        // needs manager approval — create pending transaction
        dispatch(createTransactionRequest({ customerId, type: txType, amount, requiresManager: true }));
        setTxDialogOpen(false);
        setTxAmount("");
        setTxError("");
        return;
      }

      // auto approve small withdraw
      const result = await dispatch(createTransactionRequest({ customerId, type: txType, amount, status: "approved" }));
      if (result.meta.requestStatus === "fulfilled") {
        dispatch(updateCustomerBalance({ id: customerId, balance: currentBalance - amount }));
      }
    } else {
      dispatch(createTransactionRequest({ customerId, type: txType, amount }));
    }

    setTxDialogOpen(false);
    setTxAmount("");
    setTxError("");
  };

  const handleLoanSubmit = () => {
    if (!loanAmount || Number(loanAmount) <= 0) return setLoanError("Please enter a valid amount.");
    if (!loanPurpose.trim()) return setLoanError("Please enter the loan purpose.");
    if (!loanDuration || Number(loanDuration) <= 0) return setLoanError("Please enter a valid duration.");
    dispatch(requestLoan({ customerId, amount: Number(loanAmount), purpose: loanPurpose, duration: `${loanDuration} months` }));
    setLoanDialogOpen(false);
    setLoanAmount(""); setLoanPurpose(""); setLoanDuration(""); setLoanError("");
  };

  const txColumns = [
    { field: "type", headerName: "Type", flex: 1, renderCell: (p) => <Typography variant="body2" fontWeight={600} sx={{ textTransform: "capitalize" }}>{p.value}</Typography> },
    { field: "amount", headerName: "Amount (Rs)", flex: 1, renderCell: (p) => <Typography variant="body2" fontWeight={600}>Rs {p.value?.toLocaleString()}</Typography> },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1, renderCell: (p) => <Chip label={p.value} color={statusColor[p.value]} size="small" /> },
  ];

  const loanColumns = [
    { field: "amount", headerName: "Amount (Rs)", flex: 1, renderCell: (p) => <Typography variant="body2" fontWeight={600}>Rs {p.value?.toLocaleString()}</Typography> },
    { field: "purpose", headerName: "Purpose", flex: 1.5 },
    { field: "duration", headerName: "Duration", flex: 1 },
    { field: "status", headerName: "Status", flex: 1, renderCell: (p) => <Chip label={p.value} color={statusColor[p.value]} size="small" /> },
  ];

  const pendingTx = transactions.filter((t) => t.status === "pending").length;
  const activeLoans = loans.filter((l) => l.status === "approved").length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box component="img" src={bankLogo} alt="logo" sx={{ width: 36, height: 36 }} />
            <Typography variant="h6" fontWeight={700}>Enterprise Banking</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "#C9A84C", color: "#0B1F3A", width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
              {user?.profile?.name?.charAt(0)}
            </Avatar>
            <Typography variant="body2" color="rgba(255,255,255,0.85)" sx={{ display: { xs: "none", sm: "block" } }}>
              {user?.profile?.name}
            </Typography>
            <IconButton color="inherit" onClick={() => dispatch(logoutUser())} size="small">
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* Welcome */}
        <Box mb={4}>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            Good day, {user?.profile?.name} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary">Here's your financial overview</Typography>
        </Box>

        {/* Stat Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<AccountBalanceWalletIcon sx={{ color: "white" }} />}
              label="Current Balance"
              value={`Rs ${user?.profile?.balance?.toLocaleString()}`}
              gradient="linear-gradient(135deg, #0B1F3A 0%, #1A3558 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<TrendingUpIcon sx={{ color: "white" }} />}
              label="Pending Transactions"
              value={pendingTx}
              gradient="linear-gradient(135deg, #C9A84C 0%, #9A7A2E 100%)"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard
              icon={<CreditScoreIcon sx={{ color: "white" }} />}
              label="Active Loans"
              value={activeLoans}
              gradient="linear-gradient(135deg, #0D7A5F 0%, #085C47 100%)"
            />
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => setTxDialogOpen(true)}
            sx={{ px: 3 }}
          >
            Deposit / Withdraw
          </Button>
          <Button
            variant="outlined"
            startIcon={<CreditScoreIcon />}
            onClick={() => setLoanDialogOpen(true)}
            sx={{ px: 3, borderColor: "primary.main", color: "primary.main" }}
          >
            Request Loan
          </Button>
        </Box>

        {/* Transactions */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: "24px !important" }}>
            <Typography variant="h6" fontWeight={700} mb={2} color="primary.main">
              Transaction History
            </Typography>
            {txStatus === "loading" ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
            ) : (
              <Box sx={{ height: 320 }}>
                <DataGrid rows={transactions} columns={txColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Loans */}
        <Card>
          <CardContent sx={{ p: "24px !important" }}>
            <Typography variant="h6" fontWeight={700} mb={2} color="primary.main">
              Loan History
            </Typography>
            {loanStatus === "loading" ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
            ) : (
              <Box sx={{ height: 320 }}>
                <DataGrid rows={loans} columns={loanColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Transaction Dialog */}
      <Dialog open={txDialogOpen} onClose={() => { setTxDialogOpen(false); setTxError(""); }} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography fontWeight={700}>New Transaction Request</Typography>
          <IconButton size="small" onClick={() => setTxDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          {txError && <Alert severity="error" sx={{ mb: 2 }}>{txError}</Alert>}
          <TextField select fullWidth label="Transaction Type" value={txType} onChange={(e) => setTxType(e.target.value)} margin="normal">
            <MenuItem value="deposit">Deposit</MenuItem>
            <MenuItem value="withdraw">Withdraw</MenuItem>
            <MenuItem value="donation">Donation</MenuItem>
          </TextField>
          <TextField fullWidth label="Amount (Rs)" type="number" margin="normal" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} inputProps={{ min: 1 }} />
          {txType === "withdraw" && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Withdraw &lt; Rs 100,000 → auto approved. Rs 100,000 or above → Manager approval required.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setTxDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleTxSubmit}>Submit Request</Button>
        </DialogActions>
      </Dialog>

      {/* Loan Dialog */}
      <Dialog open={loanDialogOpen} onClose={() => { setLoanDialogOpen(false); setLoanError(""); }} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography fontWeight={700}>Request a Loan</Typography>
          <IconButton size="small" onClick={() => setLoanDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          {loanError && <Alert severity="error" sx={{ mb: 2 }}>{loanError}</Alert>}
          <TextField fullWidth label="Loan Amount (Rs)" type="number" margin="normal" value={loanAmount} onChange={(e) => setLoanAmount(e.target.value)} inputProps={{ min: 1 }} />
          <TextField fullWidth label="Purpose" margin="normal" value={loanPurpose} onChange={(e) => setLoanPurpose(e.target.value)} />
          <TextField fullWidth label="Duration (months)" type="number" margin="normal" value={loanDuration} onChange={(e) => setLoanDuration(e.target.value)} inputProps={{ min: 1 }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setLoanDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleLoanSubmit}>Submit Request</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerDashboard;
