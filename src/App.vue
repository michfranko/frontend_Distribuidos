<template>
  <div id="app-container" class="container">
    <h1>Subir Recurso</h1>
    <form @submit.prevent="submit" :aria-busy="loading">
      <div class="form-group">
        <label for="title">Título</label>
        <input
          id="title"
          v-model="title"
          placeholder="Título del recurso"
          required
          :disabled="loading"
        />
      </div>
      <div class="form-group">
        <label for="user_id">ID de Usuario</label>
        <input
          id="user_id"
          type="number"
          v-model.number="user_id"
          placeholder="ID del usuario que sube el recurso"
          required
          :disabled="loading"
        />
      </div>
      <div class="form-group">
        <label for="category_id">ID de Categoría</label>
        <select
          id="category_id"
          v-model="category_id"
          required
          :disabled="loading"
        >
          <option disabled value="">Seleccione una categoría</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Guardando...' : 'Guardar Recurso' }}
      </button>
    </form>

    <p v-if="message" :class="['message', messageType]">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const title = ref('')
const user_id = ref(1) // Valor por defecto
const category_id = ref('') // Valor por defecto para el select
const categories = ref([]) // Para almacenar las categorías del backend
const message = ref('')
const messageType = ref('') // 'success' or 'error'
const loading = ref(false)

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
    if (res.ok) {
      categories.value = await res.json()
    } else {
      message.value = 'Error al cargar las categorías.'
      messageType.value = 'error'
    }
  } catch (error) {
    console.error('Error de red al cargar categorías:', error)
    message.value = 'No se pudo conectar con el servidor para cargar categorías.'
    messageType.value = 'error'
  }
})

const resetForm = () => {
  title.value = ''
  // user_id se podría resetear al del usuario logueado.
  category_id.value = ''
}

const submit = async () => {
  loading.value = true
  message.value = ''
  messageType.value = ''

  // Construimos el objeto de datos que se enviará como JSON
  const resourceData = {
    title: title.value,
    user_id: user_id.value,
    category_id: category_id.value
  }

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/resources`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resourceData)
      }
    )

    if (res.ok) {
      const responseData = await res.json()
      message.value = responseData.message || 'Recurso guardado correctamente'
      messageType.value = 'success'
      resetForm()
    } else {
      const errorData = await res.json().catch(() => ({}))
      // Manejo de errores de validación de express-validator
      if (errorData.errors) {
        message.value = errorData.errors.map((e) => e.msg).join(' ');
      } else {
        message.value = errorData.message || `Error al guardar el recurso (código: ${res.status})`
      }
      messageType.value = 'error'
    }
  } catch (error) {
    console.error('Error en la subida:', error)
    message.value = 'Error de red. No se pudo conectar con el servidor.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

</script>

<style>
#app-container {
  max-width: 400px;
  margin: 0 auto;
  padding-top: 40px;
  font-family: sans-serif;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
}

input,
select,
button {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ccc;
}

button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:disabled {
  background-color: #a0a0a0;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: 4px;
}

.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>
