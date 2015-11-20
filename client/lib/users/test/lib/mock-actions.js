var site = require( './mock-site' ),
	usersData = require( './mock-users-data' ),
	moreUsersData = require( './mock-more-users-data' ),
	deletedUserData = require( './mock-deleted-user-data' ),
	updatedUserData = require( './mock-updated-single-user' ),
	singleUserData = require( './mock-single-user' );

module.exports = {
	fetched: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			siteId: site.ID,
			offset: 0
		},
		data: usersData,
		error: null
	},

	fetchMoreUsers: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			siteId: site.ID,
			offset: 5
		},
		data: moreUsersData,
		error: null
	},

	fetchAgainUserDeleted: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			siteId: site.ID,
			offset: 0
		},
		data: deletedUserData,
		error: null
	},

	updateSingleUser: {
		type: 'UPDATE_SITE_USER',
		siteId: site.ID,
		user: updatedUserData,
		data: updatedUserData
	},

	deleteUser: {
		type: 'DELETE_SITE_USER',
		action: 'DELETE_SITE_USER',
		siteId: site.ID,
		user: usersData.users[0],
	},

	deleteUserError: {
		type: 'RECEIVE_DELETE_SITE_USER_FAILURE',
		action: 'DELETE_SITE_USER',
		siteId: site.ID,
		user: usersData.users[0],
		error: true
	},

	deleteUserSuccess: {
		type: 'RECEIVE_DELETE_SITE_USER_SUCCESS',
		action: 'DELETE_SITE_USER',
		siteId: site.ID,
		user: usersData.users[0],
		data: { success: true }
	},

	updateUserError: {
		type: 'RECEIVE_UPDATE_SITE_USER_FAILURE',
		siteId: site.ID,
		user: usersData.users[0],
		error: true
	},

	receiveSingleUser: {
		type: 'RECEIVE_SINGLE_USER',
		fetchOptions: {
			siteId: site.ID
		},
		user: singleUserData,
		error: null
	}
};
