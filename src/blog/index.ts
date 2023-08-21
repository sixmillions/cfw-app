import { Hono } from 'hono'
import { Pool } from 'pg'
import { Env } from '../model'
import { R } from '../common/R'

const app = new Hono<{ Bindings: Env }>()

// TODO: swagger
app.get('/', (c) => c.text(`
Obsidian: blog api.
/api/v1/blog/list?size=10&page=1
/api/v1/blog/id/:id
/api/v1/blog/slug/:slug
/api/v1/blog/search?wd=java%20bash
/api/v1/blog/tag
/api/v1/blog/tag/:slug
/api/v1/blog/category
/api/v1/blog/category/:slug
`))

// 分页获取
const POST_COUNT_SQL = `
select count(1) as total from tt_post
`
const POST_LIST_SQL = `
  select * from tt_post order by id desc limit $1 offset $2
`
app.get('/list', async (c) => {
	const { size = '10', page = '1' } = c.req.query()
	// 分页
	const limit = parseInt(size)
	const offset = (parseInt(page) - 1) * limit
	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 获取总条数
	const countResult = await pool.query(POST_COUNT_SQL)
	const total = countResult.rows[0].total
	// 查询
	const queryResult = await pool.query(POST_LIST_SQL, [limit, offset])
	let data = {
		total: total,
		size: limit,
		current: parseInt(page),
		pages: Math.ceil(total / limit),
		records: queryResult.rows
	}
	// 封装返回结果
	const result = R.success(data)
	const response = new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' },
	})
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return response
})


// 根据id获取文章详情
const POST_DETAIL_SQL = `
select * from tt_content where id = $1
`

app.get('/id/:id', async (c) => {
	let postId = c.req.param('id')
	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 查询
	const queryResult = await pool.query(POST_DETAIL_SQL, [postId])
	// 封装返回结果
	const result = R.success(queryResult.rows[0])
	const response = new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' },
	})
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return response
})

// 根据slug获取文章详情
const POST_DETAIL_SLUG_SQL = `
select p.*, c.cnt from tt_content c inner join tt_post p on c.id = p.id where p.slug = $1
`

app.get('/slug/:slug', async (c) => {
	let slug = c.req.param('slug')
	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 查询
	const qeryResult = await pool.query(POST_DETAIL_SLUG_SQL, [slug])
	// 封装返回结果
	const result = R.success(qeryResult.rows[0])
	const response = new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' },
	})
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return response
})

// 关键字检索
const POST_SEARCH_SQL = `
select p.* from tt_content c inner join tt_post p on c.id = p.id where 1=1
`
app.get('/search', async (c) => {
	// 空格分隔，去重，取三个关键词
	const wd = c.req.query('wd')
	const words = wd?.split(" ").map(word => word.trim()).filter(word => word !== "");
	const uniqueWords = [...new Set(words)];
	const firstThreeWords = uniqueWords.slice(0, 3);
	// 拼接where条件
	let whereSql = firstThreeWords.map(word => " and c.cnt ilike '%" + word + "%'").join(' ');
	console.log(111, whereSql)
	// TODO: 拼接limit
	whereSql += " order by p.id desc limit 10 "

	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 查询
	const qeryResult = await pool.query(POST_SEARCH_SQL + whereSql)
	// 封装返回结果
	const result = R.success(qeryResult.rows)
	const response = new Response(JSON.stringify(result), {
		headers: { 'Content-Type': 'application/json' },
	})
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return response
})

// 获取标签及其标签下的文章数量
const TAG_COUNT_SQL = `
	with tmp_count as (
		select t.id, count(r.post_id) as _count
		from tt_tag as t left join tr_post_tag as r ON t.id = r.tag_id
	  group by t.id
	)
	select t.*, tmp._count as total
	from tt_tag t inner join tmp_count tmp on t.id = tmp.id
`
app.get('/tag', async (c) => {
	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 查询
	const qeryResult = await pool.query(TAG_COUNT_SQL)
	// 封装返回结果
	const result = R.success(qeryResult.rows)
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return c.json(result)
})

// 获取标签下的文章
const TAG_POST_LIST_SQL = `
	select * from tt_post as p
	where exists (
	  select 1 from tt_tag as t left join tr_post_tag as r on t.id = r.tag_id
	  where p.id = r.post_id and t.slug = $1
	)
`
app.get('/tag/:slug', async (c) => {
	let slug = c.req.param('slug')
	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 查询
	const qeryResult = await pool.query(TAG_POST_LIST_SQL, [slug])
	// 封装返回结果
	const result = R.success(qeryResult.rows)
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return c.json(result)
})

// 获取标签及其标签下的文章数量
const CATEGORY_COUNT_SQL = `
	with tmp_count as (
		select c.id, count(r.post_id) as _count
		from tt_category as c left join tr_post_category AS r ON c.id = r.category_id
	  group by c.id
	)
	select c.*, tmp._count as total
	from tt_category c inner join tmp_count tmp on c.id = tmp.id
`
app.get('/category', async (c) => {
	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 查询
	const qeryResult = await pool.query(CATEGORY_COUNT_SQL)
	// 封装返回结果
	const result = R.success(qeryResult.rows)
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return c.json(result)
})

// 获取分类下的文章
const CATEGORY_POST_LIST_SQL = `
	select * from tt_post as p
	where exists (
	  select 1 from tt_category as c left join tr_post_category as r on c.id = r.category_id
	  where p.id = r.post_id and c.slug = $1
	)
`
app.get('/category/:slug', async (c) => {
	let slug = c.req.param('slug')
	// 连接数据库
	const pool = new Pool({ connectionString: c.env.DB_URL })
	// 查询
	const qeryResult = await pool.query(CATEGORY_POST_LIST_SQL, [slug])
	// 封装返回结果
	const result = R.success(qeryResult.rows)
	// 断开数据库连接
	c.executionCtx.waitUntil(pool.end())
	return c.json(result)
})


export default app
