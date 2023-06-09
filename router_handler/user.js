// 导入数据库操作模块
const db = require('../db/index')

// 导入加密库
const bcrypt = require('bcryptjs')

// 导入token生成包
const jwt = require('jsonwebtoken')
// 导入配置文件
const config = require("../config")

// 注册用户的处理函数
exports.regUser = (req, res) => {

  // 接收表单数据
  const userInfo = req.body
  // if (!userInfo.username || !userInfo.password) {
  //   return res.cc('用户名或密码不能为空！')
  // }

  const sql = `SELECT * FROM ev_users WHERE username=?`

  db.query(sql, userInfo.username, (err, results) => {
    if (err) {
      return res.cc(err.message || '错误')

    }
    if (results.length > 0) {
      return res.cc('用户名已存在，请使用其他用户名！')
    }

    // 对密码进行加密处理
    userInfo.password = bcrypt.hashSync(userInfo.password, 10)

    // 定义插入新用户的SQL语句
    const sql = `INSERT INTO ev_users set ?`
    db.query(sql, { username: userInfo.username, password: userInfo.password }, (err, results) => {
      if (err) return res.send({ status: 1, message: err.message })
      if (results.affectedRows !== 1) return res.send({ status: 1, message: '注册失败，请稍后重试' })
      res.cc(0, '注册用户成功')
    })

  })
}



// 登录的处理函数
exports.login = (req, res) => {

  // 接收表单数据
  const userInfo = req.body

  // 定义SQL语句
  const sql = `SELECT * FROM ev_users WHERE username=?`

  // 执行SQL语句， 查询用户的数据
  db.query(sql, userInfo.username, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('登录失败！')

    const compareResult = bcrypt.compareSync(userInfo.password, results[0].password)

    if (!compareResult) {
      return res.cc("登录失败")
    }

    const user = { ...results[0], password: '', user_pic: '' }

    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: config.expiresIn
    })
    res.send({ status: 0, message: '登录成功', token: 'Bearer ' + tokenStr })

  })
}