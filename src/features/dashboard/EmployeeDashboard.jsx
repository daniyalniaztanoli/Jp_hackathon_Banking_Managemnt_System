import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, AppBar, Toolbar,
  Avatar, Tabs, Tab, Grid, IconButton, Alert, CircularProgress, Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import bankLogo from "../../assets/bank-logo.svg";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer, updateCustomerBalance } from "../customers/customersSlice";
import { fetchTransactions, updateTransactionStatus } from "../transactions/transactionsSlice";
import { fetchLoans, decideLoan, LOAN_APPROVAL_LIMIT } from "../loans/loansSlice";
import { logoutUser } from "../auth/authSlice";
import { fsSubscribe } from "../../firebase/firestoreService";

const statusColor = { approved: "success", pending: "warning", rejected: "error" };
const emptyForm = { name: "", email: "", password: "", balance: "", status: "active" };

const StatCard = ({ icon, label, value, color }) => (
  <Card>
    <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: "20px !important" }}>
      <Box sx={{ p: 1.5, bgcolor: `${color}18`, borderRadius: 3 }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const EmployeeDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const customers = useSelector((state) => state.customers.list);
  const transactions = useSelector((state) => state.transactions.list);
  const loans = useSelector((state) => state.loans.list);
  const custStatus = useSelector((state) => state.customers.status);

  const [tab, setTab] = useState(0);

  // Customer dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const unsubCustomers = fsSubscribe("customers", (data) => {
      dispatch({ type: "customers/fetchAll/fulfilled", payload: data });
    });
    const unsubTx = fsSubscribe("transactions", (data) => {
      dispatch({ type: "transactions/fetchAll/fulfilled", payload: data });
    });
    const unsubLoans = fsSubscribe("loans", (data) => {
      dispatch({ type: "loans/fetchAll/fulfilled", payload: data });
    });
    return () => { unsubCustomers(); unsubTx(); unsubLoans(); };
  }, [dispatch]);

  const openCreate = () => { setEditTarget(null); setForm(emptyForm); setFormError(""); setDialogOpen(true); };
  const openEdit = (row) => { setEditTarget(row); setForm({ name: row.name, email: row.email, balance: row.balance, status: row.status }); setFormError(""); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) return setFormError("Name is required.");
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) return setFormError("Valid email is required.");
    if (!editTarget && form.password.length < 6) return setFormError("Password must be at least 6 characters.");
    if (form.balance === "" || Number(form.balance) < 0) return setFormError("Valid balance is required.");
    if (editTarget) {
      dispatch(updateCustomer({ id: editTarget.id, ...form, balance: Number(form.balance) }));
      setDialogOpen(false);
    } else {
      const result = await dispatch(createCustomer({ ...form, balance: Number(form.balance) }));
      if (result.meta.requestStatus === "rejected") return setFormError(result.payload || "Failed to create customer.");
      setDialogOpen(false);
    }
    setForm(emptyForm);
    setFormError("");
  };

  const handleDelete = () => {
    dispatch(deleteCustomer(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleTxDecision = (row, status) => {
    dispatch(updateTransactionStatus({ id: row.id, status })).then(() => {
      if (status === "approved") {
        const customer = customers.find((c) => c.id === row.customerId);
        if (customer) {
          const delta = row.type === "deposit" ? row.amount : -row.amount;
          dispatch(updateCustomerBalance({ id: customer.id, balance: customer.balance + delta }));
        }
      }
    });
  };

  const handleLoanDecision = (row, status) => {
    dispatch(decideLoan({ id: row.id, status, approvedBy: user.profile.name, approvedById: user.profile.id })).then(() => {
      if (status === "approved") {
        const customer = customers.find((c) => c.id === row.customerId);
        if (customer) dispatch(updateCustomerBalance({ id: customer.id, balance: customer.balance + row.amount }));
      }
    });
  };

  const pendingTx = transactions.filter((t) => t.status === "pending").length;
  const pendingLoans = loans.filter((l) => l.status === "pending" && l.amount <= LOAN_APPROVAL_LIMIT).length;

  const customerColumns = [
    {
      field: "name", headerName: "Name", flex: 1,
      renderCell: (p) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "primary.main" }}>{p.value?.charAt(0)}</Avatar>
          <Typography variant="body2" fontWeight={600}>{p.value}</Typography>
        </Box>
      ),
    },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "balance", headerName: "Balance (Rs)", flex: 1, renderCell: (p) => <Typography variant="body2" fontWeight={600}>Rs {p.value?.toLocaleString()}</Typography> },
    { field: "status", headerName: "Status", flex: 0.8, renderCell: (p) => <Chip label={p.value} color="success" size="small" /> },
    {
      field: "actions", headerName: "Actions", flex: 1, sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => openEdit(p.row)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget(p.row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const txColumns = [
    { field: "customerId", headerName: "Customer ID", flex: 1 },
    { field: "type", headerName: "Type", flex: 0.8, renderCell: (p) => <Typography variant="body2" sx={{ textTransform: "capitalize" }}>{p.value}</Typography> },
    { field: "amount", headerName: "Amount (Rs)", flex: 1, renderCell: (p) => <Typography variant="body2" fontWeight={600}>Rs {p.value?.toLocaleString()}</Typography> },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 0.8, renderCell: (p) => <Chip label={p.value} color={statusColor[p.value]} size="small" /> },
    {
      field: "actions", headerName: "Actions", flex: 1.5, sortable: false,
      renderCell: (p) => p.row.status === "pending" ? (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutlinedIcon />} onClick={() => handleTxDecision(p.row, "approved")}>Approve</Button>
          <Button size="small" variant="outlined" color="error" startIcon={<CancelOutlinedIcon />} onClick={() => handleTxDecision(p.row, "rejected")}>Reject</Button>
        </Box>
      ) : "—",
    },
  ];

  const loanColumns = [
    { field: "customerId", headerName: "Customer ID", flex: 1 },
    { field: "amount", headerName: "Amount (Rs)", flex: 1, renderCell: (p) => <Typography variant="body2" fontWeight={600}>Rs {p.value?.toLocaleString()}</Typography> },
    { field: "purpose", headerName: "Purpose", flex: 1.5 },
    { field: "duration", headerName: "Duration", flex: 0.8 },
    { field: "status", headerName: "Status", flex: 0.8, renderCell: (p) => <Chip label={p.value} color={statusColor[p.value]} size="small" /> },
    {
      field: "actions", headerName: "Actions", flex: 1.8, sortable: false,
      renderCell: (p) => p.row.status === "pending" && p.row.amount <= LOAN_APPROVAL_LIMIT ? (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutlinedIcon />} onClick={() => handleLoanDecision(p.row, "approved")}>Approve</Button>
          <Button size="small" variant="outlined" color="error" startIcon={<CancelOutlinedIcon />} onClick={() => handleLoanDecision(p.row, "rejected")}>Reject</Button>
        </Box>
      ) : p.row.amount > LOAN_APPROVAL_LIMIT ? (
        <Chip label="Manager Required" size="small" color="warning" variant="outlined" />
      ) : "—",
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 2, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box component="img" src={bankLogo} alt="logo" sx={{ width: 36, height: 36 }} />
            <Typography variant="h6" fontWeight={700}>Enterprise Banking</Typography>
            <Chip label="Employee" size="small" sx={{ bgcolor: "rgba(201,168,76,0.2)", color: "#C9A84C", fontWeight: 600, ml: 1 }} />
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
        <Box mb={4}>
          <Typography variant="h5" fontWeight={700} color="primary.main">Employee Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Manage customers, transactions and loan approvals</Typography>
        </Box>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={4}>
            <StatCard icon={<PeopleAltIcon sx={{ color: "#0B1F3A" }} />} label="Total Customers" value={customers.length} color="#0B1F3A" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard icon={<ReceiptLongIcon sx={{ color: "#D68910" }} />} label="Pending Transactions" value={pendingTx} color="#D68910" />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard icon={<CreditScoreIcon sx={{ color: "#0D7A5F" }} />} label="Loans to Review" value={pendingLoans} color="#0D7A5F" />
          </Grid>
        </Grid>

        <Card>
          <CardContent sx={{ p: "0 !important" }}>
            <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 3, pt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} TabIndicatorProps={{ style: { backgroundColor: "#0B1F3A" } }}>
                <Tab label="Customers" icon={<PeopleAltIcon fontSize="small" />} iconPosition="start" />
                <Tab label="Transactions" icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" />
                <Tab label="Loans" icon={<CreditScoreIcon fontSize="small" />} iconPosition="start" />
              </Tabs>
              {tab === 0 && (
                <Button variant="contained" startIcon={<PersonAddAltIcon />} size="small" onClick={openCreate} sx={{ mr: 1 }}>
                  Add Customer
                </Button>
              )}
            </Box>

            <Box sx={{ p: 3 }}>
              {tab === 0 && (
                custStatus === "loading"
                  ? <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
                  : <Box sx={{ height: 420 }}><DataGrid rows={customers} columns={customerColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} /></Box>
              )}
              {tab === 1 && (
                <Box sx={{ height: 420 }}><DataGrid rows={transactions} columns={txColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} /></Box>
              )}
              {tab === 2 && (
                <Box sx={{ height: 420 }}><DataGrid rows={loans} columns={loanColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} /></Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Create / Edit Customer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{editTarget ? "Edit Customer" : "Add New Customer"}</Typography>
          <IconButton size="small" onClick={() => setDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          {[
            { key: "name", label: "Full Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            ...(!editTarget ? [{ key: "password", label: "Login Password", type: "password" }] : []),
            { key: "balance", label: "Opening Balance (Rs)", type: "number" },
          ].map(({ key, label, type }) => (
            <TextField
              key={key} fullWidth label={label} type={type} margin="normal"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              inputProps={type === "number" ? { min: 0 } : {}}
              helperText={key === "password" ? "Customer will use this to login" : ""}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editTarget ? "Save Changes" : "Create Customer"}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>Delete Customer</Typography>
          <IconButton size="small" onClick={() => setDeleteTarget(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeDashboard;
