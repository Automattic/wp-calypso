/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';
import {
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_SAVE_SUCCESS
} from 'state/action-types';

/**
 * Utility
 */

export function dispatchSuccess( message ) {
	return ( dispatch ) => dispatch( successNotice( message ) );
}

/**
 * Handlers
 */

export function onPostDeleteFailure( dispatch, action, getState ) {
	const post = getSitePost( getState(), action.siteId, action.postId );

	let message;
	if ( post ) {
		message = translate( 'An error occurred while deleting "%s"', {
			args: [ truncate( post.title, { length: 24 } ) ]
		} );
	} else {
		message = translate( 'An error occurred while deleting the post' );
	}

	dispatch( errorNotice( message ) );
}

export function onPostRestoreFailure( dispatch, action, getState ) {
	const post = getSitePost( getState(), action.siteId, action.postId );

	let message;
	if ( post ) {
		message = translate( 'An error occurred while restoring "%s"', {
			args: [ truncate( post.title, { length: 24 } ) ]
		} );
	} else {
		message = translate( 'An error occurred while restoring the post' );
	}

	dispatch( errorNotice( message ) );
}

export function onPostSaveSuccess( dispatch, action ) {
	let text;
	switch ( action.post.status ) {
		case 'trash':
			text = translate( 'Post successfully moved to trash' );
			break;

		case 'publish':
			text = translate( 'Post successfully published' );
			break;
	}

	if ( text ) {
		dispatch( successNotice( text ) );
	}
}

export function onGuidedTransferHostDetailsSaveSuccess( dispatch ) {
	dispatch( successNotice( translate( 'Thanks for confirming those details!' ) ) );
}

export function onGuidedTransferHostDetailsSaveFailure( dispatch, { error } ) {
	if ( error && error.message ) {
		dispatch( errorNotice( error.message ) );
	} else {
		dispatch( errorNotice( translate( 'Whoops, there was an error saving your details. Please ' +
			"try again or send us a message and we'll help you get started." ) ) );
	}

	return false;
}

/**
 * Handler action type mapping
 */

export const handlers = {
	[ POST_DELETE_FAILURE ]: onPostDeleteFailure,
	[ POST_DELETE_SUCCESS ]: dispatchSuccess( translate( 'Post successfully deleted' ) ),
	[ POST_RESTORE_FAILURE ]: onPostRestoreFailure,
	[ POST_RESTORE_SUCCESS ]: dispatchSuccess( translate( 'Post successfully restored' ) ),
	[ POST_SAVE_SUCCESS ]: onPostSaveSuccess,
	[ GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS ]: onGuidedTransferHostDetailsSaveSuccess,
	[ GUIDED_TRANSFER_HOST_DETAILS_SAVE_FAILURE ]: onGuidedTransferHostDetailsSaveFailure,
};

/**
 * Middleware
 */

export default ( { dispatch, getState } ) => ( next ) => ( action ) => {
	if ( handlers.hasOwnProperty( action.type ) ) {
		handlers[ action.type ]( dispatch, action, getState );
	}

	return next( action );
};
