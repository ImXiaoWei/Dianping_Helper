<template>
	<div class="free">
		<!-- 移动端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'mobile'">
			<van-nav-bar title="免费试列表" fixed :placeholder='true' />
		</div>

		<!-- 电脑端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'pc'">
			<el-drawer title="报名列表" :visible.sync="drawer" direction="rtl" size="35%">
				<iframe
					:src="'https://m.dianping.com/mobile/dinendish/apply/'+item.offlineActivityId+'?a=1&source=null&utm_source=517bwcxq0507'"
					v-for="(item,index) in freeList" :key="index" scrolling="no" frameborder="0" height="170">
				</iframe>
			</el-drawer>
			<el-button type="danger" @click="drawer = true">一键报名</el-button>

			<el-table :data="freeList" stripe style="width: 100%" v-show="showTable" v-loading="loading"
				element-loading-text="加载中" height="700">
				<el-table-column prop="title" label="标题" width="500">
				</el-table-column>
				<el-table-column prop="type" label="类型" width="100">
				</el-table-column>
				<el-table-column prop="regionName" label="地区" width="200">
				</el-table-column>
				<el-table-column label="中奖人数" width="100">
					<template slot-scope="scope">
						{{scope.row.userWinCount + "人"}}
					</template>
				</el-table-column>
				<el-table-column label="报名人数" width="100">
					<template slot-scope="scope">
						{{scope.row.applyCount + "人"}}
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope="scope">
						<el-button type="primary" size="mini"
							@click="getFreeDetail(scope.row.offlineActivityId,scope.row.title,'simple')">立即报名
						</el-button>
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
	</div>
</template>

<script>
	export default {
		data() {
			return {
				freeList: [], //免费试列表
				page: 1, //当前页码
				deviceType: '', //设备类型
				loading: true, //是否加载中
				showTable: true, //表格显示
				freeDetailUrl: '', //免费试URL
				drawer: false
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
			},
			async getFreeDetail(id, name, mode) {
				const {
					data: res
				} = await this.$http.get(
					'/mapi/astro-plat/freemeal/bwcDetailPackage', {
						params: {
							offlineActivityId: id
						},
					})
				this.freeDetailUrl = res.data.bwcData.applyURL
				if (mode == "simple") {
					this.openFreeDetail(name)
				}

			},

			/* 请求总页码 */

			/* 电脑端方法 */
			/* 上一页 */
			prevPage() {
				this.freeList = []
				this.page--
				this.getFreeList(this.page)
			},
			/* 下一页 */
			nextPage() {
				this.freeList = []
				this.page++
				this.getFreeList(this.page)
			},
			/* 选择页数 */
			currPage(val) {
				this.freeList = []
				this.getFreeList(val)
			},
			// 打开详情窗口
			openFreeDetail(name) {
				this.$alert('<iframe src=' + this.freeDetailUrl + ' height="170" scrolling="no" frameborder="0"></iframe>',
					name, {
						dangerouslyUseHTMLString: true,
						center: true
					});

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
	.time {
		font-size: 13px;
		color: #999;
	}

	.bottom {
		margin-top: 13px;
		line-height: 12px;
	}

	.button {
		padding: 0;
		float: right;
	}

	.image {
		width: 100%;
		display: block;
	}

	.clearfix:before,
	.clearfix:after {
		display: table;
		content: "";
	}

	.clearfix:after {
		clear: both
	}
</style>
