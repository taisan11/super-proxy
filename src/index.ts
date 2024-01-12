import { Hono } from 'hono'
import {logger} from 'hono/logger'

const app = new Hono()
app.use("*", logger());

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.get('/*', async (c) => {
  const url = c.req.path.substring(1, c.req.path.length);
  const headers = c.req.headers;
  const OLD_URL = 'oldhost'
  const NEW_URL = 'http://127.0.0.1:8787/'

  class AttributeRewriter {
    constructor(attributeName) {
      this.attributeName = attributeName
    }
    element(element) {
      const attribute = element.getAttribute(this.attributeName)
      if (attribute) {
        element.setAttribute(this.attributeName,
	  attribute.replace(OLD_URL, NEW_URL))
      }
    }
  }

  const rewriter = new HTMLRewriter().on('a', new AttributeRewriter('href'))

  const res = await fetch(c.req.raw)
  const contentType = res.headers.get('Content-Type')

  if (contentType.startsWith('text/html')) {
    return rewriter.transform(res)
  } else {
    return res
  }
})

export default app
