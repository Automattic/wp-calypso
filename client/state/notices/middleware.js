/** @format */
/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { truncate, includes } from 'lodash';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';
import { getSitePost } from 'state/posts/selectors';
import { getSiteDomain } from 'state/sites/selectors';
import { getInviteForSite } from 'state/invites/selectors';
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	GRAVATAR_RECEIVE_IMAGE_FAILURE,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	INVITES_DELETE_REQUEST_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE_FAILURE,
	KEYRING_CONNECTION_DELETE,
	KEYRING_CONNECTION_DELETE_FAILURE,
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_SAVE_SUCCESS,
	PUBLICIZE_CONNECTION_CREATE,
	PUBLICIZE_CONNECTION_CREATE_FAILURE,
	PUBLICIZE_CONNECTION_DELETE,
	PUBLICIZE_CONNECTION_DELETE_FAILURE,
	PUBLICIZE_CONNECTION_UPDATE,
	PUBLICIZE_CONNECTION_UPDATE_FAILURE,
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_RECEIVE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
	THEME_DELETE_FAILURE,
	THEME_DELETE_SUCCESS,
	THEME_ACTIVATE_FAILURE,
} from 'state/action-types';
import { purchasesRoot } from 'me/purchases/paths';
import { dispatchSuccess, dispatchError } from './utils';

import {
	onAccountRecoverySettingsFetchFailed,
	onAccountRecoverySettingsUpdateFailed,
	onAccountRecoverySettingsDeleteFailed,
	onAccountRecoverySettingsUpdateSuccess,
	onAccountRecoverySettingsDeleteSuccess,
	onResentAccountRecoveryEmailValidationSuccess,
	onResentAccountRecoveryEmailValidationFailed,
	onAccountRecoveryPhoneValidationSuccess,
	onAccountRecoveryPhoneValidationFailed,
} from './account-recovery';
import { onJetpackModuleActivationActionMessage } from './jetpack-modules';

/**
 * Handlers
 */

export const onDeleteInvitesFailure = ( dispatch, action, getState ) => {
	action.inviteIds.map( inviteId => {
		const invite = getInviteForSite( getState(), action.siteId, inviteId );
		dispatch(
			errorNotice(
				translate( 'An error occurred while deleting the invite for %s.', {
					args: truncate( invite.user.email, { length: 20 } ),
				} )
			)
		);
	} );
};

export const onDeleteInvitesSuccess = ( dispatch, { inviteIds } ) =>
	dispatch(
		successNotice(
			translate( 'Invite deleted.', 'Invites deleted.', { count: inviteIds.length } ),
			{ displayOnNextPage: true }
		)
	);

export function onPostDeleteFailure( dispatch, action, getState ) {
	const post = getSitePost( getState(), action.siteId, action.postId );

	let message;
	if ( post ) {
		message = translate( 'An error occurred while deleting "%s"', {
			args: [ truncate( post.title, { length: 24 } ) ],
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
			args: [ truncate( post.title, { length: 24 } ) ],
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

export const onPublicizeConnectionCreate = ( dispatch, { connection } ) =>
	dispatch(
		successNotice(
			translate( 'The %(service)s account was successfully connected.', {
				args: { service: connection.label },
				context: 'Sharing: Publicize connection confirmation',
			} ),
			{ id: 'publicize' }
		)
	);

export const onPublicizeConnectionCreateFailure = ( dispatch, { error } ) =>
	dispatch(
		errorNotice(
			error.message ||
				translate( 'An error occurred while connecting the account.', {
					context: 'Sharing: Publicize connection confirmation',
				} ),
			{ id: 'publicize' }
		)
	);

export const onPublicizeConnectionDelete = ( dispatch, { connection } ) =>
	dispatch(
		successNotice(
			translate( 'The %(service)s account was successfully disconnected.', {
				args: { service: connection.label },
				context: 'Sharing: Publicize connection confirmation',
			} ),
			{ id: 'publicize' }
		)
	);

export const onPublicizeConnectionDeleteFailure = ( dispatch, { error } ) =>
	dispatch(
		errorNotice(
			translate( 'The %(service)s account was unable to be disconnected.', {
				args: { service: error.label },
				context: 'Sharing: Publicize connection confirmation',
			} ),
			{ id: 'publicize' }
		)
	);

export const onPublicizeConnectionUpdate = ( dispatch, { connection } ) =>
	dispatch(
		successNotice(
			translate( 'The %(service)s account was successfully updated.', {
				args: { service: connection.label },
				context: 'Sharing: Publicize connection confirmation',
			} ),
			{ id: 'publicize' }
		)
	);

export const onPublicizeConnectionUpdateFailure = ( dispatch, { error } ) =>
	dispatch(
		errorNotice(
			translate( 'The %(service)s account was unable to be updated.', {
				args: { service: error.label },
				context: 'Sharing: Publicize reconnection confirmation',
			} ),
			{ id: 'publicize' }
		)
	);

const onThemeDeleteSuccess = ( dispatch, { themeName } ) =>
	dispatch(
		successNotice(
			translate( 'Deleted theme %(themeName)s.', {
				args: { themeName },
				context: 'Themes: Theme delete confirmation',
			} ),
			{ duration: 5000 }
		)
	);

const onThemeDeleteFailure = ( dispatch, { themeId } ) =>
	dispatch(
		errorNotice(
			translate( 'Problem deleting %(themeId)s. Check theme is not active.', {
				args: { themeId },
				context: 'Themes: Theme delete failure',
			} )
		)
	);

const onThemeActivateFailure = ( dispatch, { error } ) => {
	if ( includes( error.error, 'theme_not_found' ) ) {
		return dispatch( errorNotice( translate( 'Theme not yet available for this site' ) ) );
	}
	return dispatch( errorNotice( translate( 'Unable to activate theme. Contact support.' ) ) );
};

const onSiteMonitorSettingsUpdateSuccess = dispatch =>
	dispatch( successNotice( translate( 'Settings saved successfully!' ) ) );

const onSiteMonitorSettingsUpdateFailure = dispatch =>
	dispatch(
		successNotice( translate( 'There was a problem saving your changes. Please, try again.' ) )
	);

const onSiteDelete = ( dispatch, { siteId }, getState ) =>
	dispatch(
		successNotice(
			translate( '%(siteDomain)s is being deleted.', {
				args: { siteDomain: getSiteDomain( getState(), siteId ) },
			} ),
			{ duration: 5000, id: 'site-delete' }
		)
	);

const onSiteDeleteReceive = ( dispatch, { siteId, silent }, getState ) => {
	if ( silent ) {
		return;
	}

	return dispatch(
		successNotice(
			translate( '%(siteDomain)s has been deleted.', {
				args: { siteDomain: getSiteDomain( getState(), siteId ) },
			} ),
			{ duration: 5000, id: 'site-delete' }
		)
	);
};

const onSiteDeleteFailure = ( dispatch, { error } ) => {
	if ( error.error === 'active-subscriptions' ) {
		return dispatch(
			errorNotice(
				translate( 'You must cancel any active subscriptions prior to deleting your site.' ),
				{
					id: 'site-delete',
					showDismiss: false,
					button: translate( 'Manage Purchases' ),
					href: purchasesRoot,
				}
			)
		);
	}
	return dispatch( errorNotice( error.message ) );
};

/**
 * Handler action type mapping
 */

export const handlers = {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]: onAccountRecoverySettingsFetchFailed,
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS ]: onAccountRecoverySettingsUpdateSuccess,
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]: onAccountRecoverySettingsUpdateFailed,
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS ]: onAccountRecoverySettingsDeleteSuccess,
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ]: onAccountRecoverySettingsDeleteFailed,
	[ ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS ]: onResentAccountRecoveryEmailValidationSuccess,
	[ ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED ]: onResentAccountRecoveryEmailValidationFailed,
	[ ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS ]: onAccountRecoveryPhoneValidationSuccess,
	[ ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED ]: onAccountRecoveryPhoneValidationFailed,
	[ BILLING_RECEIPT_EMAIL_SEND_FAILURE ]: dispatchError(
		translate(
			'There was a problem sending your receipt. Please try again later or contact support.'
		)
	),
	[ BILLING_RECEIPT_EMAIL_SEND_SUCCESS ]: dispatchSuccess(
		translate( 'Your receipt was sent by email successfully.' )
	),
	[ GRAVATAR_RECEIVE_IMAGE_FAILURE ]: ( dispatch, action ) => {
		dispatch( errorNotice( action.errorMessage ) );
	},
	[ GRAVATAR_UPLOAD_REQUEST_FAILURE ]: dispatchError(
		translate( 'Hmm, your new Gravatar was not saved. Please try uploading again.' )
	),
	[ GRAVATAR_UPLOAD_REQUEST_SUCCESS ]: dispatchSuccess(
		translate( 'You successfully uploaded a new Gravatar — looking sharp!' )
	),
	[ INVITES_DELETE_REQUEST_SUCCESS ]: onDeleteInvitesSuccess,
	[ INVITES_DELETE_REQUEST_FAILURE ]: onDeleteInvitesFailure,
	[ INVITE_RESEND_REQUEST_FAILURE ]: dispatchError( translate( 'Invitation failed to resend.' ) ),
	[ JETPACK_MODULE_ACTIVATE_SUCCESS ]: onJetpackModuleActivationActionMessage,
	[ JETPACK_MODULE_DEACTIVATE_SUCCESS ]: onJetpackModuleActivationActionMessage,
	[ JETPACK_MODULE_ACTIVATE_FAILURE ]: onJetpackModuleActivationActionMessage,
	[ JETPACK_MODULE_DEACTIVATE_FAILURE ]: onJetpackModuleActivationActionMessage,
	[ KEYRING_CONNECTION_DELETE ]: onPublicizeConnectionDelete,
	[ KEYRING_CONNECTION_DELETE_FAILURE ]: onPublicizeConnectionDeleteFailure,
	[ POST_DELETE_FAILURE ]: onPostDeleteFailure,
	[ POST_DELETE_SUCCESS ]: dispatchSuccess( translate( 'Post successfully deleted' ) ),
	[ POST_RESTORE_FAILURE ]: onPostRestoreFailure,
	[ POST_RESTORE_SUCCESS ]: dispatchSuccess( translate( 'Post successfully restored' ) ),
	[ POST_SAVE_SUCCESS ]: onPostSaveSuccess,
	[ PUBLICIZE_CONNECTION_CREATE ]: onPublicizeConnectionCreate,
	[ PUBLICIZE_CONNECTION_CREATE_FAILURE ]: onPublicizeConnectionCreateFailure,
	[ PUBLICIZE_CONNECTION_DELETE ]: onPublicizeConnectionDelete,
	[ PUBLICIZE_CONNECTION_DELETE_FAILURE ]: onPublicizeConnectionDeleteFailure,
	[ PUBLICIZE_CONNECTION_UPDATE ]: onPublicizeConnectionUpdate,
	[ PUBLICIZE_CONNECTION_UPDATE_FAILURE ]: onPublicizeConnectionUpdateFailure,
	[ GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS ]: dispatchSuccess(
		translate( 'Thanks for confirming those details!' )
	),
	[ SITE_DELETE ]: onSiteDelete,
	[ SITE_DELETE_FAILURE ]: onSiteDeleteFailure,
	[ SITE_DELETE_RECEIVE ]: onSiteDeleteReceive,
	[ SITE_MONITOR_SETTINGS_UPDATE_SUCCESS ]: onSiteMonitorSettingsUpdateSuccess,
	[ SITE_MONITOR_SETTINGS_UPDATE_FAILURE ]: onSiteMonitorSettingsUpdateFailure,
	[ THEME_DELETE_FAILURE ]: onThemeDeleteFailure,
	[ THEME_DELETE_SUCCESS ]: onThemeDeleteSuccess,
	[ THEME_ACTIVATE_FAILURE ]: onThemeActivateFailure,
};

/**
 * Middleware
 */

export default ( { dispatch, getState } ) => next => action => {
	if ( handlers.hasOwnProperty( action.type ) ) {
		handlers[ action.type ]( dispatch, action, getState );
	}

	return next( action );
};
