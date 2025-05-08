<template>
    <div class="picture-detail">
        <!-- 顶部导航区 -->
        <div class="page-header">
            <div class="header-left">
                <h2>{{ picture?.name || '未命名图片' }}</h2>
                <div class="breadcrumb">
                    <a-breadcrumb>
                        <a-breadcrumb-item>
                            <router-link to="/">首页</router-link>
                        </a-breadcrumb-item>
                        <a-breadcrumb-item>图片详情</a-breadcrumb-item>
                    </a-breadcrumb>
                </div>
            </div>
            <!-- 操作按钮区 -->
            <div class="header-actions" v-if="canEdit">
                <a-space>
                    <a-button type="primary" @click="doDownload">
                免费下载
                <template #icon>
                  <DownloadOutlined />
                </template>
              </a-button>
                    <a-button type="primary" @click="doEdit">
                        <template #icon>
                            <EditOutlined />
                        </template>
                        编辑
                    </a-button>
                    <a-popconfirm title="确定要删除这张图片吗？" ok-text="确定" cancel-text="取消" @confirm="doDelete">
                        <a-button danger>
                            <template #icon>
                                <DeleteOutlined />
                            </template>
                            删除
                        </a-button>
                    </a-popconfirm>
                </a-space>
            </div>
        </div>

        <!-- 主要内容区 -->
        <div class="main-content">
            <a-row :gutter="[24, 24]">
                <!-- 左侧图片展示区 -->
                <a-col :xs="24" :md="16" :xl="18">
                    <a-card :loading="loading" :bordered="false" class="image-card">
                        <div class="image-wrapper">
                            <div class="image-container" v-if="picture?.url">
                                <a-image :src="picture.url" :preview="{
                                    src: picture.url,
                                    mask: '点击查看大图'
                                }" class="preview-image" />
                            </div>
                            <div v-else class="empty-image">
                                <PictureOutlined />
                                <span>暂无图片</span>
                            </div>
                        </div>
                    </a-card>
                </a-col>

                <!-- 右侧信息展示区 -->
                <a-col :xs="24" :md="8" :xl="6">
                    <a-card :loading="loading" :bordered="false" class="info-card">
                        <!-- 作者信息 -->
                        <div class="author-section">
                            <a-avatar :size="64" :src="picture?.user?.userAvatar" class="author-avatar" />
                            <div class="author-info">
                                <div class="author-name">{{ picture?.user?.userName || '未知用户' }}</div>
                                <div class="upload-time">上传于 {{ formatTime(picture?.createTime) }}</div>
                            </div>
                        </div>

                        <a-divider />

                        <!-- 图片信息 -->
                        <div class="info-section">
                            <h3 class="section-title">基本信息</h3>
                            <a-descriptions :column="1" size="small">
                                <a-descriptions-item label="分类">
                                    <a-tag color="blue">{{ picture?.category || '默认' }}</a-tag>
                                </a-descriptions-item>
                                <a-descriptions-item label="标签">
                                    <div class="tags-wrapper">
                                        <a-tag v-for="tag in picture?.tags" :key="tag" color="green">
                                            {{ tag }}
                                        </a-tag>
                                    </div>
                                </a-descriptions-item>
                                <a-descriptions-item label="简介">
                                    <div class="description-text">
                                        {{ picture?.introduction || '暂无简介' }}
                                    </div>
                                </a-descriptions-item>
                            </a-descriptions>

                            <h3 class="section-title">图片参数</h3>
                            <div class="image-specs">
                                <div class="spec-item">
                                    <div class="spec-label">格式</div>
                                    <div class="spec-value">{{ picture?.picFormat || '-' }}</div>
                                </div>
                                <div class="spec-item">
                                    <div class="spec-label">尺寸</div>
                                    <div class="spec-value">{{ picture?.picWidth || '-' }} × {{ picture?.picHeight ||
                                        '-' }}
                                    </div>
                                </div>
                                <div class="spec-item">
                                    <div class="spec-label">大小</div>
                                    <div class="spec-value">{{ formatSize(picture?.picSize) }}</div>
                                </div>
                            </div>
                        </div>
                    </a-card>
                </a-col>
            </a-row>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
    EditOutlined,
    DeleteOutlined,
    PictureOutlined
} from '@ant-design/icons-vue'
import { getPictureVoByIdUsingGet, deletePictureUsingPost } from '@/api/pictureController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import dayjs from 'dayjs'
import { downloadImage } from '@/utils'

const props = defineProps<{ id: string | number }>()
const router = useRouter()
const loginUserStore = useLoginUserStore()
const picture = ref<any>(null)
const loading = ref(false)

// 格式化时间
const formatTime = (time?: string) => {
    if (!time) return '-'
    return dayjs(time).format('YYYY-MM-DD HH:mm')
}

// 格式化文件大小
const formatSize = (size?: number) => {
    if (!size) return '未知'
    if (size < 1024) return size + ' B'
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
    return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

// 是否可编辑
const canEdit = computed(() => {
    const loginUser = loginUserStore.loginUser
    if (!loginUser?.id) return false
    const user = picture.value?.user || {}
    return loginUser.id === user.id || loginUser.userRole === 'admin'
})

// 获取图片详情
const fetchPictureDetail = async () => {
    if (!props.id) {
        message.error('未获取到图片ID')
        return
    }
    loading.value = true
    try {
        const res = await getPictureVoByIdUsingGet({ id: props.id })
        if (res.data?.code === 0 && res.data.data) {
            picture.value = res.data.data
        } else {
            message.error('获取图片详情失败，' + (res.data?.message || '未知错误'))
        }
    } catch (e: any) {
        message.error('获取图片详情失败：' + (e?.message || '网络异常'))
    } finally {
        loading.value = false
    }
}

// 编辑图片
const doEdit = () => {
    if (picture.value?.id) {
        router.push(`/add_picture?id=${picture.value.id}`)
    }
}

// 删除图片
const doDelete = async () => {
    const id = picture.value?.id
    if (!id) return
    try {
        const res = await deletePictureUsingPost({ id })
        if (res.data?.code === 0) {
            message.success('删除成功')
            router.push('/')
        } else {
            message.error('删除失败：' + (res.data?.message || '未知错误'))
        }
    } catch (error: any) {
        message.error('删除失败：' + (error?.message || '网络异常'))
    }
}

onMounted(() => {
    fetchPictureDetail()
})

// 处理下载  
const doDownload = () => {
  downloadImage(picture.value.url)
}
</script>

<style scoped>
.picture-detail {
    padding: 24px;
    min-height: 100vh;
    background: #f5f7fa;
}

/* 顶部样式 */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding: 16px 24px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
}

.header-left h2 {
    margin: 0 0 8px;
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
}

.breadcrumb {
    color: #8c8c8c;
}

/* 卡片样式 */
.image-card,
.info-card {
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}

.image-card:hover,
.info-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 图片容器样式 */
.image-wrapper {
    background: #fafafa;
    border-radius: 4px;
    overflow: hidden;
}

.image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400px;
    background: white;
}

.preview-image {
    max-height: 600px;
    width: 100%;
    object-fit: contain;
}

.empty-image {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #bfbfbf;
}

.empty-image :deep(.anticon) {
    font-size: 48px;
    margin-bottom: 16px;
}

/* 作者区域样式 */
.author-section {
    display: flex;
    align-items: center;
    padding: 16px 0;
}

.author-avatar {
    margin-right: 16px;
    border: 2px solid #f0f0f0;
}

.author-info {
    flex: 1;
}

.author-name {
    font-size: 18px;
    font-weight: 500;
    color: #1a1a1a;
    margin-bottom: 4px;
}

.upload-time {
    color: #8c8c8c;
    font-size: 14px;
}

/* 信息区域样式 */
.section-title {
    font-size: 16px;
    font-weight: 500;
    color: #1a1a1a;
    margin: 24px 0 16px;
}

.tags-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.description-text {
    color: #595959;
    line-height: 1.6;
    white-space: pre-wrap;
}

/* 图片参数样式 */
.image-specs {
    background: #f5f7fa;
    border-radius: 4px;
    padding: 16px;
}

.spec-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.spec-item:last-child {
    margin-bottom: 0;
}

.spec-label {
    color: #8c8c8c;
}

.spec-value {
    color: #262626;
    font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 768px) {
    .picture-detail {
        padding: 16px;
    }

    .page-header {
        flex-direction: column;
        gap: 16px;
    }

    .header-actions {
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
