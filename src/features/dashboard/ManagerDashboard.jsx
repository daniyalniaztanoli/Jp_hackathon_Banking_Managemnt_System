import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box, Card, CardContent, Typography, Button, Chip, AppBar,
  Toolbar, Avatar, Tabs, Tab, Grid, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Alert, Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import bankLogo from "../../assets/bank-logo.svg";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CreditScoreIcon from "@mui/icons-material/CreditScore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import BadgeIcon from "@mui/icons-material/Badge";
import LogoutIcon from "@mui/icons-material/Logout";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { fetchCustomers, createCustomer, updateCustomer, deleteCustomer, updateCustomerBalance } from "../customers/customersSlice";
import { fetchTransactions, updateTransactionStatus } from "../transactions/transactionsSlice";
import { fetchLoans, decideLoan, LOAN_APPROVAL_LIMIT } from "../loans/loansSlice";
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee } from "../employees/employeesSlice";
import { logoutUser } from "../auth/authSlice";

const statusColor = { approved: "success", pending: "warning", rejected: "error" };
const emptyEmpForm = { name: "", email: "", password: "", salary: "", status: "active" };
const emptyCustForm = { name: "", email: "", password: "", balance: "", status: "active" };

const KpiCard = ({ icon, label, value, sub, gradient }) => (
  <Card sx={{ background: gradient, color: "white", border: "none", boxShadow: "0 4px 20px rgba(11,31,58,0.18)" }}>
    <CardContent sx={{ p: "20px !important" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.75, mb: 0.5 }}>{label}</Typography>
          <Typography variant="h4" fontWeight={800}>{value}</Typography>
          {sub && <Typography variant="caption" sx={{ opacity: 0.7 }}>{sub}</Typography>}
        </Box>
        <Box sx={{ p: 1.5, bgcolor: "rgba(255,255,255,0.15)", borderRadius: 3 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const ManagerDashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const customers = useSelector((state) => state.customers.list);
  const transactions = useSelector((state) => state.transactions.list);
  const loans = useSelector((state) => state.loans.list);
  const employees = useSelector((state) => state.employees.list);
  const custStatus = useSelector((state) => state.customers.status);
  const empStatus = useSelector((state) => state.employees.status);
  const empCreateError = useSelector((state) => state.employees.createError);
  const custCreateError = useSelector((state) => state.customers.createError);

  const [tab, setTab] = useState(0);

  // Employee dialog
  const [empDialogOpen, setEmpDialogOpen] = useState(false);
  const [empEditTarget, setEmpEditTarget] = useState(null);
  const [empForm, setEmpForm] = useState(emptyEmpForm);
  const [empFormError, setEmpFormError] = useState("");

  // Customer edit dialog
  const [custDialogOpen, setCustDialogOpen] = useState(false);
  const [custEditTarget, setCustEditTarget] = useState(null);
  const [custForm, setCustForm] = useState(emptyCustForm);
  const [custFormError, setCustFormError] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: "employee"|"customer", row }

  useEffect(() => {
    dispatch(fetchCustomers());
    dispatch(fetchTransactions());
    dispatch(fetchLoans());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // ── Employee CRUD ──
  const openCreateEmp = () => { setEmpEditTarget(null); setEmpForm(emptyEmpForm); setEmpFormError(""); setEmpDialogOpen(true); };
  const openEditEmp = (row) => { setEmpEditTarget(row); setEmpForm({ name: row.name, email: row.email, salary: row.salary, status: row.status }); setEmpFormError(""); setEmpDialogOpen(true); };

  const handleSaveEmp = async () => {
    if (!empForm.name.trim()) return setEmpFormError("Name is required.");
    if (!empForm.email.trim() || !/\S+@\S+\.\S+/.test(empForm.email)) return setEmpFormError("Valid email is required.");
    if (!empEditTarget && empForm.password.length < 6) return setEmpFormError("Password must be at least 6 characters.");
    if (!empForm.salary || Number(empForm.salary) < 0) return setEmpFormError("Valid salary is required.");
    if (empEditTarget) {
      dispatch(updateEmployee({ id: empEditTarget.id, ...empForm, salary: Number(empForm.salary), role: "employee" }));
      setEmpDialogOpen(false);
    } else {
      const result = await dispatch(createEmployee({ ...empForm, salary: Number(empForm.salary), role: "employee" }));
      if (result.meta.requestStatus === "rejected") return setEmpFormError(result.payload || "Failed to create employee.");
      setEmpDialogOpen(false);
    }
    setEmpForm(emptyEmpForm);
    setEmpFormError("");
  };

  // ── Customer Edit ──
  const openEditCust = (row) => { setCustEditTarget(row); setCustForm({ name: row.name, email: row.email, balance: row.balance, status: row.status }); setCustFormError(""); setCustDialogOpen(true); };

  const handleSaveCust = async () => {
    if (!custForm.name.trim()) return setCustFormError("Name is required.");
    if (!custForm.email.trim() || !/\S+@\S+\.\S+/.test(custForm.email)) return setCustFormError("Valid email is required.");
    if (!custEditTarget && custForm.password.length < 6) return setCustFormError("Password must be at least 6 characters.");
    if (custForm.balance === "" || Number(custForm.balance) < 0) return setCustFormError("Valid balance is required.");
    if (custEditTarget) {
      dispatch(updateCustomer({ id: custEditTarget.id, ...custForm, balance: Number(custForm.balance) }));
      setCustDialogOpen(false);
    } else {
      const result = await dispatch(createCustomer({ ...custForm, balance: Number(custForm.balance) }));
      if (result.meta.requestStatus === "rejected") return setCustFormError(result.payload || "Failed to create customer.");
      setCustDialogOpen(false);
    }
    setCustForm(emptyCustForm);
    setCustFormError("");
  };

  // ── Delete ──
  const handleDelete = () => {
    if (deleteTarget.type === "employee") dispatch(deleteEmployee(deleteTarget.row.id));
    if (deleteTarget.type === "customer") dispatch(deleteCustomer(deleteTarget.row.id));
    setDeleteTarget(null);
  };

  const WITHDRAW_MANAGER_LIMIT = 100000;

  // ── Withdraw approval (manager) ──
  const handleTxDecision = (row, status) => {
    dispatch(updateTransactionStatus({ id: row.id, status })).then(() => {
      if (status === "approved" && row.type === "withdraw") {
        const customer = customers.find((c) => c.id === row.customerId);
        if (customer) dispatch(updateCustomerBalance({ id: customer.id, balance: customer.balance - row.amount }));
      }
    });
  };

  // ── Loan approval ──
  const handleLoanDecision = (row, status) => {
    dispatch(decideLoan({ id: row.id, status, approvedBy: user.profile.name, approvedById: user.profile.id })).then(() => {
      if (status === "approved") {
        const customer = customers.find((c) => c.id === row.customerId);
        if (customer) dispatch(updateCustomerBalance({ id: customer.id, balance: customer.balance + row.amount }));
      }
    });
  };

  const totalBalance = customers.reduce((sum, c) => sum + (c.balance || 0), 0);
  const highValuePending = loans.filter((l) => l.status === "pending" && l.amount > LOAN_APPROVAL_LIMIT).length;
  const approvedLoans = loans.filter((l) => l.status === "approved").length;

  // ── Columns ──
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
            <IconButton size="small" color="primary" onClick={() => openEditCust(p.row)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: "customer", row: p.row })}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const employeeColumns = [
    {
      field: "name", headerName: "Name", flex: 1,
      renderCell: (p) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: "secondary.main", color: "primary.main" }}>{p.value?.charAt(0)}</Avatar>
          <Typography variant="body2" fontWeight={600}>{p.value}</Typography>
        </Box>
      ),
    },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "salary", headerName: "Salary (Rs)", flex: 1, renderCell: (p) => <Typography variant="body2" fontWeight={600}>Rs {p.value?.toLocaleString()}</Typography> },
    { field: "status", headerName: "Status", flex: 0.8, renderCell: (p) => <Chip label={p.value || "active"} color="success" size="small" /> },
    {
      field: "actions", headerName: "Actions", flex: 1, sortable: false,
      renderCell: (p) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <Tooltip title="Edit">
            <IconButton size="small" color="primary" onClick={() => openEditEmp(p.row)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" color="error" onClick={() => setDeleteTarget({ type: "employee", row: p.row })}>
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
      field: "actions", headerName: "Actions", flex: 1.8, sortable: false,
      renderCell: (p) => p.row.status === "pending" && p.row.type === "withdraw" && p.row.amount >= WITHDRAW_MANAGER_LIMIT ? (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutlinedIcon />} onClick={() => handleTxDecision(p.row, "approved")}>Approve</Button>
          <Button size="small" variant="outlined" color="error" startIcon={<CancelOutlinedIcon />} onClick={() => handleTxDecision(p.row, "rejected")}>Reject</Button>
        </Box>
      ) : "—",
    },
  ];

  const loanColumns = [
    { field: "customerId", headerName: "Customer ID", flex: 1 },
    {
      field: "amount", headerName: "Amount (Rs)", flex: 1,
      renderCell: (p) => (
        <Typography variant="body2" fontWeight={700} color={p.value > LOAN_APPROVAL_LIMIT ? "error.main" : "text.primary"}>
          Rs {p.value?.toLocaleString()}
        </Typography>
      ),
    },
    { field: "purpose", headerName: "Purpose", flex: 1.5 },
    { field: "duration", headerName: "Duration", flex: 0.8 },
    { field: "approvedBy", headerName: "Reviewed By", flex: 1, renderCell: (p) => p.value || "—" },
    { field: "status", headerName: "Status", flex: 0.8, renderCell: (p) => <Chip label={p.value} color={statusColor[p.value]} size="small" /> },
    {
      field: "actions", headerName: "Actions", flex: 1.8, sortable: false,
      renderCell: (p) => p.row.status === "pending" && p.row.amount > LOAN_APPROVAL_LIMIT ? (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutlinedIcon />} onClick={() => handleLoanDecision(p.row, "approved")}>Approve</Button>
          <Button size="small" variant="outlined" color="error" startIcon={<CancelOutlinedIcon />} onClick={() => handleLoanDecision(p.row, "rejected")}>Reject</Button>
        </Box>
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
            <Chip label="Manager" size="small" sx={{ bgcolor: "rgba(201,168,76,0.2)", color: "#C9A84C", fontWeight: 600, ml: 1 }} />
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
          <Typography variant="h5" fontWeight={700} color="primary.main">Manager Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Full system oversight — manage employees, customers and approve high-value loans</Typography>
        </Box>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard icon={<PeopleAltIcon sx={{ color: "white" }} />} label="Total Customers" value={customers.length} gradient="linear-gradient(135deg, #0B1F3A 0%, #1A3558 100%)" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard icon={<TrendingUpIcon sx={{ color: "white" }} />} label="Total Portfolio (Rs)" value={`${(totalBalance / 1000000).toFixed(1)}M`} sub="Combined customer balances" gradient="linear-gradient(135deg, #C9A84C 0%, #9A7A2E 100%)" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard icon={<CreditScoreIcon sx={{ color: "white" }} />} label="Approved Loans" value={approvedLoans} gradient="linear-gradient(135deg, #0D7A5F 0%, #085C47 100%)" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <KpiCard icon={<BadgeIcon sx={{ color: "white" }} />} label="Total Employees" value={employees.length} sub={`${highValuePending} high-value loans pending`} gradient="linear-gradient(135deg, #C0392B 0%, #922B21 100%)" />
          </Grid>
        </Grid>

        <Card>
          <CardContent sx={{ p: "0 !important" }}>
            <Box sx={{ borderBottom: "1px solid", borderColor: "divider", px: 3, pt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} TabIndicatorProps={{ style: { backgroundColor: "#0B1F3A" } }}>
                <Tab label="Customers" icon={<PeopleAltIcon fontSize="small" />} iconPosition="start" />
                <Tab label="Employees" icon={<BadgeIcon fontSize="small" />} iconPosition="start" />
                <Tab label="Transactions" icon={<ReceiptLongIcon fontSize="small" />} iconPosition="start" />
                <Tab label="Loans" icon={<CreditScoreIcon fontSize="small" />} iconPosition="start" />
              </Tabs>
              {tab === 1 && (
                <Button variant="contained" startIcon={<PersonAddAltIcon />} size="small" onClick={openCreateEmp} sx={{ mr: 1 }}>
                  Add Employee
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
                empStatus === "loading"
                  ? <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
                  : <Box sx={{ height: 420 }}><DataGrid rows={employees} columns={employeeColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} /></Box>
              )}
              {tab === 2 && (
                <Box sx={{ height: 420 }}><DataGrid rows={transactions} columns={txColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} /></Box>
              )}
              {tab === 3 && (
                <Box sx={{ height: 420 }}><DataGrid rows={loans} columns={loanColumns} pageSizeOptions={[5]} initialState={{ pagination: { paginationModel: { pageSize: 5 } } }} /></Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Employee Create/Edit Dialog */}
      <Dialog open={empDialogOpen} onClose={() => setEmpDialogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>{empEditTarget ? "Edit Employee" : "Add New Employee"}</Typography>
          <IconButton size="small" onClick={() => setEmpDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          {empFormError && <Alert severity="error" sx={{ mb: 2 }}>{empFormError}</Alert>}
          {[
            { key: "name", label: "Full Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            ...(!empEditTarget ? [{ key: "password", label: "Login Password", type: "password" }] : []),
            { key: "salary", label: "Salary (Rs)", type: "number" },
          ].map(({ key, label, type }) => (
            <TextField
              key={key} fullWidth label={label} type={type} margin="normal"
              value={empForm[key]}
              onChange={(e) => setEmpForm({ ...empForm, [key]: e.target.value })}
              inputProps={type === "number" ? { min: 0 } : {}}
              helperText={key === "password" ? "Employee will use this to login" : ""}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEmpDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSaveEmp}>{empEditTarget ? "Save Changes" : "Create Employee"}</Button>
        </DialogActions>
      </Dialog>

      {/* Customer Edit Dialog */}
      <Dialog open={custDialogOpen} onClose={() => setCustDialogOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>Edit Customer</Typography>
          <IconButton size="small" onClick={() => setCustDialogOpen(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          {custFormError && <Alert severity="error" sx={{ mb: 2 }}>{custFormError}</Alert>}
          {[
            { key: "name", label: "Full Name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            ...(!custEditTarget ? [{ key: "password", label: "Login Password", type: "password" }] : []),
            { key: "balance", label: "Opening Balance (Rs)", type: "number" },
          ].map(({ key, label, type }) => (
            <TextField
              key={key} fullWidth label={label} type={type} margin="normal"
              value={custForm[key]}
              onChange={(e) => setCustForm({ ...custForm, [key]: e.target.value })}
              inputProps={type === "number" ? { min: 0 } : {}}
              helperText={key === "password" ? "Customer will use this to login" : ""}
            />
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCustDialogOpen(false)} variant="outlined">Cancel</Button>
          <Button variant="contained" onClick={handleSaveCust}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight={700}>Confirm Delete</Typography>
          <IconButton size="small" onClick={() => setDeleteTarget(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.row?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined">Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagerDashboard;
