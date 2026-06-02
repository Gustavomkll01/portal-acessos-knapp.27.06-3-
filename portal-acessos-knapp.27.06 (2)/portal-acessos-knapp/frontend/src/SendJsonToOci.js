// src/SendJsonToOci.js

import React, { useState, useContext } from 'react';
import {
  Box, TextField, Button, Typography, Paper, CircularProgress
} from '@mui/material';
import { AuthContext } from './App';

// Função utilitária para validar JSON
const isJson = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

const API_URL = 'http://localhost:5000';

function SendJsonToOci() {
  const { setSnackbar } = useContext(AuthContext);
  const [ociJson, setOciJson] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonError, setJsonError] = useState(false);

  const handleJsonChange = (e) => {
    const value = e.target.value;
    setOciJson(value);
    setJsonError(value.trim() !== '' && !isJson(value));
  };

  const handleSendJson = async (e) => {
    e.preventDefault();

    if (jsonError || !ociJson.trim()) {
      setSnackbar({ open: true, message: 'JSON inválido ou vazio. Verifique e tente novamente.', severity: 'error' });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/api/oci/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ociJson: JSON.parse(ociJson) })
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({ open: true, message: data.message, severity: 'success' });
        setOciJson('');
        setJsonError(false);
      } else {
        setSnackbar({ open: true, message: data.message || 'Erro ao enviar JSON.', severity: 'error' });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao conectar com o servidor.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: '12px' }}>
      <Typography variant="h5" gutterBottom color="primary.main">
        Enviar Requisição JSON para OCI (Simulação)
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Insira abaixo o conteúdo JSON da requisição OCI. O sistema fará uma simulação de envio e resposta.
      </Typography>

      <Box component="form" onSubmit={handleSendJson} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="JSON da Requisição"
          multiline
          rows={14}
          fullWidth
          variant="outlined"
          value={ociJson}
          onChange={handleJsonChange}
          error={jsonError}
          helperText={jsonError ? "JSON inválido. Verifique a sintaxe." : "Ex: { \"resource_type\": \"instance\" }"}
          placeholder={`Exemplo:\n{\n  "resource_type": "instance",\n  "display_name": "my-webserver",\n  "shape": "VM.Standard.E4.Flex",\n  "compartment_id": "ocid1.compartment.oc1..xxxx"\n}`}
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading || jsonError || !ociJson.trim()}
          sx={{ py: 1.5 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Requisição'}
        </Button>
      </Box>
    </Paper>
  );
}

export default SendJsonToOci;
