'use strict'

const testTopicID = 204694

const sillyStorage = {
  data: {
    // Simulate there already being two pages. The indexer won't run through
    // the first page, since it assumes that page hasn't changed.
    [`topic-${testTopicID}-page-count`]: 2
  },

  set(appendedData) {
    for (const [ key, value ] of Object.entries(appendedData)) {
      this.data[key] = value
    }
  },

  get(key) {
    return this.data[key]
  },

  has(key) {
    return key in this.data
  }
}

index(sillyStorage, {
  topicID: testTopicID
}).then(() => {
  console.log(sillyStorage.data)
}).catch(err => {
  console.error(err)
})
