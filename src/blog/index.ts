import { Hono } from 'hono'
import { Pool } from 'pg'
import { Env } from '../model'
import { R } from '../common/R'

type Post = {
  postPath: string
  postCnt: string
  ctime: number
}

const app = new Hono<{ Bindings: Env }>()

// TODO: swagger
app.get('/', (c) => c.text('Obsidian: blog api.'))

const POST_LIST_SQL = `
  select * from tt_post order by id desc limit $1 offset $2
`
const POST_DETAIL_SQL = `
  select * from tt_content where id = $1
`

// 分页获取
app.get('/list', async (c) => {
  const { size = '10', page = '1' } = c.req.query()
  // 分页
  const limit = parseInt(size)
  const offset = (parseInt(page) - 1) * limit
  // 连接数据库
  const pool = new Pool({ connectionString: c.env.DB_URL })
  // 查询
  const QueryResult = await pool.query(POST_LIST_SQL, [limit, offset])
  // 封装返回结果
  const result = R.success(QueryResult.rows)
  const response = new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
  // 断开数据库连接
  c.executionCtx.waitUntil(pool.end())
  return response
})

// 根据id获取文章详情
app.get('/d/:id', async (c) => {
  let postId = c.req.param('id')
  // 连接数据库
  const pool = new Pool({ connectionString: c.env.DB_URL })
  // 查询
  const QueryResult = await pool.query(POST_DETAIL_SQL, [postId])
  // 封装返回结果
  const result = R.success(QueryResult.rows[0])
  const response = new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  })
  // 断开数据库连接
  c.executionCtx.waitUntil(pool.end())
  return response
})

export default app
