<template>
  <div class="pictureManagePage"><a-space>  
  <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>  
  <a-button type="primary" href="/add_picture/batch" target="_blank" ghost>+ 批量创建图片</a-button>  
</a-space>

    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <div class="header-left">
        <h2>图片管理</h2>
        <span class="subtitle">管理所有上传的图片资源</span>
      </div>
      <a-button type="primary" href="/add_picture" target="_blank" class="create-button">
        <template #icon>
          <PlusOutlined />
        </template>
        创建图片
      </a-button>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <a-form layout="inline" :model="searchParams" @finish="doSearch">
        <a-form-item label="关键词" name="searchText">
          <a-input v-model:value="searchParams.searchText" placeholder="从名称和简介搜索" allow-clear class="search-input">
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="类型" name="category">
          <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear class="search-input">
            <template #prefix>
              <TagOutlined />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item label="标签" name="tags">
          <a-select v-model:value="searchParams.tags" mode="tags" placeholder="请输入标签" style="min-width: 180px"
            allow-clear class="search-select">
            <template #suffixIcon>
              <TagsOutlined />
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="审核状态" name="reviewStatus">
          <a-select v-model:value="searchParams.reviewStatus" :options="PIC_REVIEW_STATUS_OPTIONS" placeholder="请输入审核状态"
            style="min-width: 180px" allow-clear />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" class="search-button">
            <template #icon>
              <SearchOutlined />
            </template>
            搜索
          </a-button>
        </a-form-item>
      </a-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-section">
      <a-table :columns="columns" :data-source="dataList" :pagination="pagination" @change="doTableChange"
        :loading="loading" class="custom-table">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'url'">
            <div class="image-cell">
              <a-image :src="record.url" :width="120" class="preview-image" />
            </div>
          </template>
          <template v-else-if="column.dataIndex === 'tags'">
            <a-space wrap>
              <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" class="custom-tag">
                {{ tag }}
              </a-tag>
            </a-space>
          </template>
          <template v-else-if="column.dataIndex === 'picInfo'">
            <div class="info-cell">
              <div class="info-item">
                <span class="info-label">格式：</span>
                <span class="info-value">{{ record.picFormat }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">尺寸：</span>
                <span class="info-value">{{ record.picWidth }} x {{ record.picHeight }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">大小：</span>
                <span class="info-value">{{ (record.picSize / 1024).toFixed(2) }}KB</span>
              </div>
            </div>
          </template>
          <!-- 审核信息 -->
          <template v-if="column.dataIndex === 'reviewMessage'">
            <div>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</div>
            <div>审核信息：{{ record.reviewMessage }}</div>
            <div>审核人：{{ record.reviewerId }}</div>
          </template>

          <template v-else-if="column.dataIndex === 'createTime'">
            <span class="time-cell">{{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'editTime'">
            <span class="time-cell">{{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space wrap>
              <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS" type="link"
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)">
                通过
              </a-button>
              <a-button v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT" type="link" danger
                @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)">
                拒绝
              </a-button>
              <a-button type="link" :href="`/add_picture?id=${record.id}`" target="_blank">编辑
              </a-button>
              <a-popconfirm title="确定要删除这张图片吗?" description="删除后将无法恢复，请谨慎操作" ok-text="确定" cancel-text="取消"
                @confirm="() => handleDelete(record)">
                <a-button type="link" danger>
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>

        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { computed, onMounted, reactive, ref } from 'vue'
import dayjs from 'dayjs'
import {
  PlusOutlined,
  SearchOutlined,
  TagOutlined,
  TagsOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons-vue'
import { doPictureReviewUsingPost, listPictureByPageUsingPost, deletePictureUsingPost } from '@/api/pictureController'
import { PIC_REVIEW_STATUS_ENUM, PIC_REVIEW_STATUS_MAP, PIC_REVIEW_STATUS_OPTIONS } from '@/constants/picture'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '图片',
    dataIndex: 'url',
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'category',
  },
  {
    title: '标签',
    dataIndex: 'tags',
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 80,
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',

  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据  
const dataList = ref([])
const total = ref(0)

// 搜索条件  
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数  
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条`,
  }
})

// 获取数据  
const fetchData = async () => {
  const res = await listPictureByPageUsingPost({
    ...searchParams,
  })
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时请求一次  
onMounted(() => {
  fetchData()
})

// 获取数据  
const doSearch = () => {
  // 重置搜索条件  
  searchParams.current = 1
  fetchData()
}

// 表格变化处理  
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage = reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员操作通过' : '管理员操作拒绝'
  const res = await doPictureReviewUsingPost({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    // 重新获取列表  
    fetchData()
  } else {
    message.error('审核操作失败，' + res.data.message)
  }
}

const handleDelete = async (record: API.PictureVO) => {
  if (!record.id) {
    message.error('图片ID不存在')
    return
  }

  try {
    const res = await deletePictureUsingPost({ id: record.id })

    if (res.data?.code === 0) {
      message.success('删除成功')
      // 重新加载数据
      fetchData()
    } else {
      message.error('删除失败：' + (res.data?.message || '未知错误'))
    }
  } catch (error: any) {
    message.error('删除失败：' + (error.message || '网络错误'))
  }
}

</script>

<style scoped>
.pictureManagePage {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  color: #1a1a1a;
  font-weight: 600;
}

.subtitle {
  color: #666;
  font-size: 14px;
  margin-top: 4px;
  display: block;
}

.create-button {
  height: 40px;
  padding: 0 24px;
  font-size: 15px;
  border-radius: 8px;
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
  border: none;
  transition: all 0.3s;
}

.create-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.search-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-input {
  width: 200px;
  border-radius: 6px;
}

.search-select {
  border-radius: 6px;
}

.search-button {
  border-radius: 6px;
  height: 32px;
  transition: all 0.3s;
}

.search-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.table-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.custom-table {
  margin-top: 16px;
}

.image-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.preview-image {
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-image:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #666;
  font-size: 13px;
}

.info-value {
  color: #1a1a1a;
  font-weight: 500;
}

.time-cell {
  color: #666;
  font-size: 13px;
}

.custom-tag {
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 13px;
  background: #f0f5ff;
  border-color: #d6e4ff;
  color: #1890ff;
}

.action-button {
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.action-button:hover {
  background: #f5f5f5;
  transform: translateY(-1px);
}

/* 表格样式优化 */
:deep(.ant-table) {
  border-radius: 8px;
}

:deep(.ant-table-thead > tr > th) {
  background: #fafafa;
  font-weight: 600;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background: #f0f7ff;
}

/* 分页样式优化 */
:deep(.ant-pagination) {
  margin-top: 24px;
  text-align: right;
}

:deep(.ant-pagination-item) {
  border-radius: 6px;
}

:deep(.ant-pagination-item-active) {
  background: #1890ff;
  border-color: #1890ff;
}

:deep(.ant-pagination-item-active a) {
  color: #fff;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .pictureManagePage {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .search-section {
    padding: 16px;
  }

  .search-input,
  .search-select {
    width: 100%;
  }

  .table-section {
    padding: 16px;
  }
}

/* 动画效果 */
.page-header,
.search-section,
.table-section {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>