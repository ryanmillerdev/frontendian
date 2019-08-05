const Markdown = require('marked')
const Moment = require('moment')
const Yaml = require('js-yaml').safeLoad

module.exports = (post) => {
  const [_, postRawMetadata, postRawBody] = post.split('---\n')

  const postMetadata = Yaml(postRawMetadata)
  const postBody = Markdown(postRawBody)

  if (postMetadata.published_at) {
    postMetadata.published_at_pretty = Moment(postMetadata.published_at).format('MMMM Do, YYYY')
  }

  return Object.assign({}, postMetadata, { body: postBody })
}
