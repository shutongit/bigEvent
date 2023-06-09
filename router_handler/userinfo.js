
// 导入数据库操作模块
const db = require('../db/index')

// 获取用户信息
exports.getUserinfo = (req, res) => {

  // 定义查询用户信息的SQL语句
  // 注意： 为了防止用户的密码泄漏，需要排除 password 字段
  const sql = `SELECT id, username, nickname, email, user_pic FROM ev_users WHERE id=?`

  // 调用db.query()执行SQL语句
  // 注意：req对象上的auth属性，是Token解析成功，express-jwt中间件帮我们挂载上去的
  db.query(sql, req.auth.id, (err, results) => {
    if (err) return res.cc(err.message)
    if (results.length != 1) {
      return res.cc('获取用户信息失败')
    }
    res.send({
      status: 0,
      message: '获取用户信息成功',
      data: results[0]
    })
  })
}


// 更新用户信息
exports.updateUserInfo = (req, res) => {

  const sql = `UPDATE ev_users SET ? WHERE id=?`
  db.query(sql, [req.body, req.body.id], (err, results) => {
    if (err) return res.cc(err.message)
    if (results.affectedRows !== 1) return res.cc('修改用户信息失败！')
    return res.cc('修改用户基本信息成功', 0)
  })
}

// 重置密码
exports.updatePassword = (req, res) => {

  // 根据id 查询用户信息
  const sql = `SELECT * FROM my_db_01.ev_users WHERE id=?`

  //  根据id查询用户信息的SQL语句
  db.query(sql, req.auth.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('用户不存在！')

    // 判断用户输入的旧密码是否正确
    const bcrypt = require('bcryptjs')

    // 判断提交的旧密码是否正确
    const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
    if (!compareResult) return res.cc('原密码错误!')


    // 定义更新用户密码的SQL语句
    const sql = `UPDATE ev_users set password=? WHERE id=?`

    // 对新密码进行 bcrypt 加密处理
    const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

    // 执行SQL语句，根据id更新用户的密码
    db.query(sql, [newPwd, req.auth.id], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新密码失败！')
      res.cc('密码更新成功！', 0)
    })
  })

}

// 更新用户头像的处理函数
exports.updateAvatar = (req, res) => {

  const sql = `UPDATE ev_users SET user_pic=? WHERE id=?`
  db.query(sql, [req.body.avatar, req.auth.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows !== 1) return res.cc('更新头像失败！')

    return res.cc('更新头像成功', 0)
  })
}