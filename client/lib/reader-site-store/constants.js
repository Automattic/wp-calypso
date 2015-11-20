module.exports = {
	action: {
		FETCH: 'FETCH_SITE',
		RECEIVE_FETCH: 'RECEIVE_FETCH_SITE'
	},
	state: {
		PENDING: 1,
		COMPLETE: 2,
		ERROR: 4
	}
};
