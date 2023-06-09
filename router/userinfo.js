
// 导入express
const express = require('express')

// 创建路由对象
const router = express.Router()

const { getUserinfo, updateUserInfo, updatePassword, updateAvatar } = require('../router_handler/userinfo')

const expressJoi = require('@escook/express-joi')
const { update_userinfo_schema, update_password_schema, updata_avatar_schema } = require('../schema/user')


// 获取用户信息的路由
router.get('/userinfo', getUserinfo)

// 更新用户信息的路由
router.post('/userinfo', expressJoi(update_userinfo_schema), updateUserInfo)

// 重置密码的路由
router.post('/updatepwd', expressJoi(update_password_schema), updatePassword)

// 更新用户头像的路由
router.post('/update/avatar', expressJoi(updata_avatar_schema), updateAvatar)

module.exports = router