var site = require( './mock-site' ),
	followerData = require( './mock-email-followers' ),
	moreFollowerData = require( './mock-more-email-followers' );

module.exports = {
	fetchedFollowers: {
		type: 'RECEIVE_EMAIL_FOLLOWERS',
		fetchOptions: {
			siteId: site.ID,
			page: 1,
			max: 2
		},
		data: followerData,
		error: null
	},

	fetchedMoreFollowers: {
		type: 'RECEIVE_EMAIL_FOLLOWERS',
		fetchOptions: {
			siteId: site.ID,
			page: 2,
			max: 2
		},
		data: moreFollowerData,
		error: null
	},

	removeFollower: {
		type: 'REMOVE_EMAIL_FOLLOWER',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ]
	},

	removeFollowerSuccess: {
		type: 'RECEIVE_REMOVE_EMAIL_FOLLOWER_SUCCESS',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ]
	},

	removeFollowerError: {
		type: 'RECEIVE_REMOVE_EMAIL_FOLLOWER_ERROR',
		siteId: site.ID,
		follower: followerData.subscribers[ 0 ]
	}
};
