var site = require( './mock-site' ),
	earnings = require( './mock-earnings' ),
	settings = require( './mock-settings' );

export default {
	fetchedEarnings: {
		type: 'RECEIVE_EARNINGS',
		site: site,
		error: null,
		data: earnings
	},

	fetchedSettings: {
		type: 'RECEIVE_WORDADS_SETTINGS',
		site: site,
		error: null,
		data: settings
	},

	fetchedTos: {
		type: 'RECEIVE_WORDADS_TOS',
		site: site,
		error: null,
		data: { tos: 'signed' }
	}
};
