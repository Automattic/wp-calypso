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
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
	GRAVATAR_RECEIVE_IMAGE_FAILURE,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_SAVE_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_CREATE_FAILURE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_DELETE_FAILURE,
	PUBLICIZE_CONNECTION_REFRESH,
	PUBLICIZE_CONNECTION_REFRESH_FAILURE,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTION_UPDATE_FAILURE,
	SITE_FRONT_PAGE_SET_FAILURE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS
} from 'state/action-types';

import { dispatchSuccess, dispatchError } from './utils';

import {
	onAccountRecoverySettingsFetchFailed,
	onAccountRecoverySettingsUpdateFailed,
	onAccountRecoverySettingsDeleteFailed,
} from './account-recovery';

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

export const onPublicizeConnectionCreate = ( dispatch, { connection } ) => dispatch(
	successNotice( translate( 'The %(service)s account was successfully connected.', {
		args: { service: connection.label },
		context: 'Sharing: Publicize connection confirmation'
	} ) )
);

export const onPublicizeConnectionDelete = ( dispatch, { connection } ) => dispatch(
	successNotice( translate( 'The %(service)s account was successfully disconnected.', {
		args: { service: connection.label },
		context: 'Sharing: Publicize connection confirmation'
	} ) )
);

export const onPublicizeConnectionDeleteFailure = ( dispatch, { error } ) => dispatch(
	errorNotice( translate( 'The %(service)s account was unable to be disconnected.', {
		args: { service: error.label },
		context: 'Sharing: Publicize connection confirmation'
	} ) )
);

export const onPublicizeConnectionRefresh = ( dispatch, { connection } ) => dispatch(
	successNotice( translate( 'The %(service)s account was successfully reconnected.', {
		args: { service: connection.label },
		context: 'Sharing: Publicize connection confirmation'
	} ) )
);

export const onPublicizeConnectionRefreshFailure = ( dispatch, { error } ) => dispatch(
	errorNotice( translate( 'The %(service)s account was unable to be reconnected.', {
		args: { service: error.label },
		context: 'Sharing: Publicize reconnection confirmation'
	} ) )
);

export const onPublicizeConnectionUpdate = ( dispatch, { connection } ) => dispatch(
	successNotice( translate( 'The %(service)s account was successfully updated.', {
		args: { service: connection.label },
		context: 'Sharing: Publicize connection confirmation'
	} ) )
);

export const onPublicizeConnectionUpdateFailure = ( dispatch, { error } ) => dispatch(
	errorNotice( translate( 'The %(service)s account was unable to be updated.', {
		args: { service: error.label },
		context: 'Sharing: Publicize reconnection confirmation'
	} ) )
);

export function onSiteSettingsSaveFailed( dispatch, action ) {
	let text;
	switch ( action.error.error ) {
		case 'invalid_ip':
			text = translate( 'One of your IP Addresses was invalid. Please try again.' );
			break;
		default:
			text = translate( 'There was a problem saving your changes. Please try again.' );
	}
	dispatch( errorNotice( text, { id: 'site-settings-save' } ) );
}

/**
 * Handler action type mapping
 */

export const handlers = {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]: onAccountRecoverySettingsFetchFailed,
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]: onAccountRecoverySettingsUpdateFailed,
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ]: onAccountRecoverySettingsDeleteFailed,
	[ GRAVATAR_RECEIVE_IMAGE_FAILURE ]: ( dispatch, action ) => {
		dispatch( errorNotice( action.errorMessage ) );
	},
	[ GRAVATAR_UPLOAD_REQUEST_FAILURE ]: dispatchError( translate( 'New Gravatar was not saved.' ) ),
	[ GRAVATAR_UPLOAD_REQUEST_SUCCESS ]: dispatchSuccess( translate( 'New Gravatar uploaded successfully!' ) ),
	[ POST_DELETE_FAILURE ]: onPostDeleteFailure,
	[ POST_DELETE_SUCCESS ]: dispatchSuccess( translate( 'Post successfully deleted' ) ),
	[ POST_RESTORE_FAILURE ]: onPostRestoreFailure,
	[ POST_RESTORE_SUCCESS ]: dispatchSuccess( translate( 'Post successfully restored' ) ),
	[ POST_SAVE_SUCCESS ]: onPostSaveSuccess,
	[ PUBLICIZE_CONNECTION_CREATE ]: onPublicizeConnectionCreate,
	[ PUBLICIZE_CONNECTION_CREATE_FAILURE ]: dispatchError( translate( 'An error occurred while connecting the account.' ) ),
	[ PUBLICIZE_CONNECTION_DELETE ]: onPublicizeConnectionDelete,
	[ PUBLICIZE_CONNECTION_DELETE_FAILURE ]: onPublicizeConnectionDeleteFailure,
	[ PUBLICIZE_CONNECTION_REFRESH ]: onPublicizeConnectionRefresh,
	[ PUBLICIZE_CONNECTION_REFRESH_FAILURE ]: onPublicizeConnectionRefreshFailure,
	[ PUBLICIZE_CONNECTION_UPDATE ]: onPublicizeConnectionUpdate,
	[ PUBLICIZE_CONNECTION_UPDATE_FAILURE ]: onPublicizeConnectionUpdateFailure,
	[ GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS ]: dispatchSuccess( translate( 'Thanks for confirming those details!' ) ),
	[ SITE_FRONT_PAGE_SET_FAILURE ]: dispatchError( translate( 'An error occurred while setting the homepage' ) ),
	[ SITE_SETTINGS_SAVE_SUCCESS ]: dispatchSuccess( translate( 'Settings saved!' ), { id: 'site-settings-save' } ),
	[ SITE_SETTINGS_SAVE_FAILURE ]: onSiteSettingsSaveFailed
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
