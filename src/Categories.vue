<template>
  <div>
    <h1>Gestión de Categorías</h1>

    <!-- Formulario para Crear/Editar -->
    <form @submit.prevent="submit" :aria-busy="loading" class="category-form">
      <h3>{{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>
      <div class="form-group">
        <label for="name">Nombre</label>
        <input id="name" v-model="form.name" placeholder="Nombre de la categoría" required :disabled="loading" />
      </div>
      <div class="form-actions">
        <button type="submit" :disabled="loading">
          {{ loading ? 'Guardando...' : (editingCategory ? 'Actualizar' : 'Guardar') }}
        </button>
        <button type="button" v-if="editingCategory" @click="cancelEdit" :disabled="loading" class="cancel-btn">
          Cancelar
        </button>
      </div>
    </form>

    <p v-if="message" :class="['message', messageType]">{{ message }}</p>

    <!-- Lista de Categorías -->
    <div class="list-container">
      <h2>Categorías Existentes</h2>
      <table aria-busy="listLoading">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in categories" :key="category.id">
            <td>{{ category.id }}</td>
            <td>{{ category.name }}</td>
            <td>
              <button @click="editCategory(category)" class="action-btn">Editar</button>
              <button @click="deleteCategory(category.id)" class="action-btn delete-btn">Eliminar</button>
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

const categories = ref([]);
const form = ref({ name: '' });
const editingCategory = ref(null);
const message = ref('');
const messageType = ref('');
const loading = ref(false); // Para el formulario
const listLoading = ref(false); // Para la tabla

const fetchCategories = async () => {
  listLoading.value = true;
  try {
    const res = await fetch(`${API_URL}/api/categories`);
    if (res.ok) {
      categories.value = await res.json();
    }
  } catch (e) {
    message.value = 'Error al cargar las categorías.';
    messageType.value = 'error';
  } finally {
    listLoading.value = false;
  }
};

onMounted(fetchCategories);

const resetForm = () => {
  form.value = { name: '' };
  editingCategory.value = null;
};

const submit = async () => {
  loading.value = true;
  message.value = '';
  
  const method = editingCategory.value ? 'PUT' : 'POST';
  const url = editingCategory.value 
    ? `${API_URL}/api/categories/${editingCategory.value.id}` 
    : `${API_URL}/api/categories`;

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });

    const data = await res.json();
    if (res.ok) {
      message.value = data.message || `Categoría ${editingCategory.value ? 'actualizada' : 'guardada'}.`;
      messageType.value = 'success';
      resetForm();
      await fetchCategories();
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

const editCategory = (category) => {
  editingCategory.value = category;
  form.value = { ...category };
  window.scrollTo(0, 0); // Sube al inicio de la página para ver el form
};

const cancelEdit = () => {
  resetForm();
};

const deleteCategory = async (id) => {
  if (!confirm('¿Seguro que quieres eliminar esta categoría?')) return;
  
  await fetch(`${API_URL}/api/categories/${id}`, { method: 'DELETE' });
  message.value = 'Categoría eliminada.';
  messageType.value = 'success';
  await fetchCategories();
};
</script>

<style scoped>
.category-form {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.form-actions {
  display: flex;
  gap: 1rem;
}
.form-actions .cancel-btn {
  background-color: #6c757d;
}
.list-container {
  margin-top: 2rem;
}
.action-btn {
  margin-right: 0.5rem;
  padding: 0.25rem 0.5rem;
  width: auto;
}
.delete-btn {
  background-color: #dc3545;
}
</style>