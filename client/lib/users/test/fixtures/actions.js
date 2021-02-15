/**
 * Internal dependencies
 */

import site from './site';
import usersData from './users';
import moreUsersData from './more-users';
import deletedUserData from './deleted-user';
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
