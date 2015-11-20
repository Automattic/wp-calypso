var site = require( './mock-site' );

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
			_headers: {
				Date: 'Fri, 21 Aug 2015 02:48:06 GMT',
				'Content-Type': 'application/json'
			},
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
			_headers: {
				Date: 'Sun, 23 Aug 2015 15:39:53 GMT',
				'Content-Type': 'application/json'
			},
			name: 'JetpackErrorError'
		}
	}
};
