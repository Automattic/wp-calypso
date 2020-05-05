/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:email-followers-actions' );

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';
import EmailFollowersStore from 'lib/email-followers/store';

const EmailFollowersActions = {
	fetchFollowers: ( fetchOptions, silentUpdate = false ) => {
		Object.assign( fetchOptions, { type: 'email' } );
		const paginationData = EmailFollowersStore.getPaginationData( fetchOptions );
		if ( paginationData.fetchingUsers ) {
			return;
		}
		debug( 'fetchFollowers', fetchOptions );
		if ( ! silentUpdate ) {
			Dispatcher.handleViewAction( {
				type: 'FETCHING_EMAIL_FOLLOWERS',
				fetchOptions: fetchOptions,
			} );
		}
		wpcom
			.undocumented()
			.site( fetchOptions.siteId )
			.fetchFollowers( fetchOptions, function ( error, data ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_EMAIL_FOLLOWERS',
					fetchOptions: fetchOptions,
					data: data,
					error: error,
				} );
			} );
	},

	removeFollower: ( siteId, follower ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_EMAIL_FOLLOWER',
			siteId: siteId,
			follower: follower,
		} );
		wpcom
			.undocumented()
			.site( siteId )
			.removeEmailFollower( follower.ID, function ( error, data ) {
				if ( error ) {
					Dispatcher.handleServerAction( {
						type: 'RECEIVE_REMOVE_EMAIL_FOLLOWER_ERROR',
						siteId: siteId,
						follower: follower,
						error: error,
					} );
				} else {
					Dispatcher.handleServerAction( {
						type: 'RECEIVE_REMOVE_EMAIL_FOLLOWER_SUCCESS',
						siteId: siteId,
						follower: follower,
						data: data,
					} );
				}
			} );
	},
};

export default EmailFollowersActions;
