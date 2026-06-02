// src/DashboardHome.js

import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Paper, Grid, CircularProgress, Alert
} from '@mui/material';
import { AuthContext } from './App';
import KnappAutomationImage from './assets/knapp-automation.jpg';

const API_URL = 'http://localhost:5000';

function DashboardHome() {
  const { user, setSnackbar } = useContext(AuthContext);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_URL}/api/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erro ao buscar dados do dashboard.');

        const data = await response.json();
        setDashboardData(data.dashboardData);
      } catch (error) {
        console.error(error);
        setSnackbar({ open: true, message: 'Erro ao carregar dados do dashboard.', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchDashboardData();
  }, [user, setSnackbar]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!dashboardData) {
    return <Alert severity="error">Não foi possível carregar os dados do dashboard.</Alert>;
  }

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        elevation={3}
        sx={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${KnappAutomationImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 260,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          borderRadius: '12px',
          p: 4,
          textAlign: 'center',
          textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
          mb: 4
        }}
      >
        <Typography variant="h4" gutterBottom>
          Bem-vindo ao Portal de Acessos KNAPP
        </Typography>
        <Typography variant="h6">
          Centralize o controle de permissões e operações da Oracle Cloud Infrastructure.
        </Typography>
      </Paper>

      {/* Cards de Estatísticas */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Visão Geral das Operações
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={4} sx={{ p: 3, textAlign: 'center', backgroundColor: '#e3f2fd' }}>
            <Typography variant="h6" color="primary.main">Total de Usuários</Typography>
            <Typography variant="h3" color="primary.dark" sx={{ mt: 1, mb: 1 }}>{dashboardData.totalUsers}</Typography>
            <Typography variant="body2" color="text.secondary">Usuários registrados no sistema.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={4} sx={{ p: 3, textAlign: 'center', backgroundColor: '#fff3e0' }}>
            <Typography variant="h6" color="warning.main">Solicitações Pendentes</Typography>
            <Typography variant="h3" color="warning.dark" sx={{ mt: 1, mb: 1 }}>{dashboardData.pendingAccessRequests}</Typography>
            <Typography variant="body2" color="text.secondary">Aguardando aprovação de acesso.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={4} sx={{ p: 3, textAlign: 'center', backgroundColor: '#e8f5e9' }}>
            <Typography variant="h6" color="success.main">Requisições OCI</Typography>
            <Typography variant="h3" color="success.dark" sx={{ mt: 1, mb: 1 }}>{dashboardData.ociRequestsSent}</Typography>
            <Typography variant="body2" color="text.secondary">Total de requisições OCI enviadas.</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Info Extra */}
      <Box sx={{ mt: 5, p: 3, backgroundColor: '#f0f4f8', borderRadius: '12px' }}>
        <Typography variant="h6" gutterBottom>Informações Rápidas</Typography>
        <Typography variant="body1">
          Use o menu lateral para navegar entre seções, aprovar usuários, enviar JSON para OCI e ver o histórico.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Última atualização: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
}

export default DashboardHome;
