<template>
    <div class="user-center">
        <a-row :gutter="24">
            <!-- 左侧个人信息卡片 -->
            <a-col :span="8">
                <a-card class="user-card">
                    <div class="user-info">
                        <a-avatar :size="100" :src="userInfo.userAvatar" class="user-avatar" />
                        <h2 class="username">{{ userInfo.userName || '未设置昵称' }}</h2>
                        <p class="user-account">账号：{{ userInfo.userAccount }}</p>
                        <p class="user-role">
                            <a-tag :color="userInfo.userRole === 'admin' ? 'red' : 'blue'">
                                {{ userInfo.userRole === 'admin' ? '管理员' : '普通用户' }}
                            </a-tag>
                        </p>
                    </div>
                </a-card>
            </a-col>

            <!-- 右侧编辑表单 -->
            <a-col :span="16">
                <a-card title="编辑个人资料">
                    <a-form :model="formState" :rules="rules" ref="formRef" @finish="handleSubmit" layout="vertical">
                        <a-form-item label="头像" name="userAvatar">
                            <a-upload v-model:file-list="fileList" :show-upload-list="false"
                                :before-upload="beforeUpload" @change="handleChange">
                                <div class="avatar-uploader">
                                    <img v-if="formState.userAvatar" :src="formState.userAvatar" alt="avatar" />
                                    <div v-else class="avatar-uploader-trigger">
                                        <plus-outlined />
                                        <div style="margin-top: 8px">上传</div>
                                    </div>
                                </div>
                            </a-upload>
                        </a-form-item>

                        <a-form-item label="用户名" name="userName">
                            <a-input v-model:value="formState.userName" placeholder="请输入用户名" />
                        </a-form-item>

                        <a-form-item label="个人简介" name="userProfile">
                            <a-textarea v-model:value="formState.userProfile" placeholder="请输入个人简介" :rows="4" />
                        </a-form-item>

                        <a-form-item>
                            <a-button type="primary" html-type="submit" :loading="loading">
                                保存修改
                            </a-button>
                        </a-form-item>
                    </a-form>
                </a-card>
            </a-col>
        </a-row>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { updateUserUsingPost } from '@/api/userController'
import type { UploadProps } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
const formRef = ref()
const loading = ref(false)
const fileList = ref([])

// 用户信息
const userInfo = reactive({
    ...loginUserStore.loginUser
})

// 表单数据
const formState = reactive({
    userName: userInfo.userName,
    userProfile: userInfo.userProfile,
    userAvatar: userInfo.userAvatar,
})

// 表单验证规则
const rules = {
    userName: [
        { required: true, message: '请输入用户名' },
        { min: 2, max: 20, message: '用户名长度在 2-20 个字符之间' }
    ],
    userProfile: [
        { max: 200, message: '个人简介不能超过 200 个字符' }
    ]
}

// 上传前校验
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片！')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        message.error('图片大小不能超过 2MB！')
    }
    return isJpgOrPng && isLt2M
}

// 处理图片上传
const handleChange: UploadProps['onChange'] = (info) => {
    if (info.file.status === 'uploading') {
        loading.value = true
        return
    }
    if (info.file.status === 'done') {
        // 这里需要根据你的后端接口来处理图片上传
        // 假设上传成功后返回图片URL
        formState.userAvatar = info.file.response.url
        loading.value = false
    }
    if (info.file.status === 'error') {
        message.error('上传失败')
        loading.value = false
    }
}

// 提交表单
const handleSubmit = async () => {
    try {
        loading.value = true
        const res = await updateUserUsingPost({
            ...formState,
            id: userInfo.id
        })
        if (res.data.code === 0) {
            message.success('更新成功')
            // 更新全局状态
            await loginUserStore.fetchLoginUser()
        } else {
            message.error('更新失败：' + res.data.message)
        }
    } catch (error) {
        message.error('更新失败')
    } finally {
        loading.value = false
    }
}

// 页面加载时获取最新用户信息
onMounted(async () => {
    await loginUserStore.fetchLoginUser()
    Object.assign(userInfo, loginUserStore.loginUser)
    Object.assign(formState, {
        userName: userInfo.userName,
        userProfile: userInfo.userProfile,
        userAvatar: userInfo.userAvatar,
    })
})
</script>

<style scoped>
.user-center {
    padding: 24px;
}

.user-card {
    text-align: center;
}

.user-info {
    padding: 20px 0;
}

.user-avatar {
    margin-bottom: 16px;
}

.username {
    margin: 16px 0 8px;
    font-size: 20px;
    font-weight: 500;
}

.user-account {
    color: #666;
    margin-bottom: 8px;
}

.avatar-uploader {
    width: 128px;
    height: 128px;
    border: 1px dashed #d9d9d9;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

.avatar-uploader:hover {
    border-color: #1890ff;
}

.avatar-uploader img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-uploader-trigger {
    color: #999;
}
</style>