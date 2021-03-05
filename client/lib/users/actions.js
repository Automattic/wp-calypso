/**
 * External dependencies
 */

import debugFactory from 'debug';

const debug = debugFactory( 'calypso:users:actions' );

/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import wpcom from 'calypso/lib/wp';
import UsersStore from 'calypso/lib/users/store';

export function fetchUsers( fetchOptions ) {
	const paginationData = UsersStore.getPaginationData( fetchOptions );
	if ( paginationData.fetchingUsers ) {
		return;
	}
	debug( 'fetchUsers', fetchOptions );
	Dispatcher.handleViewAction( {
		type: 'FETCHING_USERS',
		fetchOptions: fetchOptions,
	} );

	wpcom.site( fetchOptions.siteId ).usersList( fetchOptions, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_USERS',
			fetchOptions: fetchOptions,
			data: data,
			error: error,
		} );
	} );
}

export function fetchUpdated( fetchOptions ) {
	const paginationData = UsersStore.getPaginationData( fetchOptions );
	if ( paginationData.fetchingUsers ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: 'FETCHING_UPDATED_USERS',
		fetchOptions: fetchOptions,
	} );

	const updatedFetchOptions = UsersStore.getUpdatedParams( fetchOptions );
	debug( 'Updated fetchOptions: ' + JSON.stringify( updatedFetchOptions ) );

	wpcom.site( fetchOptions.siteId ).usersList( updatedFetchOptions, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: 'RECEIVE_UPDATED_USERS',
			fetchOptions: fetchOptions,
			data: data,
			error: error,
		} );
	} );
}

export function deleteUser( siteId, userId, reassignUserId ) {
	debug( 'deleteUser', userId );
	const user = UsersStore.getUser( siteId, userId );
	if ( ! user ) {
		return;
	}
	Dispatcher.handleViewAction( {
		type: 'DELETE_SITE_USER',
		siteId: siteId,
		user: user,
	} );

	let attributes;
	if ( 'undefined' !== typeof reassignUserId ) {
		attributes = {
			reassign: reassignUserId,
		};
	}

	wpcom
		.undocumented()
		.site( siteId )
		.deleteUser( userId, attributes, ( error, data ) => {
			if ( error || ! data.success ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_DELETE_SITE_USER_FAILURE',
					action: 'DELETE_SITE_USER',
					siteId: siteId,
					user: user,
					error: error,
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_DELETE_SITE_USER_SUCCESS',
					action: 'DELETE_SITE_USER',
					siteId: siteId,
					user: user,
					data: data,
				} );
			}
		} );
}

export function updateUser( siteId, userId, attributes ) {
	debug( 'updateUser', userId );
	const user = UsersStore.getUser( siteId, userId );
	const updatedUser = Object.assign( user, attributes );

	if ( ! user ) {
		return;
	}

	Dispatcher.handleViewAction( {
		type: 'UPDATE_SITE_USER',
		siteId: siteId,
		user: updatedUser,
	} );
	wpcom
		.undocumented()
		.site( siteId )
		.updateUser( userId, attributes, ( error, data ) => {
			if ( error ) {
				debug( 'Update user error', error );
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_UPDATE_SITE_USER_FAILURE',
					action: 'UPDATE_SITE_USER',
					siteId: siteId,
					user: user,
					error: error,
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_UPDATE_SITE_USER_SUCCESS',
					action: 'UPDATE_SITE_USER',
					siteId: siteId,
					user: user,
					data: data,
				} );
			}
		} );
}

export function fetchUser( fetchOptions, login ) {
	debug( 'fetchUser', fetchOptions );

	Dispatcher.handleViewAction( {
		type: 'FETCHING_USERS',
		fetchOptions: fetchOptions,
	} );

	wpcom
		.undocumented()
		.site( fetchOptions.siteId )
		.getUser( login, ( error, data ) => {
			if ( error ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_USER_FAILED',
					fetchOptions: fetchOptions,
					siteId: fetchOptions.siteId,
					login: login,
					error: error,
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_SINGLE_USER',
					fetchOptions: fetchOptions,
					user: data,
				} );
			}
		} );
}
