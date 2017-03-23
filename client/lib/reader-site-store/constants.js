module.exports = {
    action: {
        FETCH: 'FETCH_SITE',
        RECEIVE_FETCH: 'RECEIVE_FETCH_SITE',
        RECEIVE_BULK_UPDATE: 'RECEIVE_BULK_SITE_UPDATE',
    },
    state: {
        PENDING: 1,
        COMPLETE: 2,
        ERROR: 4,
    },
};
