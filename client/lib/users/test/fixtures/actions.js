/**
 * Internal dependencies
 */

import site from './site';
import usersData from './users';
import moreUsersData from './more-users';
import deletedUserData from './deleted-user';
import updatedUserData from './updated-single-user';
import singleUserData from './single-user';
import pollingUsersData from './polling-users';

export default {
	fetched: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			siteId: site.ID,
			offset: 0,
		},
		data: usersData,
		error: null,
	},

	fetchMoreUsers: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			siteId: site.ID,
			offset: 5,
		},
		data: moreUsersData,
		error: null,
	},

	fetchAgainUserDeleted: {
		type: 'RECEIVE_USERS',
		fetchOptions: {
			siteId: site.ID,
			offset: 0,
		},
		data: deletedUserData,
		error: null,
	},

	updateSingleUser: {
		type: 'UPDATE_SITE_USER',
		siteId: site.ID,
		user: updatedUserData,
		data: updatedUserData,
	},

	deleteUser: {
		type: 'DELETE_SITE_USER',
		action: 'DELETE_SITE_USER',
		siteId: site.ID,
		user: usersData.users[ 0 ],
	},

	deleteUserError: {
		type: 'RECEIVE_DELETE_SITE_USER_FAILURE',
		action: 'DELETE_SITE_USER',
		siteId: site.ID,
		user: usersData.users[ 0 ],
		error: true,
	},

	deleteUserSuccess: {
		type: 'RECEIVE_DELETE_SITE_USER_SUCCESS',
		action: 'DELETE_SITE_USER',
		siteId: site.ID,
		user: usersData.users[ 0 ],
		data: { success: true },
	},

	updateUserError: {
		type: 'RECEIVE_UPDATE_SITE_USER_FAILURE',
		siteId: site.ID,
		user: usersData.users[ 0 ],
		error: true,
	},

	receiveSingleUser: {
		type: 'RECEIVE_SINGLE_USER',
		fetchOptions: {
			siteId: site.ID,
		},
		user: singleUserData,
		error: null,
	},

	receiveUpdatedUsers: {
		type: 'RECEIVE_UDPATED_USERS',
		fetchOptions: {
			siteId: site.ID,
			offset: 0,
			number: 7,
		},
		data: pollingUsersData,
		error: null,
	},
};
