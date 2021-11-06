import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../views/Home.vue'
import Aggr from '../views/Aggr.vue'
import Free from '../views/Free.vue'

Vue.use(VueRouter)

const routes = [{
		path: '/',
		name: 'Home',
		component: Home
	},
	{
		path: '/aggr',
		name: 'Aggr',
		component: Aggr
	},
	{
		path: '/free',
		name: 'Free',
		component: Free
	}
]

const router = new VueRouter({
	routes
})

export default router
