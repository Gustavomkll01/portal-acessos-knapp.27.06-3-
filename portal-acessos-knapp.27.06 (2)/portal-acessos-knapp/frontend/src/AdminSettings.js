// frontend/src/AdminSettings.js
import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build'; // Usando BuildIcon para configurações OCI
import StorageIcon from '@mui/icons-material/Storage';

function AdminSettings() {
    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: '12px' }}>
            <Typography variant="h5" component="h2" gutterBottom color="primary.main" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsApplicationsIcon sx={{ mr: 1 }} /> Configurações do Administrador
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                Esta área é dedicada a configurações e ferramentas administrativas avançadas do portal.
            </Typography>
            <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: '8px' }}>
                <Typography variant="h6" gutterBottom>
                    Opções Futuras:
                </Typography>
                <List>
                    <ListItem>
                        <ListItemIcon><HowToRegIcon color="action" /></ListItemIcon>
                        <ListItemText primary="Gerenciar Funções de Usuários" secondary="Defina e ajuste as permissões dos usuários no sistema." />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><SecurityIcon color="action" /></ListItemIcon>
                        <ListItemText primary="Logs do Sistema" secondary="Acompanhe as atividades e auditorias para garantir a segurança." />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><BuildIcon color="action" /></ListItemIcon>
                        <ListItemText primary="Configurações de Integração OCI" secondary="Gerencie chaves API, endpoints e outros detalhes de conexão OCI." />
                    </ListItem>
                    <ListItem>
                        <ListItemIcon><StorageIcon color="action" /></ListItemIcon>
                        <ListItemText primary="Backups de Dados" secondary="Configure e execute rotinas de backup dos dados do sistema." />
                    </ListItem>
                </List>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, fontStyle: 'italic' }}>
                Implemente as funcionalidades administrativas aqui para um controle total do sistema.
            </Typography>
        </Paper>
    );
}

export default AdminSettings;