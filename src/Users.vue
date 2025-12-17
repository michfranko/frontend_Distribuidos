<template>
  <div>
    <h1>Gestión de Usuarios</h1>

    <!-- Formulario para Crear/Editar -->
    <form @submit.prevent="submit" :aria-busy="loading" class="user-form">
      <h3>{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
      <div class="form-group">
        <label for="username">Nombre de Usuario</label>
        <input id="username" v-model="form.username" required />
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" type="email" v-model="form.email" required />
      </div>
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input id="password" type="password" v-model="form.password" :placeholder="editingUser ? 'Dejar en blanco para no cambiar' : ''" :required="!editingUser" />
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : (editingUser ? 'Actualizar' : 'Crear') }}
        </button>
        <button type="button" v-if="editingUser" @click="cancelEdit" :disabled="loading" class="cancel-btn">
          Cancelar
        </button>
      </div>
    </form>

    <p v-if="message" :class="['message', messageType]">{{ message }}</p>

    <!-- Lista de Usuarios -->
    <div class="list-container">
      <h2>Usuarios Existentes</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>
              <button @click="editUser(user)" class="action-btn">Editar</button>
              <button @click="deleteUser(user.id)" class="action-btn delete-btn">Eliminar</button>
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

const users = ref([]);
const form = ref({ username: '', email: '', password: '' });
const editingUser = ref(null);
const message = ref('');
const messageType = ref('');
const loading = ref(false);

const fetchUsers = async () => {
  try {
    const res = await fetch(`${API_URL}/api/users`);
    if (res.ok) users.value = await res.json();
  } catch (e) {
    message.value = 'Error al cargar los usuarios.';
    messageType.value = 'error';
  }
};

onMounted(fetchUsers);

const resetForm = () => {
  form.value = { username: '', email: '', password: '' };
  editingUser.value = null;
};

const submit = async () => {
  loading.value = true;
  message.value = '';

  const method = editingUser.value ? 'PUT' : 'POST';
  const url = editingUser.value 
    ? `${API_URL}/api/users/${editingUser.value.id}` 
    : `${API_URL}/api/users`;

  // Al editar, no enviar la contraseña si está vacía
  const body = { ...form.value };
  if (editingUser.value && !body.password) {
    delete body.password;
  }

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      message.value = data.message || `Usuario ${editingUser.value ? 'actualizado' : 'creado'}.`;
      messageType.value = 'success';
      resetForm();
      await fetchUsers();
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

const editUser = (user) => {
  editingUser.value = user;
  form.value = { ...user, password: '' }; // Limpiar campo de contraseña
  window.scrollTo(0, 0);
};

const cancelEdit = () => {
  resetForm();
};

const deleteUser = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
  
  await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
  message.value = 'Usuario eliminado.';
  messageType.value = 'success';
  await fetchUsers();
};
</script>

<style scoped>
.user-form { margin-bottom: 2rem; padding: 1rem; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; }
.form-actions { display: flex; gap: 1rem; }
.form-actions .cancel-btn { background-color: #6c757d; }
.list-container { margin-top: 2rem; }
.action-btn { margin-right: 0.5rem; padding: 0.25rem 0.5rem; width: auto; }
.delete-btn { background-color: #dc3545; }
</style>