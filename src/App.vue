<template>
	<div id="app">
		<!-- 移动端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'mobile'">
			<router-view></router-view>
			<!-- 底部标签栏 -->
			<van-tabbar v-model="active" :placeholder='true'>
				<van-tabbar-item to="/" icon="home-o">主页</van-tabbar-item>
				<van-tabbar-item to="/aggr" icon="shop-o">团购</van-tabbar-item>
				<van-tabbar-item to="/free" icon="point-gift-o">免费试</van-tabbar-item>
			</van-tabbar>
		</div>
		<!-- PC 端 UI -->
		<div class="pc-form" v-if="this.deviceType === 'pc'">
			<el-container>
				<!-- 头部区域 -->
				<el-header>
					<el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" router>
						<!-- 登录按钮 -->
						<el-menu-item>
							<el-button @click="login">登录</el-button>
						</el-menu-item>
						<el-menu-item index="/">主页</el-menu-item>
						<el-menu-item index="/aggr">团购</el-menu-item>
						<el-menu-item index="/free">免费试</el-menu-item>
					</el-menu>
				</el-header>
				<!-- 内容区域 -->
				<el-main>
					<!-- 路由占位符 -->
					<router-view></router-view>
				</el-main>
			</el-container>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				activeIndex: this.$route.path, //当前激活菜单的 index
				deviceType: '', //设备类型
				active: 0
			};
		},
		methods: {
			/* 登录 */
			login() {
				this.$alert(
					'<iframe width="350" height="600" scrolling="no" frameborder="0" src="https://maccount.dianping.com/login">/iframe>',
					'登录', {
						dangerouslyUseHTMLString: true,
						center: true
					});

			},
			isMobile() {
				let flag = navigator.userAgent.match(
					/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
				)
				return flag;
			}

		},
		mounted() {
			/* 判断当前客户端 */
			if (this.isMobile()) {
				/* 手机端操作 */
				this.deviceType = 'mobile'
				if (this.$route.path == "/") {
					this.active = 0
				} else if (this.$route.path == "/aggr") {
					this.active = 1
				} else if (this.$route.path == "/free") {
					this.active = 2
				}
			} else {
				/* PC端操作 */
				this.deviceType = 'pc'
			}
		}
	}
</script>

<style lang="less">

</style>
