Headline

> 大事件后台API项目 

# 1. 初始化

## 1.1 创建项目

1. 新建 api_server文件夹作为项目根目录， 并在根目录下执行如下命令

   ```bash
   npm init -y
   ```

2. 运行如下命令安装express网络框架

   ```bash
   npm i express
   ```

3. 在项目中新建app.js作为整个项目的入口文件， 并初始化

   ```js
   const express = require('express')
   
   const app = express()
   
   app.listen(3007, () => {
     console.log('api server running at: http://127.0.0.1:3007')
   })
   ```




## 1.2 配置跨域

1. 运行如下命令，安装 `cors`中间件

   ```bash
   npm i cors@2.8.5
   ```

2. 在`app.js`中导入并配置`cors`中间件：

   ```bash
   const cors = require('cors')
   
   app.use(cors())
   ```



## 1.3 配置解析表单数据的中间件

1. 通过如下代码，配置分析```application/x-www-form-urlencoded``` 格式的表单数据的中间件：

```js
app.use(express.urlencoded({extended: false}))
```



## 1.4 初始化路由相关的文件夹

1. 在项目根目录中，新建`router`文件夹，用来存放所有的`路由`模块

>  路由模块中，只存放客户端的请求与处理函数之间的映射关系

2. 在项目根目录中，新建`router_handler`文件夹，用来存放所有的`路由处理函数模块`

> 路由处理函数模块中，专门负责存放每个路由对应的处理函数



## 1.5 初始化用户路由模块

1. 在`router`文件夹中，新建`user.js`文件，作为用户的路由模块，并初始化代码如下

```js
const express = require('express')

// 创建路由
const router = express.Router()

// 注册新用户
router.post('/reguser', (req, res) => {
	res.send('reguser OK')
})

// 登录
router.post('/login', (req, res) => {
	res.send('login OK')
})

// 将路由对象共享出去
moudle.exports = router
```

2. 在`app.js`中，导入并使用`用户路由模块`:

```js
// 导入并注册用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)
```



## 1.6 抽离用户路由模块中的处理函数

> 目的：为了保证 `路由模块` 的纯粹性，所有的 `路由处理函数`，必须抽离到对应的 `路由处理函数模块` 中

1. 在 `/router_handler/user.js` 中，使用 `exports` 对象，分别向外共享如下两个 `路由处理函数`：

```js
// 注册用户的处理函数
exports.regUser = (req, res) => {
  res.send('reguser OK')
}

// 登录的处理函数
exports.login = (req, res) => {
  res.send('login OK')
}
```

2. 将 `/router/user.js`中的代码修改如下结构：

```js
const express = require('express')
const {regUser, login}  = require('../router_handler/user')

// 创建路由
const router = express.Router()

// 注册新用户
router.post('/reguser', regUser)

// 登录
router.post("/login", login)


module.exports = router
```







# 2. 登录注册



## 2.1 新建ev_users表

1. 在 `my_db_01` 数据库中，新建`ev_users` 表如下：

<img src="/Users/shutong/Documents/文档/TyporaImage/image-20230602134608561.png" alt="image-20230602134608561" style="zoom:50%;" />



## 2.2 安装并配置mysql模块

> 在API接口项目中，需要安装并配置 `mysql` 这个第三方模块，来链接和操作MySQL数据库

1. 运行如下命令， 安装 `mysql` 模块：

```bash
npm i mysql
```

2. 在项目根目录中新建 `/db/index.js` 文件，在此自定义模块中创建数据库的连接对象：

```js
// 导入mysql模块
const mysql = require('mysql')

// 创建数据库连接对象
const db = mysql.createPool({
  hots: '127.0.0.1',
  user: 'root',
  password: 'admin123',
  database: 'my_db_01',
})

// 向外共享DB数据库连接对象
module.exports = db

```





## 2.3 注册

### 2.3.0 实现步骤

1. 检测表单数据是否合法
2. 检测用户名是否被占用
3. 对密码进行加密处理
4. 插入新用户

### 2.3.1 检测表单数据是否合法

```js
	// 接收表单数据
  const userInfo = req.body
  // 判断用户名和密码是否为空
  if (!userInfo.username || !userInfo.password) {
    return res.send({
      status: 1,
      message: '用户名或密码不能为空！'
    })
  }
```



### 2.3.2 检测用户名是否被占用

1. 导入数据库操作模块：

```js
const db = require('../db/index')
```

2. 定义SQL语句

```js
const sql = `select * from ev_users where username=?`
```

3. 执行SQL语句并根据结果判断是否被占用

```js
db.query(sql, [userInfo.username], (err, results) => {
  // 执行SQL语句失败
  if (err) {
    return res.send({status: 1, message: err.message||'错误'})
  }
  
  // 用户名被占用
  if (results.length > 0) {
    return res.send({status: 1, message: '用户名已存在，请更换其他用户名！'})
  }
  // TODO: 用户名可用，其他流程。。。
  
})
```



### 2.3.3 对密码进行加密处理

> 为了保证密码的安全性，不建议在数据库以 `明文`的形式保存用户密码， 推荐进行 `加密存储`

在当前项目中，使用 `bcryptjs` 对用户密码进行加密，优点：

- 加密之后的密码，**无法被逆向破解**
- 同一明文密码多次加密，得到的**加密结果各不相同**， 保证了安全性



1. 运行如下命令：

```bash
npm i bcryptjs
```

2. 在`/router_handler/user.js` 中导入 `bcryptjs`

```js
const bcrypt = require('bcryptjs')
```

3. 在注册用户的处理函数中，确认用户名可用之后，调用`bcrypt.hashSync(明文密码，随机盐的长度)`方法，对用户密码进行加密处理：

```js
userInfo.password = bcrypt.hashSync(userInfo.password, 10)
```



### 2.3.4 插入新用户

1. 定义插入用户的SQL语句：

```js
const sql = `INSERT INTO ev_users set ?`
```

2. 调用 `db.query()` 执行SQL语句，插入新用户：

```js
db.query(sql, {username: userInfo.username, password: userInfo.password}, (err, results) => {
  if (err) return res.send({status: 1, message: err.message})
  if (results.affectedRows !== 1) {
    return res.send({status: 1, message: '注册用户失败，请稍后重试！'})
  }
  // 注册成功
  res.send({status: 0, message: '注册成功！'})
})
```



## 2.4 优化res.send()代码

> 在处理函数中，需要多次调用 `res.send()`像客户端响应`处理失败`的结果，为了简化代码，可以手动封装一个`res.cc()`函数

1. 在`app.js`中，所有的路由之前，声明一个全局中间件，为res对象挂载一个`res.cc()`函数

```js
// 响应数据的中间件
app.use((req, res, next) => {
  res.cc = (err, status = 1) {
    res.send({
      // 状态
      status,
      // 状态描述，判断err是错误对象还是字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})
```

2. 调用 `res.cc(状态，描述)`

```js
// 状态为1时可不传
res.cc('用户名已存在，请使用其他用户名！') 

// 其他状态需要传如
res.cc(0, '注册用户成功')

```



## 2.5 优化表单数据验证

> 表单验证的原则：前端验证为辅，后端验证为主，后端**永远不要相信**前端提交过来的**任何内容**

在实际开发中，前后端都需要对表单的数据进行合法性的验证，而目，后端做为教据合法性验证的最后一个关口，在拦数非法数据方面，起到了至关重要的作用。

单纯的使用` if...else...`的形式对数据合法性进行验证，效率低下、出错率高、维护性差，因此，推荐使用**第三方数据验证模块**，来降低出错率、提高验证的效率与可维护性，**让后端程序员把更多的精力放在核心业务逻辑的处理上**。



1. 安装 `joi` 包，为表单中携带的每个数据项，定义验证规则：

```bash
npm i joi
```

2. 安装 `@escook/express-joi` 中间件，来实现自动对表单数据进行验证的功能:

```bash
npm i @escook/express-joi
```

3. 新建` /schema/user.js` 用户信息验证规则模块，并初始化代码如下:

```js

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

```



4. 修改`/router/user.js`中的代码如下：

```js
const express = require('express')
// 创建路由
const router = express.Router()



// 1. 导入验证表单数据的中间件
const expressJoi = require('@escook/express-joi')

// 2. 导入需要的验证规则对象
const { reg_login_schema } = require('../schema/user')


// 导入路由处理函数对应的模块方法
const { regUser, login } = require('../router_handler/user')

// 注册新用户
// 3，在注册新用户的路由中，声明局部中间件，对当前请求中携带的数据进行验证
// 3.1 数据验证通过后，会把这次请求流转给后面的路由处理团数
// 3.2 数据验证失败后，终止后续代码的执行，并抛出一个全局的 Error 错误，进入全局错误级别中间件中进行处理
router.post('/reguser', expressJoi(reg_login_schema), regUser)

// 登录
router.post("/login", login)


module.exports = router
```



5. 在 app.js 的全局错误级别中间件中，捕获验证失败的错误，并把验证失败的结果响应给客户端:
   ```js 
   const joi = require('joi')
   // 错误中间件
   app.use(function (err, req, res, next){
   // 数据验证失败
   if (err instanceof joi.ValidationError) return res.cc(err)
     // 未知错误
   	res.cc(err)
   })
   ```

   



## 2.6 登录

###  2.6.0 实现步骤

1. 检测表单数据是否合法
2. 根据用户名查询用户的数据
3. 判断用户输入的套码是否正确
4. 生成 JWT的 Token 字符串

###  2.6.1检测登录表单的数据是否合法

1. 将` /router/user.js` 中 `登录` 的路由代码修改如下:
   ```js
   // 登录的路由
   router.post( /login',expressJoi(reg_login_schema)，login)
   ```



###  2.6.2 根据用户名查询用户的数据

1. 接收表单数据

```js
const userInfo = req.body
```

2. 定义SQL语句

```js
const sql = `SELECT * FROM ev_users WHERE username ?`
```

3. 执行SQL语句， 查询用户的数据

```javascript
	db.query(sql, userInfo.username, (err, results) => {
    if (err) return res.css(err)
    if (results.length !== 1) return res.cc('登录失败！')
    // TODO: 判断密码
  })
```



### 2.6.3 判断用户输入的密码是否正确

> 核心实现思路：调用 `bcrypt.compareSync(用户提交的密码， 数据库中的密码)` 方法比较密码是否一致

具体代码如下：

```js
const compareResult = bcrypt.compareSync(userInfo.password, result[0].password)
if (!compareResult) {
  return res.cc(登录失败)
}
// TODO: 生成token字符串

```



### 2.6.4 生成JWT的Token字符串

> 核心注意点：在生成 Token 字符串的时候，一定要剔除 **密码**和**头像**的值

1. 通过ES6的高级语法，快速剔除 `密码`和`头像`的值

```js
const user = {...results[0], password: '', user_pic: ''}
```

2. 运行如下命令，安装生成Token字符串的包：

```bash
npm install jsonwebtoken
```

3. 在`/router_handler/user.js`模块的头部区域，导入 `jsonwebtoken`包：

```js
const jwt = require('jsonwebtoken')
```

4. 创建 `config.js`文件，并向外共享 **加密** 和 **还原** Token的 `jwtSecretKey`字符串：

```js
module.exports = {
  jwtSecretKey: 'jljsafuofan@kjf&1%lli'
}
```

5. 将用户信息对象加密成 Token字符串：

```js
// 导入配置文件
const config = require('../config')

// 生成 token字符串
const tokenStr = jwt.sign(user,config.jwtSecretKey, {
  expiresIn: '10h', //token的有效期为 10 个小时
})
```

6. 将生成的Token字符串响应给客户端：

```js
res.send({
  status: 0,
  message: '登录成功',
  token: 'Bearer ' + tokenStr
})
```



## 2.7 配置解析 Token 的中间件

1. 运行如下命令，安装解析Token的中间件：

```bash
npm i express-jwt
```



2. 在`app.js`中注册路由之前， 配置解析Token的中间件：

```js
// 解析Token的全局中间件
const { expressjwt: jwt } = require('express-jwt')
const config = require('./config')
app.use(jwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({ path: [/^\/api\//] }))


```

3. 在`app.js`中的`错误级别中间件`里面，捕获并处理Token认证失败后的错误：

```js
app.use((err, req, res, next) => {
  // 省略其他代码...

  // 身份认证失败后的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  
  // 省略其他代码...
})
```





# 3. 个人中心



##  3.1 获取用户的基本信息



###   3.1.0 实现步驿

1. 初始化 **路由** 模块
2. 初始化 **路由处理函数** 模块
3. 获取用户的基本信息

### 3.1.1 初始化路由模块

1. 创建 `/router/userinfo.js` 路由模块，并初始化如下的代码结构：

```js

// 导入express
const express = require('express')

// 创建路由对象
const router = express.Router()

router.get('/userinfo', (req, res) => {
  res.cc('ok')
})

module.exports = router

```

2. 在`app.js`中导入并使用个人中心的路由模块：

```js

// 用户路由
const userRouter = require('./router/user')
app.use('/api', userRouter)

// 导入并使用用户信息的路由模块

const userinfoRouter = require('./router/userinfo')
app.use('/my', userinfoRouter)

```



### 3.1.2 初始化路由处理函数模块

1. 创建 `router_handler/userinfo.js`路由处理函数模块， 并初始化如下的代码结构：

```js
exports.getUserinfo = (req, res) => {
  res.cc('ok')
}
```

2. 修改 `/router/userinfo.js`中的代码如下：

```js

// 导入express
const express = require('express')

// 创建路由对象
const router = express.Router()

const { getUserinfo } = require('../router_handler/userinfo')

router.get('/userinfo', getUserinfo)

module.exports = router

```



### 3.1.3 获取用户的基本信息

1. 在`/router_handler/userinfo.js`头部导入数据库操作模块：

```js
// 导入数据库操作模块
const db = require('../db/index')
```

2. 定义SQL语句：

```js
 // 定义查询用户信息的SQL语句
  // 注意： 为了防止用户的密码泄漏，需要排除 password 字段
  const sql = `SELECT id, username, nickname, email, user_pic FROM ev_users WHERE id=?`

```

3. 调用 `db.query()`执行SQL语句：

```js
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
```



## 3.2 更新用户的基本信息

### 3.2.0 实现步骤

1. 定义路由和处理函数
2. 验证表单数据
3. 实现更新用户基本信息的功能

### 3.2.1 定义路由和处理函数

1. 在 `router/userinfo.js`模块中，新增 `更新用户基本信息`的路由：

```js
// 更新用户信息的路由
router.post('/userinfo', updateUserInfo)
```

2. 在 `router_handler/userinfo.js` 模块中， 定义并向外共享 `更新用户信息`的路由处理函数：

```js
// 更新用户信息
exports.updateUserInfo = (req, res) => {
  res.send('ok')
}
```



### 3.2.2 验证表单数据

1. 在 `/schema/user.js`验证规则模块中，定义 `id`, `nickname`,`email`的验证规则如下：

```js

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
```

2. 在`/router/userinfo.js`模块中，导入验证数据合法性的中间件：

```js

// 验证数据合法性的中间件
const expressJoi = require('@escook/express-joi')
```

3. 在`/router/userinfo.js`模块中，导入需要的验证规则对象：

```js
// 需要的验证规则
const { update_userinfo_schema } = require('../schema/user')
```

4. 在`/router/userinfo.js`模块中，修改 `更新用户的基本信息` 的路由如下：

```js

// 更新用户信息的路由
router.post('/userinfo', expressJoi(update_userinfo_schema), updateUserInfo)
```



### 3.2.3 实现更新用户基本信息的功能

1. 定义执行的SQL语句：

```js
const sql = `UPDATE ev_users SET ? WHERE id=?`
```

2. 调用 `db.query()`执行SQL语句并传参：

```js
  db.query(sql, [req.body, req.body.id], (err, results) => {
    if (err) return res.cc(err.message)
    if (results.affectedRows !== 1) return res.cc('修改用户信息失败！')
    return res.cc('修改用户基本信息成功', 0)
  })
```





## 3.3 重置密码

### 3.3.0 实现步骤

1. 定义路由和处理函数
2. 验证表单数据
3. 实现重置密码的功能

### 3.3.1定义路由和处理函数

1. 在`/router/userinfo.js`模块中，新增`重置密码` 的路由：

```js
// 重置密码路由
router.post('/updatepwd', updatePassword)
```

2. 在`/router_handler/userinfo.js`模块中，定义并向外共享 `重置密码`的路由处理函数：

```js
// 重置密码的处理函数
exports.updatePassword = (req, res) => {
  res.send('ok')
}
```



### 3.3.2 验证表单数据

> 核心验证思路：旧密码与新密码，必须符合密码的验证规则，并且新密码不能与旧密码一致！

1. 在`/schema/user.js`模块中，使用`exports`向外共享如下的 `验证规则`对象：

```js
// 验证规则对象 - 重置密码
exports.update_password_schema = {
  body: {
    // 使用 password这个规则，验证req.body.oldPwd的值
    odlPwd: password,
    
    // 使用joi.not(joi.ref('oldPwd')).concat(password) 规则，验证 req.body.newPwd的值
    // 解读： 
    // 1. joi.ref('oldPwd') 表示newPwd的值必须和oldPwd的值保持一致
    // 2. joi.not( joi.ref('oldPwd')) 表示 newPwd的值不能等于oldPwd的值
    // 3. .concat(password) 用于合并 joi.not( joi.ref('oldPwd')) 和 password 这两条验证规则
    newPwd: joi.not(joi.ref('oldPwd')).concat(password)
  }
}
```

2. 在`/router/userinfo.js` 模块中 引入验证规则：

```js

const { update_userinfo_schema, update_password_schema } = require('../schema/user')

// 重置密码的路由
router.post('/updatepwd', expressJoi(update_password_schema), updatePassword)
```



### 3.3.3 实现重置密码的功能

1. 根据 `id`查询用户是否存在：

```js

// 重置密码
exports.updatePassword = (req, res) => {

  // 根据id 查询用户信息
  const sql = `SELECT * FROM my_db_01.ev_users WHERE id=?`

  //  根据id查询用户信息的SQL语句
  db.query(sql, req.auth.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.length !== 1) return res.cc('用户不存在！')

    // 判断用户输入的旧密码是否正确

    res.send('ok')

  })

}
```

2. 判断提交的 `旧密码`是否正确：

```js
// 在头部区域导入 bcryptjs后， 即可使用bcrypt.compareSync(提交的密码，数据库中的密码)方法验证密码是否正确
// compareSync()函数的返回值为布尔值，true表示密码正确， false表示密码错误
const bcrypt = require('bcrtptjs')

// 判断提交的旧密码是否正确
const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
if (!compareResult) return res.cc('原密码错误!')


```

3. 对新密码进行 `bcrypt`加密后，更新到数据库中：

```js
  // 定义更新用户密码的SQL语句
    const sql = `UPDATE ev_users set password=? WHERE id=?`

    // 对新密码进行 bcrypt 加密处理
    const newPwd = bcrypt.hashSync(req.body.newPwd, 10)

    // 执行SQL语句，根据id更新用户的密码
    db.query(sql, [newPwd, req.auth.id], (err, results) => {
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('更新密码失败！')
      res.send({
        status: 0,
        message: '密码更新成功！',
      })
    })
```



## 3.4 更新头像

### 3.4.0 实现步骤

1. 定义路由和处理函数
2. 验证表单数据
3. 实现更新用户头像的功能

### 3.4.1 定义路由和处理函数

1. 在 `/router/userinfo.js`模块中，新增 `更新用户头像`的路由:

```js
// 更新用户头像的路由
router.post('/update/avatar', updateAvatar)
```

2. 在 `/router_handler/userinfo.js  `模块中， 定义并向外共享`更新头像`的路由处理函数：

```js
// 更新用户头像的处理函数
exports.updateAvatar = (req, res) => {
  res.send('ok')
}
```



### 3.4.2 验证表单数据

1. 在`/schema/user.js`验证规则模块中，定义 `avatar` 的验证规则如下：

```js
// dataUri()指的是如下格式的字符串数据：
// data:image/png;base64.VE9PTUFOWVNFQTJFVFM
const avatar = joi.string().dataUri().required()
```

2. 并使用 `exports`向外共享如下的规则对象：

```js

// 头像的验证规则
exports.updata_avatar_schema = {
  body: {
    avatar
  }
}
```

3. 在`/router/userinfo.js`模块中，导入需要的验证规则：

```js
const {update_avatar_schema} = require('.../schema/user')
```



###  3.4.3 更新用户头像

1. 定义更新用户头像的SQL语句：

```js
const sql = `UPDATE ev_users SET user_pic=? WHERE id=?`
```

2. 调用 `db.query()`执行SQL语句，更新对应用户的头像：

```js
db.query(sql, [req.body.avatar, req.auth.id] ,(err , results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('更新头像失败！')
  
  return res.cc('更新头像成功', 0)
})
```



# 4.文章分类管理

## 4.1 新建ev_article_cate表

### 4.1.1 创建表结构

![image-20230608114736590](/Users/shutong/Documents/文档/TyporaImage/image-20230608114736590.png)

### 4.1.2 新增两条初始数据

![image-20230608114957624](/Users/shutong/Documents/文档/TyporaImage/image-20230608114957624.png)

## 4.2 获取文章分类列表

### 4.2.0实现步骤

1. 初始化路由模块
2. 初始化路由处理函数模块
3. 获取文章分类列表数据

### 4.2.1 初始化路由模块

1. 创建`/router/artcate.js`模块，并初始化如下的代码结构：

```js
// 导入express
const express = require('express')

// 初始化路由对象
const router = express.Router()

// 获取文章列表数据

router.get('/cates', (req, res) => {
  res.send('ok')
})

module.exports = router
```

2. 在`app.js`中导入并使用文章分类的路由模块：

```js
// 导入并使用文章分类的路由模块
const artCateRouter = require('./router/artcate')
// 为文章分类的路由挂载统一的访问前缀
app.use('/my/article', artCateRouter)

```



### 4.2.2 初始化路由处理函数模块

1. 创建`/router_handler/artcate.js`路由处理函数模块，并初始化如下的代码结构：

```js
exports.getArticleCates = (req, res) => {
  res.send('ok')
}

```

2. 修改 `/router/artcate.js`中的代码如下：

```js

// 导入express
const express = require('express')

// 初始化路由对象
const router = express.Router()

// 导入文章分类路由函数处理模块
const { getArticleCates }  = require('../router_handler/artcate')

// 获取文章列表数据
router.get('/cates', getArticleCates)

module.exports = router
```



### 4.2.3 获取文章分类列表数据

1. 在 `router_handler/artcate.js`头部导入数据库操作模块：

```js
// 导入数据库操作模块
const db = require('../db/index')
```

2. 定义SQL语句：

```js
// 根据分类的状态，获取所有未被删除的分类列表的数据
// is_delete 为0表示未被删除
const sql = `SELECT * FROM ev_article_cate WHERE is_delete=0 order by id asc`
```

3. 调用 `db.query()`执行SQL语句：

```js
db.query(sql, (err, results) => {
    if (err) return res.cc(err)
    res.send({
      status: 0,
      message: '获取文章分类数据成功！',
      data: results
    })
  })
```



## 4.3 新增文章分类

### 4.3.0 实现步骤

1. 定义路由和处理函数
2. 验证表单数据
3. 查询 `分类名称` 与 `分类别名` 是否被占用
4. 实现新增文章分类的功能

### 4.3.1 定义路由和处理函数

1. 在 `router/artcate.js`模块中，添加 `新增文章分类`的路由：

```js
// 新增文章分类的路由
router.post('/addcates', addArticleCates)
```

2. 在 `/router_handler/artcate.js`模块中，定义并向外共享 `新增文章分类`的路由处理函数：

```js
exports.addArticleCates = (req, res) => {
  res.send('ok')
}
```

### 4.3.2 验证表单数据

1. 创建 `schema/artcate.js` 文章分类数据验证模块，并定义如下的验证规则：

```js

// 导入数据校验模块
const joi = require('joi')

// 定义 分类名称 和 别名的较验规则
const name = joi.string().required()
const alias = joi.string().alphanum().required()

// 校验规则对象 - 添加分类
exports.add_cate_schema = {
  body: {
    name,
    alias
  }
}
```

2. 在 `/router/artcate.js`模块中，使用 `add_cate_schema`对数据进行验证：

```js
// 导入校验规则
const { add_cate_schema } = require('../schema/artcate')
// 导入数据验证中间件
const expressJoi = require('@escook/express-joi')

// 新增文章分类
router.post('/addcates', expressJoi(add_cate_schema), addArticleCates)

```



### 4.3.3 查询 分类名称 与 分类别名 是否被占用

1. 定义查重的SQL语句：

```js
// 定义查询 分类名称 和 分类别名 是否被占用的SQL语句

const sql = `SELECT * FROM ev_article_cate WHERE name=? or alias=?`
```

2. 调用 `db.query()`执行查重的操作：

```js
 db.query(sql, [req.body.name, req.body.alias], (err, results) => {
    if (err) return res.cc(err)

    // 分类名称 和 分类别名 都被占用
    if (results.length == 2) return res.cc('分类名称和别名都被占用，请更换后重试！')
    if (results.length == 1 && results[0].name == req.body.name && results[0].alias === req.body.alias) return res.cc('分类名称和别名都被占用，请更换后重试！')

    // 分类名称 或 分类别名 被占用
    if (results.length == 1 && results[0].name == req.body.name) return res.cc('分类名称被占用，请更换后重试！')
    if (results.length == 1 && results[0].alias == req.body.alias) return res.cc('分类别名被占用，请更换后重试！')

    // TODO: 新增文章分类
   
  })
```

### 4.3.4实现新增文章分类的功能

1. 定义新增文章分类的SQL语句：

```js
   const sql = `INSERT INTO ev_article_cate SET ?`
```

2. 调用 `db.query()` 执行新增文章分类的SQL语句：

```js
db.query(sql,req.body, (err, results) => {
  if (err) return res.cc(err)
  
  if (results.affectedRows !== 1) return res.cc('新增文章分类的失败！')
  
  res.cc('新增文章分类成功！', 0)
})
```



### 4.4.0实现步骤

1. 定义路由和处理函数
2. 验证表单数据
3. 实现删除文章分类的功能

### 4.4.1 定义路由和处理函数

1. 在 `/router/artcate.js`模块中，添加 `删除文章分类 `的路由

```js
// 删除文章分类的路由
router.get('/deletecate/:id', deleteCateById)
```

2. 在 `/router_handle/artcate.js`模块中，定义并向外分享 `删除文章分类`的路由处理函数：

```js
// 删除文章分类的处理函数
exports.deleteCateById = (req, res) => {
  res.cc('ok')
}
```

### 4.4.2 验证表单数据

1. 在 `/schema/artcate.js`验证规则模块中，定义id的验证规则如下：

```js
// 定义分类id的较验规则
const id = joi.number().integer().min(1).required()
```

2. 使用 `exports`向外共享如下的 `验证规则对象`:

```js
// 校验规则对象 - 删除分类
exports.delete_cate_schema = {
  params: {
    id
  }
}
```

3. 在 `/router/artcate.js`模块中，导入需要的验证规则对象，并在路由中使用：

```js
// 导入删除分类的验证规则对象
const { delete_cate_schema } = require('../schema/artcate')

// 删除文章分类
router.get('/deletecate/:id', expressJoi(delete_cate_schema), deleteCateById)

```



### 4.4.3 实现删除文章分类的功能

1. 定义删除文章分类的SQL语句：

```js
const sql = `UPDATE ev_article_cate SET is_delete=1 WHERE id=?`
```

2. 调用`db.query()`，执行SQL语句实现删除功能：

```js
db.query(sql, req.params.id, (err, results) => {
  if (err) return res.cc(err)
  if (results.affectedRows !== 1) return res.cc('文章分类删除失败！')
  res('文章分类删除成功！',0)
})
```



## 4.5 根据Id获取文章分类数据

### 4.5.0 实现步骤

1. 定义路由和处理函数
2. 验证表单数据
3. 实现获取文章分类的功能

### 4.5.1定义路由和处理函数

1. 在`/router/artcate.js`模块中，添加 `根据 Id 获取文章分类`的路由：

```js
router.get('/cates/:id', getArtCateById)
```

2. 在`/router_handler/artcate.js`模块中，定义并向外共享`根据 Id获取文章分类`的路由处理函数：

```js
// 根据 Id获取文章分类的处理函数
exports.getArtCateById = (req, res) => {
  res.send('ok')
}
```

### 4.5.2  验证表单数据

1. 在`/schema/artcate.js`模块中，定义并向外共享 `根据Id获取文章分类 `的规则对象：

```js
// 校验规则对象 - 根据Id获取文章分类
exports.get_cate_schema = {
  params: {
    id
  }
}
```

2. 在`/router/artcate.js`模块中，导入需要的验证规则对象，并在路由中使用：

```js
const { get_cate_schema } = require('../schema/artcate')


// 根据id获取文章分类
router.get('/cates/:id', expressJoi(get_cate_schema), getArtCateById)

```



### 4.5.3 实现获取文章分类的功能

1. 定义根据Id获取文章分类的SQL语句：

```js
const sql = `SELECT * FROM ev_article_cate WHERE id=?`
```

2. 调用`db.query()`，执行SQL语句实现删除功能：

```js
db.query(sql, req.params.id, (err, results) => {
  if (err) return res.cc(err)
  if (results.length !== 1) return res.cc('获取文章分类失败！')
  res.send({
    status: 0,
    message: '获取文章分类成功！',
    data: results[0]
  })
})
```



### 4.5.4 插叙分类名称与别名是否被占用

1. 定义查重的SQL语句：

```js
// 定义查询 分类名称 和 分类别名 是否被占用的SQL语句

  const sql = `SELECT * FROM ev_article_cate WHERE id!=? and (name=? || alias=?)`

```

```js
db.query(sql, [req.body.id, req.body.name, req.body.alias], (err, results) => {
   if (err) return res.cc(err)

    // 分类名称 和 分类别名 都被占用
    if (results.length == 2) return res.cc('分类名称和别名都被占用，请更换后重试！')
    if (results.length == 1 && results[0].name == req.body.name && results[0].alias === req.body.alias) return res.cc('分类名称和别名都被占用，请更换后重试！')

    // 分类名称 或 分类别名 被占用
    if (results.length == 1 && results[0].name == req.body.name) return res.cc('分类名称被占用，请更换后重试！')
    if (results.length == 1 && results[0].alias == req.body.alias) return res.cc('分类别名被占用，请更换后重试！')

  // TODO: 更新文章分类
  
})
```



## 4.6 根据Id更新文章分类数据

### 4.6.0 实现步骤

1. 定义路由和处理函数
2. 验证表单数据
3. 查询分类名和别名是否被占用
4. 实现更新文章分类的功能

### 4.6.1 定义路由和处理函数

1. 在 `/router/artcate.js`模块中，添加 `根据 Id 更新文章分类`的路由：


```js

const { updateArtCateById } = require('../router_handler/artcate')

router.post('/update', updateArtCateById)
```

2. 在`/router_handler/artcate.js`模块中，定义并向外共享`根据 Id获取文章分类`的路由处理函数：

```js
// 根据Id更新文章分类
exports.updateArtCateById = (req, res) => {
  res.send('ok')
})
```



### 4.6.2 验证表单数据

1. 在`/schema/artcate.js`模块中，定义并向外共享 `根据Id更新文章分类 `的规则对象：

```js
// 校验规则对象 - 更新文章分类
exports.update_cate_schema = {
  body: {
    id,
    name,
    alias
  }
}
```

2. 在`/router/artcate.js`模块中，导入需要的验证规则对象，并在路由中使用：

```js
const { update_cate_schema } = require('../schema/artcate')


// 根据Id更新文章分类
router.post('/update', expressJoi(update_cate_schema), updateArtCateById)


```



### 4.6.3 查询分类名和别名是否被占用

```js
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

    // // TODO: 更新文章分类
    
  })
```



### 4.6.4实现更新文章分类的功能

```js
// TODO: 更新文章分类
    const sql = `UPDATE ev_article_cate SET name=?, alias=? WHERE id=?`
    db.query(sql, [req.body.name, req.body.alias, req.body.id], (err, results) => {
      console.log("results: ", results)
      if (err) return res.cc(err)
      if (results.affectedRows !== 1) return res.cc('文章分类更新失败！')
      res.cc('文章分类更新成功！', 0)
    })

```



# 5 文章管理

## 5.1 新建ev_articles表

![image-20230609173627681](/Users/shutong/Documents/文档/TyporaImage/image-20230609173627681.png)

## 5.2 发布新文章

### 5.2.0 实现步骤

1. 初始化路由模块
2. 初始化路由处理函数模块
3. 使用multer解析表单数据
4. 验证表单数据
5. 实现发布文章的功能

### 5.2.1 初始化路由模块

1. 创建`/router/article.js`路由模块，并初始化如下代码：

```js

const express = require('express')

const router = express.Router()

// 发布新文章
router.post('/add', (req, res) => {
  res.send('ok')
})

module.exports = router
```

2. 在 `app.js`模块中导入并使用文章路由：

```js
// 导入并使用文章的路由模块
const articleRouter = require('./router/article')
app.use('/my/article', articleRouter)

```



### 5.2.2 初始化路由处理函数模块

1. 创建`/router_handler/article.js`路由处理函数模块，并初始化如下的代码结构：

```js
exports.addArticle = (req, res) => {
  res.send('ok')
}
```

2. 修改`/router/article.js`中的代码如下：

```js

const express = require('express')

const router = express.Router()

// 导入文章的路由处理函数模块
const { addArticle } = require('../router_handler/article')

// 发布新文章
router.post('/add', addArticle)

module.exports = router
```



### 5.2.3 使用multer解析表单数据

1. 安装`multer`：

```js
npm install --save multer
```

2. 修改`/router/article.js`路由模块中，导入`multer`，并配置文件的存储位置：

```js
const express = require('express')

const router = express.Router()

// 导入文章的路由处理函数模块
const { addArticle } = require('../router_handler/article')

// 导入解析器
const multer = require('multer')
// 配置文件保存的路径
const upload = multer({ dest: 'uploads/cover/' })

// 发布新文章
router.post('/add', upload.single('cover_img'), addArticle)

module.exports = router
```



### 5.2.4 验证表单数据

1. 新建 `/schema/article.js`表单验证模块，并初始化如下格式代码：

```js

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

// 较验规则 -- 添加文章
exports.add_article_schema = {
  body: {
    title,
    content,
    cate_id,
    state
  }
}
```

2. 在 `/router/article.js`中导入并使用较验规则：

```js

const express = require('express')

const router = express.Router()

// 导入文章的路由处理函数模块
const { addArticle } = require('../router_handler/article')

// 导入解析器
const multer = require('multer')
// 配置文件保存的路径
const upload = multer({ dest: 'uploads/cover/' })

// 导入校验规则
const {add_article_schema} = require('../schema/article')


// 发布新文章 ; 
router.post('/add', upload.single('cover_img'), add_article_schema(addArticle))

module.exports = router
```



### 5.2.5 实现发布文章的功能

1. 在`/router_handler/article.js`路由处理函数模块中，使用如下代码：

```js
const db = require('../db/index')

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
```



## 5.3 获取文章的列表数据

1. 在`/router/article.js`中添加`获取文章了列表`的路由：

```js
const { addArticle, getArticles } = require('../router_handler/article')

router.get('/list', getArticles)
```

2. 在 `/router_handler/article.js`处理函数中，声明并共享`获取文章列表`函数：

```js
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
```



## 5.4 根据 Id 删除文章数据

1. 在 `/schema/article.js`表单验证模块中，添加并共享`删除文章`验证：

```js
const id = joi.number().required()
// 较验规则 -- 删除文章
exports.delete_article_schema = {
  body: {
    id
  }
}
```

2. 在`/router/article.js`路由模块，创建`删除文章`路由：

```js
// 根据 Id 删除文章数据
router.post('/delete/article', expressJoi(delete_article_schema), deleteArticleById)
```

3. 在 `/router_handler/article.js`路由处理函数模块中，创建并共享：

```js

// 根据 Id 删除文章数据
exports.deleteArticleById = (req, res) => {

  const sql = `UPDATE ev_articles SET is_delete=1 WHERE id=?`
  db.query(sql, req.body.id, (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows != 1) return res.cc('删除文章失败！')
    res.cc('删除文章成功', 0)
  })
}
```



## 5.5 根据 Id 获取文章详情

```js
// 根据 Id 获取文章详情
router.post('/info/article', getArticleInfoById)

```

1. 在 `/schema/article.js`验证模块中，创建并共享`根据id文章详情`验证规则对象：

```js
// 较验规则 -- 根据id获取文章信息
exports.info_article_schema = {
  body: {
    id
  }
}

```

2. 在 `/router/article.js`路由中，导入并使用验证规则：

```js
const { add_article_schema, delete_article_schema, info_article_schema, update_article_schema } = require('../schema/article')


// 根据 Id 获取文章详情
router.post('/info/article', expressJoi(info_article_schema), getArticleInfoById)

```

3. 在 `/router_handler/article.js`路由处理函数中，导出`根据id更新文章信息`处理函数:

```js

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
```



## 5.6 根据 Id 更新文章信息

1. 在 `/schema/article.js`验证模块中，创建并共享`根据id更新文章信息`验证规则对象：

```js
// 较验规则 -- 根据id更新文章信息
exports.update_article_schema = {
  body: {
    id,
    cover_img,
    content,
    title
  }
}
```

2. 在 `/router/article.js`路由中，导入并使用验证规则：

```js

const { add_article_schema, delete_article_schema, info_article_schema, update_article_schema } = require('../schema/article')

// 根据 Id 更新文章信息
router.post('/update/article', upload.single('cover_img'), expressJoi(update_article_schema), updateArticleById)

```

3. 在 `/router_handler/article.js`路由处理函数中，导出`根据id更新文章信息`处理函数:

```js
// 根据 Id 更新文章信息
exports.updateArticleById = (req, res) => {
  const sql = `UPDATE ev_articles SET title=?, content=?, cover_img=? WHERE id=?`
  db.query(sql, [req.body.title, req.body.content, req.body.cover_img, req.body.id], (err, results) => {
    if (err) return res.cc(err)
    if (results.affectedRows != 1) return res.cc('更新文章失败！')
    res.cc('更新文章成功', 0)
  })
}
```



