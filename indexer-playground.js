'use strict'

const sillyStorage = {
  data: {},

  set(key, value) {
    this.data[key] = value
  },

  get(key) {
    return this.data[key]
  },

  has(key) {
    return key in this.data
  }
}

index(sillyStorage, {
  topicID: 204694
})
