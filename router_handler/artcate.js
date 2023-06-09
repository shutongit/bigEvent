
const db = require('../db/index')

// 获取文章分类的处理函数
exports.getArticleCates = (req, res) => {

  // 根据分类的状态，获取所有未被删除的分类列表的数据
  // is_delete 为0表示未被删除
  const sql = `SELECT * FROM ev_article_cate WHERE is_delete=0 order by id asc`

  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '获取文章分类数据成功！',
      data: results
    })
  })
}

// 新增文章分类的处理函数
exports.addArticleCates = (req, res) => {

  // 定义查询 分类名称 和 分类别名 是否被占用的SQL语句

  const sql = `SELECT * FROM ev_article_cate WHERE name=? or alias=?`

  db.query(sql, [req.body.name, req.body.alias], (err, results) => {
    if (err) return res.cc(err)

    // 分类名称 和 分类别名 都被占用
    if (results.length == 2) return res.cc('分类名称和别名都被占用，请更换后重试！')
    if (results.length == 1 && results[0].name == req.body.name && results[0].alias === req.body.alias) return res.cc('分类名称和别名都被占用，请更换后重试！')

    // 分类名称 或 分类别名 被占用
    if (results.length == 1 && results[0].name == req.body.name) return res.cc('分类名称被占用，请更换后重试！')
    if (results.length == 1 && results[0].alias == req.body.alias) return res.cc('分类别名被占用，请更换后重试！')

    // TODO: 新增文章分类
    const sql = `INSERT INTO ev_article_cate SET ?`

    db.query(sql, req.body, (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('新增文章分类失败！')
      res.cc('新增文章分类成功！', 0)
    })
  })
}

// 删除文章分类的处理函数
exports.deleteCateById = (req, res) => {
  const sql = `UPDATE ev_article_cate SET is_delete=1 WHERE id=?`
  db.query(sql, req.params.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('文章分类删除失败！')
    res.cc('文章分类删除成功！', 0)
  })
}


// 根据id获取文章分类
exports.getArtCateById = (req, res) => {

  const sql = `SELECT * FROM ev_article_cate WHERE id=?`

  db.query(sql, req.params.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('获取文章分类失败！')
    res.send({
      status: 0,
      message: '获取文章分类成功！',
      data: results[0]
    })
  })
}

// 根据Id更新文章分类
exports.updateArtCateById = (req, res) => {

  // 定义查询 分类名称 和 分类别名 是否被占用的SQL语句

  const sql = `SELECT * FROM ev_article_cate WHERE id != ? AND (name = ? OR alias = ?)`

  db.query(sql, [req.body.id, req.body.name, req.body.alias], (err, results) => {

    if (err) return res.cc(err)

    // 分类名称 和 分类别名 都被占用
    if (results.length == 2) return res.cc('分类名称和别名都被占用，请更换后重试！')
    if (results.length == 1 && results[0].name == req.body.name && results[0].alias === req.body.alias) return res.cc('分类名称和别名都被占用，请更换后重试！')

    // 分类名称 或 分类别名 被占用
    if (results.length == 1 && results[0].name == req.body.name) return res.cc('分类名称被占用，请更换后重试！')
    if (results.length == 1 && results[0].alias == req.body.alias) return res.cc('分类别名被占用，请更换后重试！')

    // TODO: 更新文章分类
    const sql = `UPDATE ev_article_cate SET name=?, alias=? WHERE id=?`
    db.query(sql, [req.body.name, req.body.alias, req.body.id], (err, results) => {
      console.log("results: ", results)
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('文章分类更新失败！')
      res.cc('文章分类更新成功！', 0)
    })

  })

}
