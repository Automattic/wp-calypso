/**
 * Internal dependencies
 */

import site from './mock-site';
import followerData from './mock-wpcom-followers1';
import moreFollowerData from './mock-wpcom-followers2';

export default {
	fetchedFollowers: {
		type: 'RECEIVE_FOLLOWERS',
		fetchOptions: {
			siteId: site.ID,
			page: 1,
			max: 2,
		},
		data: followerData,
		error: null,
	},

	fetchedMoreFollowers: {
		type: 'RECEIVE_FOLLOWERS',
		fetchOptions: {
			siteId: site.ID,
			page: 2,
			max: 2,
		},
		data: moreFollowerData,
		error: null,
	},

	removeFollower: {
		type: 'REMOVE_FOLLOWER',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ],
	},

	removeFollowerSuccess: {
		type: 'RECEIVE_REMOVE_FOLLOWER_SUCCESS',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ],
	},

	removeFollowerError: {
		type: 'RECEIVE_REMOVE_FOLLOWER_ERROR',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ],
	},
};
