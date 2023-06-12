const db = require('../db/index')

// 新增文章
exports.addArticle = (req, res) => {
  req.body.author_id = req.auth.id
  req.body.pub_date = Date.now()
  const sql = `INSERT INTO ev_articles SET ?`
  db.query(sql, req.body, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('新增文章失败！')
    res.cc('新增文章成功！', 0)
  })
}

// 获取文章列表
exports.getArticles = (req, res) => {
  const sql = `SELECT * FROM ev_articles WHERE is_delete=0 ORDER BY id asc`
  db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '获取文章列表成功！',
      data: results
    })
  })
}


// 根据 Id 删除文章数据
exports.deleteArticleById = (req, res) => {

  const sql = `UPDATE ev_articles SET is_delete=1 WHERE id=?`
  db.query(sql, req.body.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows != 1) return res.cc('删除文章失败！')
    res.cc('删除文章成功', 0)
  })
}

// 根据 Id 获取文章详情
exports.getArticleInfoById = (req, res) => {
  const sql = `SELECT * FROM ev_articles WHERE id=?`
  db.query(sql, req.body.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length != 1) return res.cc('获取文章失败！')
    res.send({
      status: 0,
      message: '获取文章成功',
      data: results[0]
    })
  })
}

// 根据 Id 更新文章信息
exports.updateArticleById = (req, res) => {
  const sql = `UPDATE ev_articles SET title=?, content=?, cover_img=?, is_delete=? WHERE id=?`
  db.query(sql, [req.body.title, req.body.content, req.body.cover_img, req.body.is_delete, req.body.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows != 1) return res.cc('更新文章失败！')
    res.cc('更新文章成功', 0)
  })
}
