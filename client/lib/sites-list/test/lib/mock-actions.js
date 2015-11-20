var site = require( './mock-site' );

var Actions = {

	disconnectSite: {
		type: 'DISCONNECT_SITE',
		action: 'DISCONNECT_SITE',
		site: site
	},

	disconnectedSiteError: {
		type: 'RECEIVE_DISCONNECTED_SITE',
		action: 'DISCONNECT_SITE',
		site: site,
		data: {},
		error: { error: 'unauthorized_access' }
	},

	removeNotices: {
		type: 'REMOVE_SITES_NOTICES',
		logs: [
			{
				status: 'error',
				action: 'DISCONNECT_SITE',
				site: site,
				error: { error: 'unauthorized_access' }
			}
		]
	}

};

module.exports = Actions;
