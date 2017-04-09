var site = require( './mock-site' ),
	followerData = require( './mock-wpcom-followers1' ),
	moreFollowerData = require( './mock-wpcom-followers2' );

module.exports = {
	fetchedFollowers: {
		type: 'RECEIVE_FOLLOWERS',
		fetchOptions: {
			siteId: site.ID,
			page: 1,
			max: 2
		},
		data: followerData,
		error: null
	},

	fetchedMoreFollowers: {
		type: 'RECEIVE_FOLLOWERS',
		fetchOptions: {
			siteId: site.ID,
			page: 2,
			max: 2
		},
		data: moreFollowerData,
		error: null
	},

	removeFollower: {
		type: 'REMOVE_FOLLOWER',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ]
	},

	removeFollowerSuccess: {
		type: 'RECEIVE_REMOVE_FOLLOWER_SUCCESS',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ]
	},

	removeFollowerError: {
		type: 'RECEIVE_REMOVE_FOLLOWER_ERROR',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ]
	}
};
