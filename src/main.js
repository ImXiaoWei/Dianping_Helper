import Vue from 'vue'
import App from './App.vue'
import router from './router'

import VueCookies from 'vue-cookies'

Vue.config.productionTip = false

import 'default-passive-events'

import axios from 'axios'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import Vant from 'vant';
import 'vant/lib/index.css';



Vue.use(ElementUI)
Vue.use(Vant)
Vue.use(VueCookies)
axios.defaults.baseURL = 'http://localhost:8080'
Vue.prototype.$http = axios

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')
