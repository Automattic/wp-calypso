/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:followers-actions' );

/**
 * Internal dependencies
 */
var Dispatcher = require( 'dispatcher' ),
	wpcom = require( 'lib/wp' ),
	FollowersStore = require( 'lib/followers/store' );

var FollowersActions = {
	fetchFollowers: ( fetchOptions, silentUpdate = false ) => {
		const paginationData = FollowersStore.getPaginationData( fetchOptions );
		if ( paginationData.fetchingUsers ) {
			return;
		}
		debug( 'fetchFollowers', fetchOptions );
		if ( ! silentUpdate ) {
			Dispatcher.handleViewAction( {
				type: 'FETCHING_FOLLOWERS',
				fetchOptions: fetchOptions
			} );
		}
		wpcom.undocumented().site( fetchOptions.siteId ).fetchFollowers( fetchOptions, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_FOLLOWERS',
				fetchOptions: fetchOptions,
				data: data,
				error: error
			} );
		} );
	},

	removeFollower: ( siteId, follower ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_FOLLOWER',
			siteId: siteId,
			follower: follower
		} );
		wpcom.undocumented().site( siteId ).removeFollower( follower.ID, function( error, data ) {
			if ( error ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_REMOVE_FOLLOWER_ERROR',
					siteId: siteId,
					follower: follower,
					error: error
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_REMOVE_FOLLOWER_SUCCESS',
					siteId: siteId,
					follower: follower,
					data: data
				} );
			}
		} );
	}
};

module.exports = FollowersActions;
