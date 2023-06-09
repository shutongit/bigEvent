
// 导入
const joi = require('joi')
/**
 * string()值必须是字符串
 * alphanum()值只能是包含 a-zA-Z0-9的字符串
 * min(length) 最小长度
 * max(length) 最大长度
 * required() 值是必填项，不能为nudefined
 * pattern(正则表达式) 值必须符合正则表达式的规则
 */

// 用户名的验证规则
const username = joi.string().alphanum().min(1).max(10).required()

const password = joi.string().pattern(/^[\S]{6,12}$/).required()




// 注册和登录表单的验证规则对象
exports.reg_login_schema = {
  // 表示需要对req.body中的数据进行验证
  body: {
    username,
    password
  }
}

const id = joi.number().integer().min(1).required()
const nickname = joi.string().required()
const email = joi.string().email().required()

// 更新用户基本信息
exports.update_userinfo_schema = {
  body: {
    id,
    nickname,
    email
  }
}


// 验证规则对象 - 重置密码
exports.update_password_schema = {
  body: {
    // 使用 password这个规则，验证req.body.oldPwd的值
    oldPwd: password,

    // 使用joi.not(joi.ref('oldPwd')).concat(password) 规则，验证 req.body.newPwd的值
    // 解读： 
    // 1. joi.ref('oldPwd') 表示newPwd的值必须和oldPwd的值保持一致
    // 2. joi.not( joi.ref('oldPwd')) 表示 newPwd的值不能等于oldPwd的值
    // 3. .concat(password) 用于合并 joi.not( joi.ref('oldPwd')) 和 password 这两条验证规则
    newPwd: joi.not(joi.ref('oldPwd')).concat(password)
  }
}


// dataUri()指的是如下格式的字符串数据：
// data:image/png;base64.VE9PTUFOWVNFQTJFVFM
const avatar = joi.string().dataUri().required()
// 头像的验证规则
exports.updata_avatar_schema = {
  body: {
    avatar
  }
}