<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-2">Recuperar contraseña</h1>
      <p class="text-center text-sm text-gray-500 mb-6">Ingresa tu correo y te enviaremos un enlace de recuperación.</p>

      <div v-if="error" class="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-100 text-green-600 p-3 rounded-lg mb-4 text-sm">
        {{ success }}
      </div>

      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
        <input
          v-model="email"
          type="text"
          autocomplete="off"
          readonly
          @focus="($event.target as HTMLInputElement).removeAttribute('readonly')"
          class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        @click="handleForgot"
        :disabled="loading"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
      >
        {{ loading ? 'Enviando...' : 'Enviar enlace' }}
      </button>

      <p class="text-center text-sm text-gray-500 mt-4">
        <router-link to="/login" class="text-blue-600 hover:underline">Volver al inicio de sesión</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'

const email = ref<string>('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function handleForgot() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    const response = await axios.post('http://localhost:3000/auth/recover-password', {
      email: email.value
    })
    success.value = response.data.message
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al enviar el correo'
  } finally {
    loading.value = false
  }
}
</script>