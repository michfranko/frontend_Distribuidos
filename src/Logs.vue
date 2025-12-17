<template>
  <div>
    <h1>Registro de Actividad (Logs)</h1>
    <p v-if="error" class="message error">{{ error }}</p>
    <div class="list-container">
      <table aria-busy="loading">
        <thead>
          <tr>
            <th>ID</th>
            <th>Acción</th>
            <th>Fecha y Hora</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="3">Cargando logs...</td>
          </tr>
          <tr v-for="log in logs" :key="log.id">
            <td>{{ log.id }}</td>
            <td>{{ log.action }}</td>
            <td>{{ new Date(log.timestamp).toLocaleString() }}</td>
          </tr>
          <tr v-if="!loading && logs.length === 0">
            <td colspan="3">No hay registros para mostrar.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL;

const logs = ref([]);
const loading = ref(false);
const error = ref('');

const fetchLogs = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch(`${API_URL}/api/logs`);
    if (res.ok) {
      logs.value = await res.json();
    } else {
      error.value = 'No se pudieron cargar los logs.';
    }
  } catch (e) {
    error.value = 'Error de red al conectar con el servidor.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchLogs);
</script>

<style scoped>
.list-container { margin-top: 2rem; }
td { padding: 0.5rem; }
</style>