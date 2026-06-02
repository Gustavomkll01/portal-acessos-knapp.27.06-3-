// src/AuthForms.js
import React, { useState, useContext } from 'react';
import {
  Box, TextField, Button, Typography, Paper, CircularProgress,
  Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { AuthContext } from './App';
import { useTheme } from '@mui/material/styles';

import './AuthAnimation.css'; // Imagem animada de fundo
import KnappLogo from './assets/knapp-logo.png'; // Substitua pelo seu caminho correto

const API_URL = 'http://localhost:5000';

function AuthForms() {
  const theme = useTheme();
  const { login, loadingAuth, setSnackbar, setLoadingAuth } = useContext(AuthContext);
  const [isLoginView, setIsLoginView] = useState(true);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerCompany, setRegisterCompany] = useState('');
  const [registerRole, setRegisterRole] = useState('Operator');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await login(loginUsername, loginPassword);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoadingAuth(true);
    try {
      const response = await fetch(`${API_URL}/api/register-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
          email: registerEmail,
          company: registerCompany,
          role: registerRole
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setSnackbar({ open: true, message: data.message, severity: 'success' });
        setRegisterUsername('');
        setRegisterPassword('');
        setRegisterEmail('');
        setRegisterCompany('');
        setRegisterRole('Operator');
        setIsLoginView(true);
      } else {
        setSnackbar({ open: true, message: data.message || 'Erro ao solicitar acesso.', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erro ao conectar com o servidor.', severity: 'error' });
    } finally {
      setLoadingAuth(false);
    }
  };

  return (
    <Box className="auth-background-animation">
      <Paper
        elevation={6}
        className="auth-form-container"
        sx={{
          p: 4,
          maxWidth: 450,
          mx: 'auto',
          borderRadius: theme.shape.borderRadius,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <img src={KnappLogo} alt="KNAPP Logo" style={{ height: 60 }} />

        {isLoginView ? (
          <Box component="form" onSubmit={handleLoginSubmit} sx={{ width: '100%', mt: 2 }}>
            <Typography variant="h5" align="center" gutterBottom color="primary.main">
              Entrar no Portal
            </Typography>
            <TextField
              label="Usuário"
              variant="outlined"
              fullWidth
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              fullWidth
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loadingAuth}
              sx={{ mt: 2, py: 1.5 }}
            >
              {loadingAuth ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => setIsLoginView(false)}
              sx={{ mt: 1, color: theme.palette.text.secondary }}
            >
              Solicitar Novo Acesso
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleRegisterSubmit} sx={{ width: '100%', mt: 2 }}>
            <Typography variant="h5" align="center" gutterBottom color="primary.main">
              Solicitar Novo Acesso
            </Typography>
            <TextField
              label="Usuário Desejado"
              variant="outlined"
              fullWidth
              value={registerUsername}
              onChange={(e) => setRegisterUsername(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Senha"
              type="password"
              variant="outlined"
              fullWidth
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              fullWidth
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              required
              margin="normal"
            />
            <TextField
              label="Empresa"
              variant="outlined"
              fullWidth
              value={registerCompany}
              onChange={(e) => setRegisterCompany(e.target.value)}
              required
              margin="normal"
            />
            <FormControl fullWidth required sx={{ mt: 2 }}>
              <InputLabel>Função Desejada</InputLabel>
              <Select
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
                label="Função Desejada"
              >
                <MenuItem value="Operator">Operator</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={loadingAuth}
              sx={{ mt: 3, py: 1.5 }}
            >
              {loadingAuth ? <CircularProgress size={24} color="inherit" /> : 'Enviar Solicitação'}
            </Button>
            <Button
              variant="text"
              fullWidth
              onClick={() => setIsLoginView(true)}
              sx={{ mt: 1, color: theme.palette.text.secondary }}
            >
              Já tem uma conta? Fazer Login
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default AuthForms;
