var site = require( './mock-site' ),
	mockRoles = require( './mock-roles' );

module.exports = {
	fetchedRoles: {
		type: 'RECEIVE_ROLES',
		siteId: site.ID,
		data: mockRoles,
		error: null
	}
};
