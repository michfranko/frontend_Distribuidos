<template>
  <div class="container">
    <h1>Subir recurso</h1>
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
        <label for="file">Archivo</label>
        <input
          id="file"
          type="file"
          @change="onFileChange"
          required
          ref="fileInput"
          :disabled="loading"
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Subiendo...' : 'Subir' }}
      </button>
    </form>

    <p v-if="message" :class="['message', messageType]">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const title = ref('')
const file = ref(null)
const fileInput = ref(null) // Ref for the file input element
const message = ref('')
const messageType = ref('') // 'success' or 'error'
const loading = ref(false)

const onFileChange = (e) => {
  file.value = e.target.files[0]
}

const resetForm = () => {
  title.value = ''
  file.value = null
  if (fileInput.value) {
    fileInput.value.value = '' // This resets the file input
  }
}

const submit = async () => {
  if (!file.value) {
    message.value = 'Por favor, selecciona un archivo.'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = ''
  messageType.value = ''

  const form = new FormData()
  form.append('title', title.value)
  form.append('file', file.value)
  form.append('user_id', 1) // TODO: This should be dynamic (e.g., from auth state)
  form.append('category_id', 1)

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/resources`,
      {
        method: 'POST',
        body: form
      }
    )

    if (res.ok) {
      message.value = 'Archivo subido correctamente'
      messageType.value = 'success'
      resetForm()
    } else {
      const errorData = await res.json().catch(() => ({}))
      message.value = errorData.message || `Error al subir el archivo (código: ${res.status})`
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
.container {
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
