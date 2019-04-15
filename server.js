const Express = require('express')
const subdomain = require('express-subdomain')

// Express App

const app = Express()

// i18n Subdomains Router

app.use(subdomain('fr', Express.static('_site/fr_FR', {
  extensions: ['html']
})))

app.get('/fr_FR/:path', (req, res) => {
  console.log(req)
  res.redirect(`${req.protocol}://fr.${req.hostname}/${req.params.path}`)
})

app.use(subdomain('pt', Express.static('_site/pr_BR', {
  extensions: ['html']
})))

// Routers

app.use(Express.static('_site', {
  extensions: ['html']
}))

app.get(/\/$/, (req, res) => res.redirect(req.url.substring(0, req.url.length - 1)))

// Liftoff

app.listen(80)
