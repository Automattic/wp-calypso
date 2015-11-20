module.exports = {
  action: {
    FETCH: 'FEED_FETCH',
    RECEIVE_FETCH: 'RECEIVE_FEED_FETCH'
  },
  state: {
    PENDING: 1,
    COMPLETE: 2,
    ERROR: 4
  }
};
