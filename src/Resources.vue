<template>
  <div>
    <h1>Gestión de Recursos</h1>

    <!-- Formulario para Crear/Editar -->
    <form @submit.prevent="submit" :aria-busy="loading" class="resource-form">
      <h3>{{ editingResource ? 'Editar Recurso' : 'Nuevo Recurso' }}</h3>
      <div class="form-group">
        <label for="filename">Nombre del archivo (Título)</label>
        <input id="filename" v-model="form.filename" placeholder="Ej: mi_documento.pdf" required :disabled="loading" />
      </div>
      <div class="form-group">
        <label for="user_id">ID de Usuario</label>
        <input id="user_id" type="number" v-model.number="form.user_id" placeholder="ID del usuario" required :disabled="loading" />
      </div>
      <div class="form-group">
        <label for="category_id">Categoría</label>
        <select id="category_id" v-model="form.category_id" required :disabled="loading || categories.length === 0">
          <option disabled value="">
            {{ categories.length > 0 ? 'Seleccione una categoría' : 'Cargando categorías...' }}
          </option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : (editingResource ? 'Actualizar' : 'Guardar') }}
        </button>
        <button type="button" v-if="editingResource" @click="cancelEdit" :disabled="loading" class="cancel-btn">
          Cancelar
        </button>
      </div>
    </form>

    <p v-if="message" :class="['message', messageType]">{{ message }}</p>

    <!-- Lista de Recursos -->
    <div class="list-container">
      <h2>Recursos Existentes</h2>
      <table aria-busy="listLoading">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Archivo</th>
            <th>Usuario ID</th>
            <th>Categoría ID</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resources" :key="resource.id">
            <td>{{ resource.id }}</td>
            <td>{{ resource.filename }}</td>
            <td>{{ resource.user_id }}</td>
            <td>{{ resource.category_id }}</td>
            <td>{{ new Date(resource.upload_date).toLocaleDateString() }}</td>
            <td>
              <button @click="editResource(resource)" class="action-btn">Editar</button>
              <button @click="deleteResource(resource.id)" class="action-btn delete-btn">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL;

const resources = ref([]);
const categories = ref([]);
const form = ref({
  filename: '',
  user_id: null,
  category_id: '',
});
const editingResource = ref(null);
const message = ref('');
const messageType = ref('');
const loading = ref(false);
const listLoading = ref(false);

const fetchResources = async () => {
  listLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/resources`);
    if (res.ok) resources.value = await res.json();
  } catch (e) {
    message.value = 'Error al cargar los recursos.';
    messageType.value = 'error';
  } finally {
    listLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_URL}/api/categories`);
    if (res.ok) categories.value = await res.json();
  } catch (e) {
    console.error('Error fetching categories:', e);
  }
};

onMounted(() => {
  fetchResources();
  fetchCategories();
});

const resetForm = () => {
  form.value = { filename: '', user_id: null, category_id: '' };
  editingResource.value = null;
};

const submit = async () => {
  loading.value = true;
  message.value = '';
  
  const method = editingResource.value ? 'PUT' : 'POST';
  const url = editingResource.value 
    ? `${API_URL}/api/resources/${editingResource.value.id}` 
    : `${API_URL}/api/resources`;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();
    if (res.ok) {
      message.value = data.message || `Recurso ${editingResource.value ? 'actualizado' : 'guardado'}.`;
      messageType.value = 'success';
      resetForm();
      await fetchResources();
    } else {
      message.value = data.message || 'Error en la operación.';
      messageType.value = 'error';
    }
  } catch (error) {
    message.value = 'Error de red.';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};

const editResource = (resource) => {
  editingResource.value = resource;
  // Aseguramos que el form tenga los mismos campos que el objeto original
  form.value = { 
    filename: resource.filename,
    user_id: resource.user_id,
    category_id: resource.category_id
  };
  window.scrollTo(0, 0);
};

const cancelEdit = () => {
  resetForm();
};

const deleteResource = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar este recurso?')) return;
  
  await fetch(`${API_URL}/api/resources/${id}`, { method: 'DELETE' });
  message.value = 'Recurso eliminado.';
  messageType.value = 'success';
  await fetchResources();
};
</script>

<style scoped>
.resource-form { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
.form-actions { display: flex; gap: 1rem; }
.form-actions .cancel-btn { background-color: #6c757d; }
.list-container { margin-top: 2rem; }
.action-btn { margin-right: 0.5rem; padding: 0.25rem 0.5rem; width: auto; }
.delete-btn { background-color: #dc3545; }
</style>