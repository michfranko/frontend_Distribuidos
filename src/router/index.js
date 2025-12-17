import { createRouter, createWebHistory } from 'vue-router'
import Resources from '../Resources.vue'
import Categories from '../Categories.vue'
import Users from '../Users.vue'
import Logs from '../Logs.vue'

const routes = [
  {
    path: '/',
    redirect: '/resources',
  },
  {
    path: '/resources',
    name: 'Resources',
    component: Resources,
  },
  {
    path: '/categories',
    name: 'Categories',
    component: Categories,
  },
  { path: '/users', name: 'Users', component: Users },
  { path: '/logs', name: 'Logs', component: Logs },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router