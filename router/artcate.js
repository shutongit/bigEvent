
// 导入express
const express = require('express')

// 初始化路由对象
const router = express.Router()

// 导入文章分类路由函数处理模块
const { getArticleCates, addArticleCates, deleteCateById, getArtCateById, updateArtCateById } = require('../router_handler/artcate')

// 导入校验规则
const { add_cate_schema, delete_cate_schema, get_cate_schema, update_cate_schema } = require('../schema/artcate')
// 导入数据验证中间件
const expressJoi = require('@escook/express-joi')

// 获取文章列表数据
router.get('/cates', getArticleCates)

// 新增文章分类
router.post('/addcates', expressJoi(add_cate_schema), addArticleCates)


// 删除文章分类
router.get('/deletecate/:id', expressJoi(delete_cate_schema), deleteCateById)

// 根据id获取文章分类
router.get('/cates/:id', expressJoi(get_cate_schema), getArtCateById)

// 根据Id更新文章分类
router.post('/updatecate', expressJoi(update_cate_schema), updateArtCateById)

module.exports = router