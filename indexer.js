'use strict'

const scratch = {
  forumTopic: (id, page = 1) => {
    if (page === 1) {
      return `https://scratch.mit.edu/discuss/topic/${id}`
    } else {
      return `https://scratch.mit.edu/discuss/topic/${id}/?page=${page}`
    }
  },

  forumPost: id => `https://scratch.mit.edu/discuss/post/${id}`
}

const promisifyCall = (obj, key, ...args) => {
  return new Promise(resolve => {
    obj[key](...args, (data) => {
      resolve(data)
    })
  })
}

async function index(storage, {
  topicID
}) {
  // Start at the cached page count, if one exists. We do this to avoid parsing
  // (and requesting) all pages on the given forum topic every time we run an
  // indexer pass. Note that we don't start at the page AFTER the cached page
  // count; if we did, we'd miss any potential new posts on that page (and
  // we'd get a 404, if a new page doesn't already exist).

  const pageCountKey = `topic-${topicID}-page-count`
  let currentPage = (await promisifyCall(storage, 'get', pageCountKey))[pageCountKey] || 0
  console.log('doot', currentPage)

  let pageCount = null

  const indexData = {}

  // We use a do..while here, because we don't know the number of pages on the
  // topic yet - we only find that out after the first request.
  do {
    const res = await fetch(scratch.forumTopic(topicID, currentPage))
    const html = await res.text()
    const doc = (new DOMParser).parseFromString(html, 'text/html')

    const posts = doc.body.querySelectorAll('.blockpost')
    for (const post of posts) {
      const postIDHref = post.querySelector('.box-head a').href
      const postIDMatch = postIDHref.match(/post\/([0-9]+)\/$/)
      if (postIDMatch === null) {
        console.warn('Failed to parse post ID:', postIDHref)
        continue
      }
      const postID = postIDMatch[1]

      const author = post.querySelector('.username').textContent

      // We only care about the oldest post by any individual author.
      if (!(author in indexData)) {
        indexData[author] = postID
      }
    }

    // If the page count is still undefined, we need to set it. But we need to
    // check the page count, anyways, because it might have gotten bigger
    // since the last indexer pass.
    const pageLinks = doc.body.querySelectorAll('.page')
    const lastPage = pageLinks[pageLinks.length - 1]
    pageCount = lastPage.textContent

    currentPage++
  } while (currentPage <= pageCount)

  const appendedData = {}
  for (const [ author, postID ] of Object.entries(indexData)) {
    appendedData[`user-${author}`] = postID
  }
  appendedData[`topic-${topicID}-page-count`] = pageCount
  await promisifyCall(storage, 'set', appendedData)
}
