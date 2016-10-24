var site = require( '../../fixtures/site' ),
	mockRoles = require( '../../fixtures/roles' );

module.exports = {
	fetchedRoles: {
		type: 'RECEIVE_ROLES',
		siteId: site.ID,
		data: mockRoles,
		error: null
	}
};
