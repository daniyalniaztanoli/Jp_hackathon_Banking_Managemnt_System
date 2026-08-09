import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box, TextField, Button, Typography, Alert,
  CircularProgress, InputAdornment, IconButton,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { loginUser, clearAuthError } from "./authSlice";
import bankLogo from "../../assets/bank-logo.svg";

const ROLE_HOME = { customer: "/customer", employee: "/employee", manager: "/manager" };

// Keyframe definitions
const keyframes = `
  @keyframes floatOrb1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(30px, -40px) scale(1.08); }
    66%       { transform: translate(-20px, 20px) scale(0.95); }
  }
  @keyframes floatOrb2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%       { transform: translate(-35px, 30px) scale(1.05); }
    66%       { transform: translate(25px, -25px) scale(0.97); }
  }
  @keyframes floatOrb3 {
    0%, 100% { transform: translate(0, 0); }
    50%       { transform: translate(15px, -30px); }
  }
  @keyframes pulseIcon {
    0%, 100% { transform: scale(1);   filter: drop-shadow(0 0 0px #C9A84C); }
    50%       { transform: scale(1.1); filter: drop-shadow(0 0 18px #C9A84C); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes rotateBorder {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 0.4; transform: scale(0.8); }
    50%       { opacity: 1;   transform: scale(1.2); }
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error, user } = useSelector((state) => state.auth);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (user) navigate(ROLE_HOME[user.role] || "/login"); }, [user, navigate]);
  useEffect(() => () => dispatch(clearAuthError()), [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <>
      <style>{keyframes}</style>
      <Box sx={{ minHeight: "100vh", display: "flex" }}>

        {/* ── Left Panel ── */}
        <Box
          sx={{
            flex: 1,
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(160deg, #060F1E 0%, #0B1F3A 45%, #0D4A6B 100%)",
            p: 6,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Animated floating orbs */}
          <Box sx={{
            position: "absolute", width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
            top: -120, right: -120,
            animation: "floatOrb1 8s ease-in-out infinite",
          }} />
          <Box sx={{
            position: "absolute", width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(13,74,107,0.4) 0%, transparent 70%)",
            bottom: -100, left: -100,
            animation: "floatOrb2 10s ease-in-out infinite",
          }} />
          <Box sx={{
            position: "absolute", width: 180, height: 180, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
            top: "38%", left: "8%",
            animation: "floatOrb3 6s ease-in-out infinite",
          }} />

          {/* Rotating ring behind icon */}
          <Box sx={{ position: "relative", mb: 3 }}>
            <Box sx={{
              position: "absolute", inset: -14,
              borderRadius: "50%",
              border: "2px dashed rgba(201,168,76,0.35)",
              animation: "rotateBorder 12s linear infinite",
            }} />
            <Box
              component="img"
              src={bankLogo}
              alt="Enterprise Banking Logo"
              sx={{
                width: 80, height: 80,
                animation: "pulseIcon 3s ease-in-out infinite",
                filter: "drop-shadow(0 0 12px rgba(201,168,76,0.5))",
              }}
            />
          </Box>

          <Typography
            variant="h4" color="white" fontWeight={800} textAlign="center" mb={2}
            sx={{ animation: "fadeSlideUp 0.8s ease both", animationDelay: "0.1s" }}
          >
            Enterprise Banking
          </Typography>
          <Typography
            variant="body1" color="rgba(255,255,255,0.55)" textAlign="center"
            maxWidth={300} lineHeight={1.9}
            sx={{ animation: "fadeSlideUp 0.8s ease both", animationDelay: "0.25s" }}
          >
            Secure. Reliable. Trusted by thousands for seamless financial management.
          </Typography>

          {/* Feature list with staggered dots */}
          <Box sx={{ mt: 5, display: "flex", flexDirection: "column", gap: 2, width: "100%", maxWidth: 300 }}>
            {["256-bit SSL Encryption", "Role-Based Access Control", "Real-Time Transaction Processing"].map((f, i) => (
              <Box
                key={f}
                sx={{
                  display: "flex", alignItems: "center", gap: 1.5,
                  animation: "fadeSlideUp 0.7s ease both",
                  animationDelay: `${0.4 + i * 0.15}s`,
                }}
              >
                <Box sx={{
                  width: 9, height: 9, borderRadius: "50%", bgcolor: "#C9A84C", flexShrink: 0,
                  animation: `dotPulse 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                }} />
                <Typography variant="body2" color="rgba(255,255,255,0.7)">{f}</Typography>
              </Box>
            ))}
          </Box>

          {/* Bottom shimmer line */}
          <Box sx={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
            background: "linear-gradient(90deg, transparent, #C9A84C, transparent)",
            backgroundSize: "200% auto",
            animation: "shimmer 3s linear infinite",
          }} />
        </Box>

        {/* ── Right Panel ── */}
        <Box
          sx={{
            flex: { xs: 1, md: "0 0 480px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "background.default",
            p: 4,
            animation: "fadeIn 0.6s ease both",
          }}
        >
          <Box
            sx={{
              width: "100%", maxWidth: 400,
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            {/* Mobile logo */}
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1.5, mb: 4 }}>
              <Box component="img" src={bankLogo} alt="logo" sx={{ width: 40, height: 40 }} />
              <Typography variant="h6" fontWeight={700} color="primary.main">Enterprise Banking</Typography>
            </Box>

            {/* Heading */}
            <Typography
              variant="h5" fontWeight={700} color="primary.main" mb={0.5}
              sx={{ animation: "fadeSlideUp 0.6s ease both", animationDelay: "0.1s" }}
            >
              Welcome back
            </Typography>
            <Typography
              variant="body2" color="text.secondary" mb={4}
              sx={{ animation: "fadeSlideUp 0.6s ease both", animationDelay: "0.2s" }}
            >
              Sign in with your bank-issued credentials
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2, animation: "fadeSlideUp 0.4s ease both" }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
            >
              {/* Email field */}
              <Box sx={{ animation: "fadeSlideUp 0.6s ease both", animationDelay: "0.3s" }}>
                <TextField
                  label="Email Address"
                  type="email"
                  fullWidth
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Password field */}
              <Box sx={{ animation: "fadeSlideUp 0.6s ease both", animationDelay: "0.4s" }}>
                <TextField
                  label="Password"
                  type={showPass ? "text" : "password"}
                  fullWidth
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end" size="small">
                          {showPass
                            ? <VisibilityOffOutlinedIcon fontSize="small" />
                            : <VisibilityOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Animated Sign In button */}
              <Box sx={{ animation: "fadeSlideUp 0.6s ease both", animationDelay: "0.5s" }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={status === "loading"}
                  sx={{
                    mt: 1, py: 1.5, fontSize: "1rem",
                    position: "relative", overflow: "hidden",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                      backgroundSize: "200% auto",
                      animation: "shimmer 2.5s linear infinite",
                    },
                  }}
                >
                  {status === "loading" ? <CircularProgress size={22} color="inherit" /> : "Sign In"}
                </Button>
              </Box>
            </Box>

            <Typography
              variant="caption" color="text.disabled" display="block" textAlign="center" mt={4}
              sx={{ animation: "fadeIn 1s ease both", animationDelay: "0.8s" }}
            >
              © 2025 Enterprise Banking. All rights reserved.
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Login;
