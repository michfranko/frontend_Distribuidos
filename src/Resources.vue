<template>
  <div>
    <h1>Gestión de Recursos</h1>

    <!-- Formulario para Crear/Editar -->
    <form @submit.prevent="submit" :aria-busy="loading" class="resource-form">
      <h3>{{ editingResource ? 'Editar Recurso' : 'Nuevo Recurso' }}</h3>
      <div class="form-group">
        <label for="title">Título del Recurso</label>
        <input id="title" v-model="form.title" placeholder="Ej: Mi Recurso" required :disabled="loading" />
      </div>
      <div class="form-group">
        <label for="user_id">Usuario</label>
        <select id="user_id" v-model="form.user_id" required :disabled="loading || users.length === 0">
          <option disabled value="">
            {{ users.length > 0 ? 'Seleccione un usuario' : 'Cargando usuarios...' }}
          </option>
          <option v-for="user in users" :key="user.id" :value="user.id">
            {{ user.name }} ({{ user.email }})
          </option>
        </select>
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
      <div class="form-group">
        <label for="content">Contenido del Recurso</label>
        <textarea id="content" v-model="form.content" placeholder="Escribe el contenido del recurso aquí..." required :disabled="loading" rows="5"></textarea>
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
            <th>Título</th>
            <th>Usuario</th>
            <th>Categoría</th>
            <th>Contenido</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="resource in resources" :key="resource.id">
            <td>{{ resource.id }}</td>
            <td>{{ resource.title }}</td>
            <td>{{ getUserName(resource.user_id) }}</td>
            <td>{{ getCategoryName(resource.category_id) }}</td>
            <td>{{ resource.content.length > 50 ? resource.content.substring(0, 50) + '...' : resource.content }}</td>
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
const users = ref([]);
const form = ref({
  title: '',
  user_id: '',
  category_id: '',
  content: '',
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

const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/api/users`);
    if (res.ok) users.value = await res.json();
  } catch (e) {
    console.error('Error fetching users:', e);
  }
};

onMounted(() => {
  fetchResources();
  fetchCategories();
  fetchUsers();
});

const resetForm = () => {
  form.value = { title: '', user_id: '', category_id: '', content: '' };
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
      headers: {
        'Content-Type': 'application/json',
      },
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
  form.value = { 
    title: resource.title,
    user_id: resource.user_id,
    category_id: resource.category_id,
    content: resource.content
  };
  window.scrollTo(0, 0);
};

const getUserName = (userId) => {
  const user = users.value.find(u => u.id === userId);
  return user ? user.name : 'Desconocido';
};

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : 'Desconocida';
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