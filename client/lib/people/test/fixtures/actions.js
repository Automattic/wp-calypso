const site = require( './site' );

module.exports = {
	unauthorizedFetchingUsers: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			number: 100,
			offset: 0,
			siteId: site.ID,
			order: 'ASC',
			order_by: 'display_name',
			search: null
		},
		error: {
			statusCode: 403,
			error: 'unauthorized',
			message: 'User cannot view users for specified site',
			name: 'UnauthorizedError'
		}
	},

	errorWhenFetchingUsers: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			number: 100,
			offset: 0,
			siteId: site.ID,
			order: 'ASC',
			order_by: 'display_name',
			search: null
		},
		error: {
			statusCode: 400,
			error: 'jetpack_error',
			message: 'The Jetpack site is inaccessible or returned an error: transport error - HTTP status code was not 200 (500) [-32300]',
			name: 'JetpackErrorError'
		}
	}
};
