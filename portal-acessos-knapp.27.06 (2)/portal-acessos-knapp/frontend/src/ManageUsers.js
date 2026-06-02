// src/ManageUsers.js

import React, { useState, useEffect, useContext } from 'react';
import {
  Paper, Typography, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Tooltip, Chip, TablePagination
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { AuthContext } from './App';

const API_URL = 'http://localhost:5000';

function ManageUsers() {
  const { setSnackbar } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/admin/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const message = response.status === 403
          ? 'Você não tem permissão para visualizar essa página.'
          : 'Erro ao buscar solicitações.';
        throw new Error(message);
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/admin/requests/${id}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      if (response.ok) {
        setSnackbar({ open: true, message: data.message, severity: 'success' });
        fetchRequests();
      } else {
        setSnackbar({ open: true, message: data.message || 'Erro na ação.', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Erro ao conectar com o servidor.', severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
      <Typography variant="h5" gutterBottom color="primary.main">
        Aprovar Solicitações de Acesso
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper} elevation={1} sx={{ mt: 3, borderRadius: '8px' }}>
            <Table>
              <TableHead sx={{ backgroundColor: 'primary.light' }}>
                <TableRow>
                  <TableCell><b>Usuário</b></TableCell>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell><b>Empresa</b></TableCell>
                  <TableCell><b>Função</b></TableCell>
                  <TableCell><b>Status</b></TableCell>
                  <TableCell><b>Data</b></TableCell>
                  <TableCell align="center"><b>Ações</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.length > 0 ? (
                  requests
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((req) => (
                      <TableRow key={req.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                        <TableCell>{req.username}</TableCell>
                        <TableCell>{req.email}</TableCell>
                        <TableCell>{req.company}</TableCell>
                        <TableCell>{req.role}</TableCell>
                        <TableCell>
                          <Chip
                            label={req.status}
                            color={getStatusColor(req.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{new Date(req.createdAt).toLocaleString()}</TableCell>
                        <TableCell align="center">
                          {req.status === 'pending' ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                              <Tooltip title="Aprovar">
                                <IconButton
                                  color="success"
                                  onClick={() => handleAction(req.id, 'approve')}
                                  disabled={actionLoading}
                                >
                                  <CheckCircleIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Rejeitar">
                                <IconButton
                                  color="error"
                                  onClick={() => handleAction(req.id, 'reject')}
                                  disabled={actionLoading}
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {req.status === 'approved'
                                ? `Aprovado por ${req.approvedBy || 'Admin'}`
                                : `Rejeitado por ${req.rejectedBy || 'Admin'}`}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      Nenhuma solicitação encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={requests.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Linhas por página:"
          />
        </>
      )}
    </Paper>
  );
}

export default ManageUsers;
