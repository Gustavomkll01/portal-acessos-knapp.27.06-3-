// src/App.js

import React, { useState, useEffect, createContext } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText,
  CircularProgress, Snackbar, Alert, Grid, Paper
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon, Settings as SettingsIcon,
  Logout as LogoutIcon, Send as SendIcon, HowToReg as HowToRegIcon, LockOpen as LockOpenIcon,
  History as HistoryIcon
} from '@mui/icons-material';

import AuthForms from './AuthForms';
import DashboardHome from './DashboardHome';
import ManageUsers from './ManageUsers';
import SendJsonToOci from './SendJsonToOci';
import AdminSettings from './AdminSettings';
import OciRequestHistory from './OciRequestHistory';

export const AuthContext = createContext(null);
const API_URL = 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/check-token`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setSnackbar({ open: true, message: 'Sessão restaurada.', severity: 'success' });
          } else {
            localStorage.removeItem('token');
            setUser(null);
          }
        } catch {
          localStorage.removeItem('token');
          setSnackbar({ open: true, message: 'Erro ao restaurar sessão.', severity: 'error' });
        }
      }
      setLoadingAuth(false);
    };
    checkToken();
  }, []);

  const login = async (username, password) => {
    setLoadingAuth(true);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        setSnackbar({ open: true, message: data.message, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: data.message, severity: 'error' });
        setUser(null);
      }
    } catch {
      setSnackbar({ open: true, message: 'Erro ao conectar com o servidor.', severity: 'error' });
    } finally {
      setLoadingAuth(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('dashboard');
    setSnackbar({ open: true, message: 'Você saiu do sistema.', severity: 'info' });
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) return;
    setDrawerOpen(open);
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (loadingAuth) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setSnackbar, setLoadingAuth }}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)} aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Portal de Acessos KNAPP
            </Typography>
            {user && (
              <>
                <Typography sx={{ mr: 2 }}>Bem-vindo, {user.username} ({user.role})</Typography>
                <Button color="inherit" onClick={logout} startIcon={<LogoutIcon />}>Sair</Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            <List>
              <ListItem><ListItemText primary={`Usuário: ${user?.username}`} secondary={`Função: ${user?.role}`} /></ListItem>
              <ListItem button onClick={() => setCurrentView('dashboard')}>
                <DashboardIcon sx={{ mr: 2 }} /><ListItemText primary="Dashboard" />
              </ListItem>
              {['Admin', 'Manager'].includes(user?.role) && (
                <ListItem button onClick={() => setCurrentView('manage-users')}>
                  <HowToRegIcon sx={{ mr: 2 }} /><ListItemText primary="Gerenciar Usuários" />
                </ListItem>
              )}
              {['Admin', 'Operator'].includes(user?.role) && (
                <ListItem button onClick={() => setCurrentView('send-json')}>
                  <SendIcon sx={{ mr: 2 }} /><ListItemText primary="Enviar JSON OCI" />
                </ListItem>
              )}
              {['Admin', 'Manager', 'Operator'].includes(user?.role) && (
                <ListItem button onClick={() => setCurrentView('oci-history')}>
                  <HistoryIcon sx={{ mr: 2 }} /><ListItemText primary="Histórico OCI" />
                </ListItem>
              )}
              {user?.role === 'Admin' && (
                <ListItem button onClick={() => setCurrentView('settings')}>
                  <SettingsIcon sx={{ mr: 2 }} /><ListItemText primary="Configurações (Admin)" />
                </ListItem>
              )}
              <ListItem button onClick={logout}>
                <LogoutIcon sx={{ mr: 2 }} /><ListItemText primary="Sair" />
              </ListItem>
            </List>
          </Box>
        </Drawer>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {!user ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <AuthForms />
          </Box>
        ) : (
          <DashboardRouter view={currentView} setView={setCurrentView} user={user} />
        )}
      </Box>
    </AuthContext.Provider>
  );
}

function DashboardRouter({ view, setView, user }) {
  const views = {
    dashboard: <DashboardHome />,
    'manage-users': <ManageUsers />,
    'send-json': <SendJsonToOci />,
    'oci-history': <OciRequestHistory />,
    settings: <AdminSettings />,
  };

  if (!views[view]) return <DashboardHome />;
  if (view === 'manage-users' && !['Admin', 'Manager'].includes(user.role)) return <Typography>Acesso negado.</Typography>;
  if (view === 'send-json' && !['Admin', 'Operator'].includes(user.role)) return <Typography>Acesso negado.</Typography>;
  if (view === 'oci-history' && !['Admin', 'Operator', 'Manager'].includes(user.role)) return <Typography>Acesso negado.</Typography>;
  if (view === 'settings' && user.role !== 'Admin') return <Typography>Acesso negado.</Typography>;

  return <Box sx={{ p: 3 }}>{views[view]}</Box>;
}

export default App;
