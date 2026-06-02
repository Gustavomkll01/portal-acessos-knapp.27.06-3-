// src/components/Theme.js

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
      light: '#64b5f6',
      dark: '#004ba0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9100',
    },
    error: {
      main: '#d32f2f',
    },
    success: {
      main: '#2e7d32',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
});

export default theme;
