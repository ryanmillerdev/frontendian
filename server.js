const Fs = require('fs')
const Hapi = require('@hapi/hapi');
const Path = require('path')

// Post Handling

const loadPosts = () => Fs.readdirSync('./posts')
  .map(filename => Fs.readFileSync(`./posts/${filename}`, 'utf8'))
  .map(require('./utilities/parse-post'))

const posts = loadPosts()
  .filter(post => post.published_at !== undefined) // Remove unpublished posts
  .filter(post => Date.now() > (new Date(post.published_at).getTime())) // Remove posts to be published in the future
  .sort((a, b) => new Date(b.published_at) - new Date(a.published_at)) // Sort by date published

// Redirect Routes

const mountRedirects = (server) => {
  const { redirects } = JSON.parse(Fs.readFileSync('./redirects.json', 'utf8'))

  Object.entries(redirects).forEach(([from, to]) => {
    server.route({
      method: 'GET',
      path: from,
      handler: (_, h) => h.redirect(to).permanent()
    })
  })
}

// Post Routes

const mountPostRoutes = (server) => {
  posts.forEach(post => {
    server.route({
      method: 'GET',
      path: `/${post.slug}`,
      handler: (_, h) => h.view('post', { 
        title: post.title,
        description: post.excerpt,
        image: post.og_image,
        post 
      })
    })
  })
}

// Server Initialization

const bootstrap = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 8040,
    routes: {
      files: { relativeTo: Path.join(__dirname, 'static') }
    }
  })

  await server.register(require('@hapi/inert'))
  await server.register(require('@hapi/vision'))

  server.views({
    engines: { pug: require('pug') },
    relativeTo: __dirname,
    path: 'views',
    context: {
      title: 'the frontendian',
      description: 'A little blog about building web applications.',
      image: '/public/img/generic_share.png'
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => h.view('index', { posts })
  })
  
  server.route({
    method: 'GET',
    path: '/feed.xml',
    handler: (request, h) => h.view('rss', { posts }).type('application/atom+xml')
  })

  server.route({
    method: 'GET',
    path: '/mailing-list',
    handler: (request, h) => h.view('mailing-list')
  })

  // Fs.readdirSync('./routes').forEach(r => server.route(require(`./routes/${r}`)))

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: { path: '.', index: false }
    }
  })

  mountRedirects(server)
  mountPostRoutes(server)

  await server.start()
}

bootstrap()
