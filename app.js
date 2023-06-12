const express = require('express')
// 创建服务器实力对象
const app = express()

// 中间件
const cors = require('cors')
// 将cors注册为全局中间件
app.use(cors())

// 配置解析表单数据的中间件，注意：这个只能解析 application/x-www-form-urlencoded 格式的数据
app.use(express.urlencoded({ extended: false }))

// 全局中间件 一定要在所有路由之前
// 响应数据的中间件
app.use((req, res, next) => {
  res.cc = (err, status = 1) => {
    res.send({
      // 状态
      status,
      // 状态描述，判断err是错误对象还是字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

// 解析Token的全局中间件
const { expressjwt: jwt } = require('express-jwt')
const config = require('./config')
app.use(jwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({ path: [/^\/api\//] }))


// 用户路由
const userRouter = require('./router/user')
app.use('/api', userRouter)

// 导入并使用用户信息的路由模块
const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

// 导入并使用文章分类的路由模块
const artCateRouter = require('./router/artcate')
app.use('/my/article', artCateRouter)

// 导入并使用文章的路由模块
const articleRouter = require('./router/article')
app.use('/my/article', articleRouter)


// 定义错误级别的中间件
const joi = require('joi')
app.use((err, req, res, next) => {
  // 验证失败导致的错误
  if (err instanceof joi.ValidationError) return res.cc(err)

  // 身份认证失败后的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')

  // 未知的错误
  res.cc(err)
})


// 启动服务
app.listen(3007, '192.168.30.13', () => {
  console.log('api server running at: 192.168.30.13:3007')
})