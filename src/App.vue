<template>
  <div id="app-container" class="container">
    <nav class="main-nav">
      <router-link to="/resources">Recursos</router-link>
      <router-link to="/categories">Categorías</router-link>
      <router-link to="/users">Usuarios</router-link>
      <router-link to="/logs">Logs</router-link>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup></script>

<style>
#app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}

.main-nav {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ccc;
}

.main-nav a {
  text-decoration: none;
  color: #007bff;
  font-weight: bold;
  padding: 0.5rem;
  border-radius: 4px;
}

.main-nav a.router-link-exact-active {
  background-color: #007bff;
  color: white;
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

/* Estilos para tablas que usaremos en las vistas */
table {
  width: 100%;
  border-collapse: collapse;
}
</style>
