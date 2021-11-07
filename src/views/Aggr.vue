<template>
	<div class="aggr">
		<!-- 临时 DOM -->
		<div v-show="false" v-html="listDom" ref="myListDom"></div>
		<div v-show="false" v-html="detailDom" ref="mydetailDom"></div>
		<!-- 移动端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'mobile'">
			
			<!-- 回到顶部 -->
			<el-backtop style="margin-bottom: 30px"></el-backtop>
			
			<!-- 详情窗口 -->
			<van-action-sheet v-model="buttonShow" :title="mobileShopName">
				<div class="bottomContent" v-html="buttonIframe"></div>
			</van-action-sheet>

			<!-- 顶部组件 -->
			<van-nav-bar title="团购列表" fixed :placeholder='true'>
				<template #right>
					<!-- 位置选择窗口 -->
					<van-popover v-model="showPopover" trigger="click" :actions="cities" @select="positionChange"
						style="color: #549BFB" placement="bottom-end">
						<template #reference>
							<van-icon name="location-o" size="18" />
							<span>{{positionValue}}</span>
						</template>
					</van-popover>
				</template>
			</van-nav-bar>
			
			<!-- 搜索框 -->
			<van-row type="flex" justify="center" align="center">
				<van-col span="18">
					<van-search v-model="searchTxt" placeholder="请输入搜索关键词" @search="search" />
				</van-col>
				<van-col span="6">
					<van-checkbox v-model="onlySec" icon-size="16px" shape="square" style="font-size: 14px"
						@change="changeSec">只看秒杀
					</van-checkbox>
				</van-col>
			</van-row>
			
			<!-- 快速选择 -->
			<div class="quickSearch">
				<van-tag color="#F7F8FA" text-color="#C8C9CC" size="large" @click="quickSearch('2人')">两人餐</van-tag>
				&nbsp;
				<van-tag color="#F7F8FA" text-color="#C8C9CC" size="large" @click="quickSearch('双人')">双人餐</van-tag>
				&nbsp;
				<van-tag color="#F7F8FA" text-color="#C8C9CC" size="large" @click="quickSearch('自助')">自助餐</van-tag>
				&nbsp;
				<van-tag color="#F7F8FA" text-color="#C8C9CC" size="large" @click="quickSearch('代金')">代金券</van-tag>
				&nbsp;
			</div>
			<br>
			
			<!-- 列表 -->
			<van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
				<van-collapse v-model="activeNames">
					<van-collapse-item v-for="(item,index) in aggrList" :key="index" icon="shop-o">
						<template #title>
							<van-tag type="danger" v-show="item.distance<10 && item.tag == '秒杀'">New</van-tag>
							<span class="custom-title"
								@click.stop="mobileDetail(item.id,item.name)">{{item.name}}</span>
						</template>
						<template #default>
							<span class="custom-title">{{item.title}}</span>
						</template>
						<template #value>
							<van-tag :type="tagColor(item.discount)" v-show="item.discount != 1 && item.tag != '秒杀'"
								plain>
								<span>{{(item.discount*10).toFixed(2)+" 折"}}</span>
							</van-tag>
							<van-tag :type="tagColor(item.discount)" v-show="item.discount != 1 && item.tag == '秒杀'">
								<span>秒杀</span>
							</van-tag>
							&nbsp;
							<span class="custom-title"
								style="text-decoration: line-through;color: #ccc;">{{"￥"+item.oPrice}}</span>
							<span class="custom-title">{{"￥"+item.price}}</span>
						</template>
					</van-collapse-item>
				</van-collapse>
			</van-list>
		</div>


		<!-- 电脑端 UI -->
		<div class="mobile-form" v-if="this.deviceType === 'pc'">
			
			<!-- 功能区 -->
			<el-row type="flex" class="row-bg">
				
				<!-- 搜索框 -->
				<el-col :span="6">
					<el-input placeholder="请输入内容" v-model="searchTxt" @keyup.enter.native="search"
						class="input-with-select">
						<el-button slot="append" icon="el-icon-search" @click="search"></el-button>
					</el-input>
				</el-col>
				
				<!-- 分页 -->
				<el-col :span="6">
					&nbsp;
					<el-button type="primary" icon="el-icon-arrow-left" @click="prevPage" :disabled="page<=0">上一页
					</el-button>
					<el-button type="primary" @click="nextPage">下一页<i class="el-icon-arrow-right el-icon--right"></i>
					</el-button>
				</el-col>

				<!-- 位置选择 -->
				<el-col :span="2" :offset="12">
					<el-select v-model="positionValue" placeholder="请选择" style="width: 150px" @change="positionChange">
						<el-option v-for="item in cities" :key="item.value" :label="item.label" :value="item.value">
							<span style="float: left">{{ item.label }}</span>
							<span style="float: right; color: #8492a6; font-size: 13px">{{ item.value }}</span>
						</el-option>
					</el-select>
					&nbsp;
				</el-col>
			</el-row>

			<!-- 表格区域 -->
			<div class="table">
				<el-table :data="aggrList" v-loading="loading" element-loading-text="加载中" style="width: 100%"
					height="700" ref="myTable">
					<el-table-column label="名称" width="400">
						<template slot-scope="scope">
							<el-tag :type="scope.row.tag === '秒杀' ? 'danger' : 'success'" disable-transitions
								v-if="scope.row.tag==='秒杀'">{{scope.row.tag}}
							</el-tag>
							{{scope.row.name}}
						</template>
					</el-table-column>
					<el-table-column label="描述" width="600">
						<template slot-scope="scope">
							<el-tag type="danger" v-show="scope.row.tag === '秒杀' && scope.row.distance<10">
								新单
							</el-tag>
							{{scope.row.title | titleFormat}}
						</template>
					</el-table-column>
					<el-table-column label="现价" width="100">
						<template slot-scope="scope">
							{{scope.row.price | priceFormat}}
						</template>
					</el-table-column>
					<el-table-column label="原价" width="100">
						<template slot-scope="scope">
							{{scope.row.oPrice | priceFormat}}
						</template>
					</el-table-column>
					<el-table-column label="折扣" width="100" :filter-method="filterTag"
						:filters="[{ text: '秒杀', value: '秒杀' }]">
						<template slot-scope="scope">
							<el-tag :type="tagColor(scope.row.discount)" effect="plain"
								v-show="scope.row.discount != 1">
								{{(scope.row.discount*10).toFixed(2)+" 折"}}
							</el-tag>
						</template>
					</el-table-column>
					<el-table-column label="销量" width="100">
						<template slot-scope="scope">
							{{"已售" + scope.row.distance}}
						</template>
					</el-table-column>
					<el-table-column label="操作">
						<template slot-scope="scope">
							<el-button type="primary" size="mini" @click="aggrDetail(scope.row.id,scope.row.name)">查看详情
							</el-button>
							&nbsp;
							<el-popover placement="right" width="165" trigger="click">
								<img
									:src="'http://qr.kegood.com/?m=0&e=L&p=5&url=http://evt.dianping.com/synthesislink/6146.html?id='+scope.row.id">
								<el-button slot="reference" size="mini" type="success">扫二维码</el-button>
							</el-popover>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {

				/* 电脑端 */

				aggrList: [], //团购列表
				listDom: '', //临时列表的 DOM
				detailDom: '', //临时详情的 DOM
				searchTxt: '', //搜索框内容
				keyword: '', //搜索关键词
				page: 0, //当前页码
				loading: true, //加载状态
				cities: [{ //城市列表
					value: 'Shanghai',
					label: '上海',
					text: '上海'
				}, {
					value: 'Beijing',
					label: '北京',
					text: '北京'
				}, {
					value: 'Guangzhou',
					label: '广州',
					text: '广州'

				}, {
					value: 'Shenzhen',
					label: '深圳',
					text: '深圳'
				}, {
					value: 'Wuhan',
					label: '武汉',
					text: '武汉'
				}],
				positionValue: '',
				deviceType: '',

				/* 移动端 */

				finished: false, //是否完成全部加载
				activeNames: ['1'], //折叠面板最大折叠数
				buttonShow: false, //详情窗口显示
				buttonIframe: '', //详情窗口URL
				loginIframe: '', //登录窗口URL
				mobileShopName: '', //详情窗口标题
				showPopover: false, //位置选择窗口
				onlySec: false

			}
		},
		methods: {
			/* ---------------------- 通用方法 ---------------------- */

			/* 检查是否存在 COOKIE */
			checkCookie() {
				var cookies = this.$cookies.get("cy")
				//根据 cookie 识别当前地区
				if (cookies == null) { //设置 cookie 区分地区（默认深圳）
					//console.log("没有检测到cookie，已设置默认cookie");
					this.$cookies.set("cy", "7", "3y")
					this.positionValue = "Shenzhen"
				} else if (cookies == "1") {
					this.positionValue = "Shanghai"
				} else if (cookies == "2") {
					this.positionValue = "Beijing"
				} else if (cookies == "4") {
					this.positionValue = "Guangzhou"
				} else if (cookies == "7") {
					this.positionValue = "Shenzhen"
				} else if (cookies == "16") {
					this.positionValue = "Wuhan"
				}
			},
			/* 客户端匹配 */
			isMobile() {
				let flag = navigator.userAgent.match(
					/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
				)
				return flag;
			},


			/* 请求列表 */
			async getAggrList(page, keyword) {
				const {
					data: res
				} = await this.$http.get(
					'/mapi/tuan/ajax/moreSearchList', {
						params: {
							version: 2, //不明参数
							guidanceParameter: '1_0_3_0', //筛选条件
							keyword: keyword, //关键词
							currentPage: page //当前页
						},
					})
				this.listDom = res //将获取的数据赋予临时 DOM
				this.showAggrList()
				//console.log(res);
			},

			/* 添加列表数组 */
			showAggrList() {
				setTimeout(() => {
					var obj //团购对象

					var id //ID
					var name //名称
					var title //描述
					var price //现价
					var oPrice //原价
					var discount //折扣
					var distance //销量
					var tag //标签

					//遍历团购属性
					for (var i = 0; i < this.$refs.myListDom.querySelectorAll("a").length; i++) {
						tag = ""
						id = this.$refs.myListDom.querySelectorAll("a")[i].href.split("/deal/")[1], //ID
							name = this.$refs.myListDom.querySelectorAll(".name")[i].innerText, //名称
							title = this.$refs.myListDom.querySelectorAll(".titie")[i].innerText, //描述
							price = parseFloat(this.$refs.myListDom.querySelectorAll(".price")[i].innerText), //现价
							oPrice = parseFloat(this.$refs.myListDom.querySelectorAll(".o-price")[i].innerText
								.replace(
									"￥", "")) //原价
						discount = (price / oPrice).toFixed(2), //折扣
							distance = parseInt(this.$refs.myListDom.querySelectorAll(".distance")[i].innerText
								.replace("已售", "")) //销量

						//根据折扣幅度赋予标签
						if (discount <= 0.15 && oPrice >= 50) {
							tag = "秒杀"
						}

						//将团购属性加入到对象中
						if (this.onlySec == true && discount <= 0.15 && oPrice >= 50) {
							// 只看秒杀激活时
							obj = {
								id,
								name,
								title,
								price,
								oPrice,
								discount,
								distance,
								tag
							}
							this.aggrList.push(obj) //将对象加入数组
						} else if (this.onlySec == false) {
							// 只看秒杀未激活时
							obj = {
								id,
								name,
								title,
								price,
								oPrice,
								discount,
								distance,
								tag
							}
							this.aggrList.push(obj) //将对象加入数组
						}
					}
					this.loading = false //结束加载

					if (this.aggrList.length < 10) {
						this.page++
						this.getAggrList(this.page, this.keyword)
						return
					}
					//设定最大加载页数
					if (this.deviceType === 'mobile' && this.page > 65) {
						this.finished = true
						this.$toast.fail('无法显示更多')
						return
					}

					//当查询无结果时
					if (this.$refs.myListDom.querySelectorAll("a").length == 0) {
						if (this.deviceType === 'mobile') {
							//手机端提示
							this.$toast.fail('已全部加载')
						} else {
							//电脑端提示
							this.finished = true
							this.$notify.warning({
								title: '提示',
								message: '已全部加载'
							});
						}
					}
				}, 10);

			},
			/* 标签颜色 */
			tagColor(val) {
				if (val <= 0.15) {
					return 'danger'
				} else if (val <= 0.3) {
					return 'warning'
				} else if (val <= 0.5) {
					return 'success'
				} else if (val <= 0.7) {
					return 'primary'
				}
				return 'primary'
			},
			/* 搜索 */
			search() {
				this.aggrList = [] //清空团购数组
				this.keyword = this.searchTxt //将搜索框内的值赋予关键词
				this.page = 0 //重置当前页码
				this.getAggrList(this.page, this.keyword)
			},

			/* ---------------------- 电脑端方法 ---------------------- */

			/* 表格懒加载 */
			tableListener() {
				setTimeout(() => {
					let that = this
					let dom = that.$refs.myTable.bodyWrapper
					dom.addEventListener("scroll", function() {
						const scrollDistance = dom.scrollHeight - dom.scrollTop - dom.clientHeight;
						//判断是否滚动到底部
						if (scrollDistance <= 0) {
							that.loading = true
							that.page++
							that.getAggrList(that.page, that.keyword)
						}
					})
				}, 500);
			},
			/* 筛选标签 */
			filterTag(value, row) {
				return row.tag === value
			},
			/* 下一页 */
			nextPage() {
				this.loading = true //加载中
				this.aggrList = [] //清空团购数组
				this.page++ //页码+1
				this.getAggrList(this.page, this.keyword)
			},
			/* 上一页 */
			prevPage() {
				if (this.page > 0) { //判断当前是否在第一页
					this.loading = true //加载中
					this.aggrList = [] //清空团购数组
					this.page-- //页码-1
					this.getAggrList(this.page, this.keyword)
				}
			},
			/* 显示详情 */
			aggrDetail(id, name) {
				this.$alert(
					'<iframe width="350" height="600" frameborder="0" src="https://m.dianping.com/tuan/deal/' + id +
					'">/iframe>',
					name, {
						dangerouslyUseHTMLString: true,
						center: true,
						lockScroll: false
					});
			},
			/* 位置切换 */
			positionChange(val) {
				if (this.deviceType === 'pc') {
					var poval = this.positionValue
				} else if (this.deviceType === 'mobile') {
					var mpoval = val.value
				}
				if (poval == 'Shanghai' || mpoval == 'Shanghai') {
					this.$cookies.set("cy", "1", "3y")
					this.$router.go(0)
				} else if (poval == 'Beijing' || mpoval == 'Beijing') {
					this.$cookies.set("cy", "2", "3y")
					this.$router.go(0)
				} else if (poval == 'Guangzhou' || mpoval == 'Guangzhou') {
					this.$cookies.set("cy", "4", "3y")
					this.$router.go(0)
				} else if (poval == 'Shenzhen' || mpoval == 'Shenzhen') {
					this.$cookies.set("cy", "7", "3y")
					this.$router.go(0)
				} else if (poval == 'Wuhan' || mpoval == 'Wuhan') {
					this.$cookies.set("cy", "16", "3y")
					this.$router.go(0)
				}
			},


			/* ---------------------- 移动端方法 ---------------------- */

			/* 下拉加载 */
			onLoad() {
				this.loading = true //加载中
				this.page++ //页码+1
				this.getAggrList(this.page, this.keyword)
			},
			/* 查看详情 */
			mobileDetail(id, title) {
				this.mobileShopName = title
				this.buttonShow = true
				this.buttonIframe = "<iframe src='https://m.dianping.com/tuan/deal/" + id +
					"' height='2800' frameborder='0' scrolling='no'></iframe>"
			},
			/* 快速搜索 */
			quickSearch(keyword) {
				this.aggrList = []
				this.page = 0
				this.keyword = keyword
				this.getAggrList(this.page, keyword)
			},
			/* 切换只看秒杀 */
			changeSec(val) {
				if (val == true) {
					this.$toast('正在查询秒杀 请稍候')
				}
				this.aggrList = []
				this.getAggrList(this.page, this.keyword)
			}
		},
		created() {
			this.checkCookie() //检查是否存在Cookie
			this.getAggrList(this.page) //初始化列表
		},
		mounted() {
			/* 判断用户客户端 */
			if (this.isMobile()) { //手机端
				this.deviceType = 'mobile'
			} else {
				this.deviceType = 'pc' //电脑端
				this.tableListener() //调用懒加载
			}
		},
		filters: {
			//描述过滤器
			titleFormat(titleStr) {
				titleStr = titleStr.replace('，提供免费WiFi', '')
				return titleStr
			},
			//价格过滤器
			priceFormat(priceStr) {
				priceStr = "￥" + priceStr
				return priceStr
			}
		}
	}
</script>

<style>
	.bottomContent {
		text-align: center;
	}

	.quickSearch {
		margin-left: 12px;
	}
</style>
