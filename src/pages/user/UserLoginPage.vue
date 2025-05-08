<template>
  <div id="userLoginPage">
    <div class="login-container">
      <div class="login-header">
        <h2 class="title">小轩云图库</h2>
        <div class="desc">智能协同云图库</div>
      </div>

      <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit" class="login-form">
        <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
          <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>

        <a-form-item name="userPassword" :rules="[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码不能小于 6 位' },
        ]">
          <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>

        <div class="tips">
          没有账号？
          <RouterLink to="/user/register" class="register-link">去注册</RouterLink>
        </div>

        <a-form-item>
          <a-button type="primary" html-type="submit" class="login-button" size="large">
            登录
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import { useRouter } from "vue-router"
import { useLoginUserStore } from "../../stores/useLoginUserStore"
import { userLoginUsingPost } from "../../api/userController"
import { message } from "ant-design-vue"
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const formState = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
})

const router = useRouter()
const loginUserStore = useLoginUserStore()

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const res = await userLoginUsingPost(values)
  // 登录成功，把登录态保存到全局状态中
  if (res.data.code === 0 && res.data.data) {
    await loginUserStore.fetchLoginUser()
    message.success('登录成功')
    router.push({
      path: '/',
      replace: true,
    })
  } else {
    message.error('登录失败，' + res.data.message)
  }
}

</script>

<style scoped>
#userLoginPage {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.login-container:hover {
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.title {
  font-size: 28px;
  color: #1a1a1a;
  margin-bottom: 8px;
  font-weight: 600;
}

.desc {
  color: #666;
  font-size: 16px;
}

.login-form {
  margin-top: 24px;
}

.login-form :deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}

.login-form :deep(.ant-input-affix-wrapper:hover) {
  border-color: #1890ff;
}

.login-button {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  margin-top: 8px;
  background: linear-gradient(90deg, #1890ff 0%, #096dd9 100%);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.tips {
  margin: 16px 0;
  color: #666;
  font-size: 14px;
  text-align: right;
}

.register-link {
  color: #1890ff;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-link:hover {
  color: #096dd9;
}

/* 添加响应式设计 */
@media (max-width: 480px) {
  .login-container {
    margin: 20px;
    padding: 24px;
  }

  .title {
    font-size: 24px;
  }

  .desc {
    font-size: 14px;
  }
}
</style>
