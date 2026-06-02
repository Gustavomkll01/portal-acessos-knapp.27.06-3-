// src/OciRequestHistory.js

import React, { useState, useEffect, useContext } from 'react';
import {
  Paper, Typography, Box, CircularProgress, Alert,
  Accordion, AccordionSummary, AccordionDetails,
  Chip, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AuthContext } from './App';

const API_URL = 'http://localhost:5000';

function OciRequestHistory() {
  const { setSnackbar } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/oci/requests`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

      if (!response.ok) throw new Error('Erro ao buscar histórico.');
      const data = await response.json();
      setHistory(data.reverse());
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Erro ao carregar histórico.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
      <Typography variant="h5" gutterBottom color="primary.main">
        Histórico de Requisições OCI
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : history.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>Nenhuma requisição encontrada.</Alert>
      ) : (
        <Box sx={{ mt: 3 }}>
          {history.map((item, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <Typography variant="subtitle1">
                    Requisição de {item.user?.username || 'Usuário Desconhecido'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(item.timestamp).toLocaleString()}
                    </Typography>
                    <Chip
                      label={item.status}
                      color={item.status === 'success' ? 'success' : 'error'}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Divider sx={{ mb: 1 }}>JSON Enviado</Divider>
                <Box
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#f9f9f9',
                    p: 2,
                    borderRadius: 2,
                    mb: 2,
                    fontSize: 14,
                  }}
                >
                  {JSON.stringify(item.jsonSent, null, 2)}
                </Box>

                <Divider sx={{ mb: 1 }}>Resposta OCI</Divider>
                <Box
                  component="pre"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#f1f8e9',
                    p: 2,
                    borderRadius: 2,
                    fontSize: 14,
                  }}
                >
                  {JSON.stringify(item.responseData, null, 2)}
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Paper>
  );
}

export default OciRequestHistory;
