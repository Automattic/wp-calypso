var Dispatcher = require('dispatcher'),
    ActionTypes = require('./constants').action,
    wpcom = require('lib/wp');

var fetchingSites = {};

var SitesStoreActions = {
    fetch: function(siteId) {
        if (fetchingSites[siteId]) {
            return;
        }

        fetchingSites[siteId] = true;

        wpcom.undocumented().readSite({ site: siteId }, function(error, data) {
            delete fetchingSites[siteId];
            SitesStoreActions.receiveFetch(siteId, error, data);
        });
    },

    receiveFetch: function(siteId, error, data) {
        Dispatcher.handleServerAction({
            type: ActionTypes.RECEIVE_FETCH,
            siteId: siteId,
            error: error,
            data: data,
        });
    },
};

module.exports = SitesStoreActions;
