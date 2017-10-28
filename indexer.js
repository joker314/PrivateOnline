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

async function index(storage, {
  topicID
}) {
  // storage.set('po-user-' + username, postID)
  // storage.set('po-topic-' + topic + '-page-count', pageCount)

  let currentPage = storage.has(`po-topic-${topicID}-page-count`)
    ? storage.get(`po-topic-${topicID}-page-count`)
    : 1

  let pageCount = null

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
      }
      const postID = postIDMatch[1]

      const author = post.querySelector('.username').textContent

      console.log(`${author}: ${postID}`)
    }

    // If the page count is still undefined, we need to set it.
    if (pageCount === null) {
      const pageLinks = doc.body.querySelectorAll('a.page')
      const lastPage = pageLinks[pageLinks.length - 1]
      pageCount = lastPage.textContent
    }

    currentPage++
  } while (currentPage <= pageCount)
}
