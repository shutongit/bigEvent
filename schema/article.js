
// 导入数据校验模块
const joi = require('joi')

// 标题
const title = joi.string().required()

// 内容
const content = joi.string().min(1).max(100).required()

//  所属分类
const cate_id = joi.number().required()

// 发布状态： 0：草稿；1 发布
const state = joi.number().required()

const cover_img = joi.any()

const pub_date = joi.string()

const is_delete = joi.number()

const author_id = joi.number()

// 较验规则 -- 添加文章
exports.add_article_schema = {
  body: {
    title,
    content,
    cate_id,
    state,
    cover_img,
    pub_date,
    is_delete,
    author_id
  }
}


const id = joi.number().required()
// 较验规则 -- 删除文章
exports.delete_article_schema = {
  body: {
    id
  }
}

// 较验规则 -- 根据id获取文章信息
exports.info_article_schema = {
  body: {
    id
  }
}

// 较验规则 -- 根据id更新文章信息
exports.update_article_schema = {
  body: {
    id,
    cover_img,
    content,
    title,
    is_delete
  }
}