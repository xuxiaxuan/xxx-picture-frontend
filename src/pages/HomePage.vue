<template>
  <div class="homePage">
    <!-- 顶部搜索区域 -->
    <div class="hero-section">
      <div class="search-container">
        <h1 class="welcome-text">探索精彩图片世界</h1>
        <div class="search-bar">
          <a-input-search placeholder="从海量图片中搜索" v-model:value="searchParams.searchText" enter-button="搜索" size="large"
            @search="doSearch">
            <template #prefix>
              <SearchOutlined class="search-icon" />
            </template>
          </a-input-search>
        </div>
      </div>
    </div>

    <!-- 分类 + 标签 -->
    <div class="filter-section">
      <a-tabs v-model:activeKey="selectedCategory" @change="doSearch">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :key="category" :tab="category" />
      </a-tabs>

      <div class="tag-bar">
        <span class="tag-label">标签：</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag v-for="(tag, index) in tagList" :key="tag" v-model:checked="selectedTagList[index]"
            @change="doSearch" class="custom-tag">
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <!-- 图片列表 -->
    <a-list :grid="{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }" :data-source="dataList"
      :pagination="pagination" :loading="loading">
      <template #renderItem="{ item: picture }">
        <a-list-item>
          <a-card hoverable class="picture-card" @click="doClickPicture(picture)">
            <template #cover>
              <div class="picture-cover">
                <img :alt="picture.name" :src="picture.url" loading="lazy" />
                <div class="picture-overlay">
                  <div class="picture-info">
                    <p class="picture-intro">{{ picture.introduction || '暂无简介' }}</p>
                    <div class="picture-meta">
                      <a-avatar :size="28" :src="picture.user?.userAvatar" />
                      <span class="username">{{ picture.user?.userName || '未知用户' }}</span>
                      <span class="upload-time">{{ dayjs(picture.createTime).fromNow() }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <a-card-meta :title="picture.name">
              <template #description>
                <div class="picture-tags">
                  <a-tag color="green" v-if="picture.category" class="category-tag">
                    {{ picture.category }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag" class="tag-item">
                    {{ tag }}
                  </a-tag>
                </div>
              </template>
            </a-card-meta>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { SearchOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { listPictureTagCategoryUsingGet, listPictureVoByPageUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// 配置 dayjs 相对时间插件
dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

// 数据  
const dataList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索条件  
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数  
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    // 切换页号时，会修改搜索参数并获取数据  
    onChange: (page, pageSize) => {
      searchParams.current = page
      searchParams.pageSize = pageSize
      fetchData()
    },
  }
})

// 获取数据  
const fetchData = async () => {
  loading.value = true
  // 转换搜索参数  
  const params = {
    ...searchParams,
    tags: [],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList.value[index])
    }
  })
  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}


// 页面加载时请求一次  
onMounted(() => {
  fetchData()
})

const doSearch = () => {
  // 重置搜索条件  
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<string[]>([])
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>([])
const selectedTagList = ref<string[]>([])

// 获取标签和分类选项  
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式  
    categoryList.value = res.data.data.categoryList ?? []
    tagList.value = res.data.data.tagList ?? []
  } else {
    message.error('加载分类标签失败，' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const router = useRouter()
// 跳转至图片详情  
const doClickPicture = (picture) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

</script>

<style scoped>
.homePage {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 60px 24px;
  margin-bottom: 24px;
  text-align: center;
  color: white;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
}

.welcome-text {
  font-size: 2.5em;
  margin-bottom: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-bar {
  max-width: 600px;
  margin: 0 auto;
}

.search-bar :deep(.ant-input-search) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-bar :deep(.ant-input) {
  height: 48px;
  border-radius: 24px 0 0 24px;
  border: none;
  padding-left: 24px;
  font-size: 16px;
}

.search-bar :deep(.ant-input-search-button) {
  height: 48px;
  border-radius: 0 24px 24px 0;
  border: none;
  padding: 0 32px;
  font-size: 16px;
  background: #1890ff;
}

.search-icon {
  color: #bfbfbf;
  font-size: 18px;
}

.filter-section {
  margin: 0 24px 24px;
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.tag-bar {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.tag-label {
  color: #666;
  margin-right: 12px;
  font-weight: 500;
}

.custom-tag {
  padding: 4px 12px;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.custom-tag:hover {
  transform: translateY(-2px);
}

.picture-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: none;
}

.picture-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.picture-cover {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.picture-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.picture-card:hover .picture-cover img {
  transform: scale(1.08);
}

.picture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.2));
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

.picture-card:hover .picture-overlay {
  opacity: 1;
}

.picture-info {
  color: #fff;
  width: 100%;
}

.picture-intro {
  margin: 0 0 12px;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.9;
}

.picture-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.upload-time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-left: auto;
}

.picture-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.category-tag {
  font-weight: 500;
}

.tag-item {
  margin: 0;
  background: #f5f5f5;
  border: none;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .hero-section {
    padding: 40px 16px;
  }

  .welcome-text {
    font-size: 2em;
  }

  .picture-cover {
    height: 240px;
  }

  .picture-overlay {
    opacity: 1;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5));
  }

  .filter-section {
    margin: 0 16px 16px;
    padding: 16px;
  }
}

/* 加载动画 */
:deep(.ant-spin-container) {
  min-height: 400px;
  padding: 0 24px;
}

/* 分页样式优化 */
:deep(.ant-pagination) {
  margin: 32px 0;
  text-align: center;
}

:deep(.ant-pagination-item) {
  border-radius: 8px;
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;
  border-color: #1890ff;
}

:deep(.ant-pagination-item-active a) {
  color: #fff;
}

/* 标签页样式优化 */
:deep(.ant-tabs-tab) {
  padding: 12px 24px;
  font-size: 15px;
}

:deep(.ant-tabs-tab-active) {
  font-weight: 500;
}

:deep(.ant-tabs-ink-bar) {
  height: 3px;
  border-radius: 3px;
}
</style>
