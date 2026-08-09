import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0B1F3A",
      light: "#1A3558",
      dark: "#060F1E",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#C9A84C",
      light: "#E2C97E",
      dark: "#9A7A2E",
      contrastText: "#0B1F3A",
    },
    success: {
      main: "#0D7A5F",
      light: "#10A37F",
      dark: "#085C47",
    },
    error: {
      main: "#C0392B",
      light: "#E74C3C",
    },
    warning: {
      main: "#D68910",
      light: "#F39C12",
    },
    info: {
      main: "#1A6FA8",
      light: "#2E86C1",
    },
    background: {
      default: "#EEF2F7",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0B1F3A",
      secondary: "#5A6A7E",
      disabled: "#A0AEC0",
    },
    divider: "#D8E0EA",
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.5px" },
    h5: { fontWeight: 700, letterSpacing: "-0.3px" },
    h6: { fontWeight: 600 },
    body1: { fontSize: "0.95rem" },
    body2: { fontSize: "0.85rem" },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.3px" },
  },
  shape: { borderRadius: 12 },
  shadows: [
    "none",
    "0 1px 3px rgba(11,31,58,0.08)",
    "0 2px 8px rgba(11,31,58,0.10)",
    "0 4px 16px rgba(11,31,58,0.12)",
    "0 6px 24px rgba(11,31,58,0.14)",
    "0 8px 32px rgba(11,31,58,0.16)",
    ...Array(19).fill("0 8px 32px rgba(11,31,58,0.16)"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": { boxShadow: "0 4px 12px rgba(11,31,58,0.2)" },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #0B1F3A 0%, #1A3558 100%)",
        },
        containedSecondary: {
          background: "linear-gradient(135deg, #C9A84C 0%, #E2C97E 100%)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(11,31,58,0.08)",
          border: "1px solid #E8EDF4",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&:hover fieldset": { borderColor: "#C9A84C" },
            "&.Mui-focused fieldset": { borderColor: "#0B1F3A" },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.75rem", borderRadius: 6 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #0B1F3A 0%, #1A3558 100%)",
          boxShadow: "0 2px 16px rgba(11,31,58,0.25)",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: "none",
          fontSize: "0.9rem",
          "&.Mui-selected": { color: "#0B1F3A" },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "none",
          borderRadius: 12,
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#F0F4FA",
            fontWeight: 700,
            fontSize: "0.82rem",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#5A6A7E",
          },
          "& .MuiDataGrid-row:hover": { backgroundColor: "#F7F9FC" },
          "& .MuiDataGrid-cell": { borderColor: "#EEF2F7" },
        },
      },
    },
  },
});

export default theme;
