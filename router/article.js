
const express = require('express')

const router = express.Router()

// 导入文章的路由处理函数模块
const { addArticle, getArticles, deleteArticleById, getArticleInfoById, updateArticleById } = require('../router_handler/article')

// 导入解析器
const multer = require('multer')
// 配置文件保存的路径
const upload = multer({ dest: 'uploads/cover/' })

// 导入校验规则
const { add_article_schema, delete_article_schema, info_article_schema, update_article_schema } = require('../schema/article')
// 导入数据验证中间件
const expressJoi = require('@escook/express-joi')


// 发布新文章 ; 
router.post('/add', upload.single('cover_img'), expressJoi(add_article_schema), addArticle)

// 获取文章列表
router.get('/list', getArticles)

// 根据 Id 删除文章数据
router.post('/delete/article', expressJoi(delete_article_schema), deleteArticleById)

// 根据 Id 获取文章详情
router.post('/info/article', expressJoi(info_article_schema), getArticleInfoById)

// 根据 Id 更新文章信息
router.post('/update/article', upload.single('cover_img'), expressJoi(update_article_schema), updateArticleById)

module.exports = router