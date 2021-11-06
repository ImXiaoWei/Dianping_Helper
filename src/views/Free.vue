<template>
	<div class="free">
		<!-- 移动端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'mobile'">
			<van-nav-bar title="免费试列表" fixed :placeholder='true' />
		</div>

		<!-- 电脑端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'pc'">
			<el-table :data="freeList" stripe style="width: 100%" v-loading="loading" element-loading-text="加载中" height="700">
				<el-table-column prop="title" label="标题">
				</el-table-column>
				<el-table-column prop="type" label="类型">
				</el-table-column>
				<el-table-column prop="regionName" label="地区">
				</el-table-column>
				<el-table-column prop="userWinCount" label="中奖人数">
				</el-table-column>
				<el-table-column prop="applyCount" label="报名人数">
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button type="primary" size="mini">立即报名</el-button>
					</template>
				</el-table-column>
			</el-table>
			<br>
			<el-row type="flex" :span="12" :offset="6" justify="space-around">
				<el-col :span="6">
					<el-pagination background layout="prev, pager, next" :total="1000" @prev-click="prevPage()"
						@next-click="nextPage()" @current-change="currPage">
					</el-pagination>
				</el-col>
			</el-row>
		</div>

		<!-- <iframe src="https://m.dianping.com/mobile/dinendish/apply/2092152428?a=1&source=null&utm_source=517bwcxq0507"
			frameborder="0" scrolling="no" sandbox='allow-scripts allow-same-origin'></iframe> -->
	</div>
</template>

<script>
	export default {
		data() {
			return {
				freeList: [],
				page: 1,
				deviceType: '',
				loading: true
			}
		},
		methods: {
			/* 客户端匹配 */
			isMobile() {
				let flag = navigator.userAgent.match(
					/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
				)
				return flag;
			},

			/* 请求列表 */
			async getFreeList(page) {
				this.loading = true
				const {
					data: res
				} = await this.$http.get(
					'/mapi/astro-plat/freemeal/loadLotteryList', {
						params: {
							page: page,
							regionParentId: 0,
							regionId: 0,
							category: 1,
							sort: 0,
							filter: 0,
							cityid: 7,
							latitude: '',
							longitude: '',
							env: 'dp'
						},
					})
				this.freeList = res.data.lotteryActivityList
				this.loading = false
				console.log(this.freeList);
				//console.log(res.data.lotteryActivityList);
			},
			
			/* 请求总页码 */

			/* 电脑端方法 */
			prevPage() {
				this.freeList = []
				this.page--
				this.getFreeList(this.page)
			},
			nextPage() {
				this.freeList = []
				this.page++
				this.getFreeList(this.page)
			},
			currPage(val) {
				this.freeList = []
				this.getFreeList(val)
			}
		},
		created() {
			this.getFreeList(this.page)
		},
		mounted() {
			/* 判断用户客户端 */
			if (this.isMobile()) { //手机端
				this.deviceType = 'mobile'
			} else {
				this.deviceType = 'pc' //电脑端
			}
		}
	}
</script>

<style>
</style>
