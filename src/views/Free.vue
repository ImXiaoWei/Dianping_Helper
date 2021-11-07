<template>
	<div class="free">
		<!-- 移动端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'mobile'">

			<!-- 回到顶部 -->
			<el-backtop style="margin-bottom: 30px"></el-backtop>

			<!-- 登录窗口 -->
			<van-dialog v-model="loginShow">
				<div class="bottomContent">
					<iframe height="500" scrolling="no" frameborder="0"
						src="https://maccount.dianping.com/login"></iframe>
				</div>
			</van-dialog>

			<!-- 详情窗口 -->
			<van-action-sheet v-model="detailShow" :title="mobileTitle">
				<div class="bottomContent" v-html="detailIframe"></div>
			</van-action-sheet>

			<!-- 导航条 -->
			<van-nav-bar title="免费试列表" fixed :placeholder='true' right-text="登录" @click-right="mobileLogin" />

			<!-- 选项卡 -->
			<van-tabs v-model="active" animated @click="changeTab">

				<!-- 普通模式 -->
				<van-tab title="普通模式">
					<!-- 列表 -->
					<van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="nextLoad" offset="100"
						v-if="active==0">
						<van-collapse v-model="activeNames">
							<van-collapse-item v-for="(item,index) in freeList" :key="index">
								<template #title>
									<van-tag color="#443D34" text-color="#D1AC75"
										v-show="item.offlineActivityTagDTOList.length!=0">V专享</van-tag>
									<span class="custom-title"
										@click.stop="mobileDetail(item.offlineActivityId,item.title,item.detailUrl)">{{" " + item.title | ellipsis}}</span>
								</template>
								<template #default>
									<van-row type="flex" justify="space-between">
										<van-col span="8">中奖数:{{item.userWinCount}}</van-col>
										<van-col span="8">中奖率:{{(item.userWinCount/item.applyCount*10).toFixed(2)+"%"}}
										</van-col>
										<van-col span="8">报名数:{{item.applyCount}}</van-col>
									</van-row>
									<span class="custom-title"> </span>
								</template>
								<template #value>
									<van-tag type="primary" plain>
										<span>{{item.regionName}}</span>
									</van-tag>
									&nbsp;
									<span class="custom-title" style="color: #FF7033">{{"价值￥"+item.cost}}</span>
								</template>
							</van-collapse-item>
						</van-collapse>
					</van-list>
				</van-tab>
				<van-tab title="报名模式">
					<!-- 报名模式 -->
					<van-empty description="已全部加载" v-if="finished==true" />
					<van-grid :border="false" :column-num="2" v-if="active==1&&finished==false">
						<van-grid-item v-for="(item,index) in freeList" :key="index">
							<iframe :src="'https://m.dianping.com/mobile/dinendish/apply/'+item.offlineActivityId"
								width="100%" scrolling="no" frameborder="0"
								sandbox='allow-scripts allow-same-origin'></iframe>
						</van-grid-item>
					</van-grid>
					<van-button color="#FF6633" block square @click="nextLoad()" ref="nextBtn"
						v-show="finished == false">下一页</van-button>
				</van-tab>
			</van-tabs>
		</div>

		<!-- 电脑端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'pc'">

			<!-- 一键报名窗口 -->
			<el-drawer title="报名列表" :visible.sync="drawer" direction="rtl" size="35%">
				<iframe
					:src="'https://m.dianping.com/mobile/dinendish/apply/'+item.offlineActivityId+'?a=1&source=null&utm_source=517bwcxq0507'"
					v-for="(item,index) in freeList" :key="index" scrolling="no" frameborder="0" height="170">
				</iframe>
			</el-drawer>

			<!-- 一键报名 -->
			<el-button type="danger" @click="drawer = true">一键报名</el-button>

			<!-- 免费试列表 -->
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
							@click="getFreeDetail(scope.row.offlineActivityId,scope.row.title)">立即报名
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
				freeList: [], //免费试列表数组
				page: 1, //当前页码数
				deviceType: '', //设备类型
				loading: true, //是否加载中
				showTable: true, //是否加载表格
				freeDetailUrl: '', //免费试URL
				drawer: false, //是否显示右侧一键报名窗口

				finished: false, //是否加载结束
				loginShow: false, //是否显示登录界面
				activeNames: ['1'], //控制展开数
				detailShow: false, //是否显示详情窗口
				mobileTitle: '', //详情窗口标题
				detailIframe: '', //详情窗口界面
				active: 0, //当前激活的TAB
			}
		},
		methods: {
			/* ---------------------- 通用方法 ---------------------- */

			/* 客户端匹配 */
			isMobile() {
				let flag = navigator.userAgent.match(
					/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
				)
				return flag;
			},

			/* 请求列表 */
			async getFreeList(page) {
				//加载中状态
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
				//判断设备类型
				if (this.deviceType == 'pc') {
					//若为电脑端，直接将结果赋予数组
					this.freeList = res.data.lotteryActivityList
				} else if (this.deviceType == 'mobile') {
					//若为移动端，将结果添加至数组末尾
					if (res.data.lotteryActivityList.length == 0) {
						//结果为0时完成全部加载
						this.finished = true
						this.$toast.fail('无更多数据')
						return
					}
					this.freeList = this.freeList.concat(res.data.lotteryActivityList)
				}
				//结束加载状态
				this.loading = false
			},
			/* 获取免费试详情 */
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
				this.openFreeDetail(name)

			},

			/* ---------------------- 电脑端方法 ---------------------- */

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
			},

			/* ---------------------- 移动端方法 ---------------------- */

			/* 下拉加载 */
			nextLoad() {
				if (this.active == 0) { //标签为普通模式时
					this.loading = true
					this.page++
					this.getFreeList(this.page)
				} else if (this.active == 1) { //标签为报名模式时
					this.$toast.loading('加载中');
					this.freeList = []
					this.page++
					this.getFreeList(this.page)
				}
			},
			/* 登录界面显示 */
			mobileLogin() {
				this.loginShow = true
			},
			/* 详情界面 */
			mobileDetail(id, title, url) {
				this.mobileTitle = title
				this.detailShow = true
				this.detailIframe = "<iframe src='" + url + "' height='1200' frameborder='0' scrolling='no'></iframe>"
			},
			/* 切换标签 */
			changeTab() {
				this.finished = false //初始化加载
				this.freeList = []
				this.page = 1
				this.getFreeList(this.page)
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
		},
		filters: {
			//标题过滤器
			ellipsis(value) {
				if (!value) return ''
				if (value.length > 14) {
					return value.slice(0, 14) + '...'
				}
				return value
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
