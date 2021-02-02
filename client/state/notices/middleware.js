/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice, removeNotice } from 'calypso/state/notices/actions';
import { getSitePost } from 'calypso/state/posts/selectors';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getInviteForSite } from 'calypso/state/invites/selectors';
import { restorePost } from 'calypso/state/posts/actions';
import {
	BILLING_RECEIPT_EMAIL_SEND_FAILURE,
	BILLING_RECEIPT_EMAIL_SEND_SUCCESS,
	BILLING_TRANSACTION_REQUEST_FAILURE,
	GRAVATAR_RECEIVE_IMAGE_FAILURE,
	GRAVATAR_UPLOAD_REQUEST_FAILURE,
	GRAVATAR_UPLOAD_REQUEST_SUCCESS,
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	INVITES_DELETE_REQUEST_FAILURE,
	POST_DELETE_FAILURE,
	POST_DELETE_SUCCESS,
	POST_RESTORE_FAILURE,
	POST_RESTORE_SUCCESS,
	POST_SAVE_SUCCESS,
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_RECEIVE,
	SITE_MONITOR_SETTINGS_UPDATE_SUCCESS,
	SITE_MONITOR_SETTINGS_UPDATE_FAILURE,
} from 'calypso/state/action-types';
import { purchasesRoot, billingHistoryReceipt } from 'calypso/me/purchases/paths';

/**
 * Handlers
 */

export const onBillingReceiptEmailSendFailure = () =>
	errorNotice(
		translate(
			'There was a problem sending your receipt. Please try again later or contact support.'
		)
	);

export const onBillingReceiptEmailSendSuccess = () =>
	successNotice( translate( 'Your receipt was sent by email successfully.' ) );

export const onGravatarReceiveImageFailure = ( action ) => errorNotice( action.errorMessage );

export const onGravatarUploadRequestFailure = () =>
	errorNotice(
		translate( 'Hmm, your new profile photo was not saved. Please try uploading again.' )
	);

export const onGravatarUploadRequestSuccess = () =>
	successNotice( translate( 'You successfully uploaded a new profile photo — looking sharp!' ) );

export const onDeleteInvitesFailure = ( action ) => ( dispatch, getState ) => {
	for ( const inviteId of action.inviteIds ) {
		const invite = getInviteForSite( getState(), action.siteId, inviteId );
		dispatch(
			errorNotice(
				translate( 'An error occurred while deleting the invite for %s.', {
					args: truncate( invite.user.email, { length: 20 } ),
				} )
			)
		);
	}
};

export const onDeleteInvitesSuccess = ( { inviteIds } ) =>
	successNotice( translate( 'Invite deleted.', 'Invites deleted.', { count: inviteIds.length } ), {
		displayOnNextPage: true,
	} );

export const onInviteResendRequestFailure = () =>
	errorNotice( translate( 'Invitation failed to resend.' ) );

export const onPostDeleteFailure = ( action ) => ( dispatch, getState ) => {
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
};

const onPostDeleteSuccess = () => successNotice( translate( 'Post successfully deleted' ) );

export const onPostRestoreFailure = ( action ) => ( dispatch, getState ) => {
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
};

const onPostRestoreSuccess = () => successNotice( translate( 'Post successfully restored' ) );

export const onPostSaveSuccess = ( { post, savedPost } ) => ( dispatch ) => {
	switch ( post.status ) {
		case 'trash': {
			const noticeId = 'trash_' + savedPost.global_ID;
			dispatch(
				successNotice( translate( 'Post successfully moved to trash.' ), {
					id: noticeId,
					button: translate( 'Undo' ),
					onClick: () => {
						dispatch( removeNotice( noticeId ) );
						dispatch( restorePost( savedPost.site_ID, savedPost.ID ) );
					},
				} )
			);
			break;
		}

		case 'publish': {
			dispatch( successNotice( translate( 'Post successfully published' ) ) );
			break;
		}
	}
};

const onGuidedTransferHostDetailsSaveSuccess = () =>
	successNotice( translate( 'Thanks for confirming those details!' ) );

const onSiteMonitorSettingsUpdateSuccess = () =>
	successNotice( translate( 'Settings saved successfully!' ) );

const onSiteMonitorSettingsUpdateFailure = () =>
	successNotice( translate( 'There was a problem saving your changes. Please, try again.' ) );

const onSiteDelete = ( { siteId } ) => ( dispatch, getState ) => {
	const siteDomain = getSiteDomain( getState(), siteId );

	dispatch(
		successNotice( translate( '%(siteDomain)s is being deleted.', { args: { siteDomain } } ), {
			duration: 5000,
			id: 'site-delete',
		} )
	);
};

const onSiteDeleteReceive = ( { siteId } ) => ( dispatch, getState ) => {
	const siteDomain = getSiteDomain( getState(), siteId );

	dispatch(
		successNotice( translate( '%(siteDomain)s has been deleted.', { args: { siteDomain } } ), {
			duration: 5000,
			id: 'site-delete',
		} )
	);
};

const onSiteDeleteFailure = ( { error } ) => {
	if ( error.error === 'active-subscriptions' ) {
		return errorNotice(
			translate( 'You must cancel any active subscriptions prior to deleting your site.' ),
			{
				id: 'site-delete',
				showDismiss: false,
				button: translate( 'Manage Purchases' ),
				href: purchasesRoot,
			}
		);
	}
	return errorNotice( error.message );
};

export const onBillingTransactionRequestFailure = ( { transactionId, error } ) => {
	const displayOnNextPage = true;
	const id = `transaction-fetch-${ transactionId }`;
	if ( 'invalid_receipt' === error.error ) {
		return errorNotice(
			translate( "Sorry, we couldn't find receipt #%s.", { args: transactionId } ),
			{
				id,
				displayOnNextPage,
				duration: 5000,
			}
		);
	}

	return errorNotice( translate( "Sorry, we weren't able to load the requested receipt." ), {
		id,
		displayOnNextPage,
		button: translate( 'Try again' ),
		href: billingHistoryReceipt( transactionId ),
	} );
};

/**
 * Handler action type mapping
 */

export const handlers = {
	[ BILLING_RECEIPT_EMAIL_SEND_FAILURE ]: onBillingReceiptEmailSendFailure,
	[ BILLING_RECEIPT_EMAIL_SEND_SUCCESS ]: onBillingReceiptEmailSendSuccess,
	[ BILLING_TRANSACTION_REQUEST_FAILURE ]: onBillingTransactionRequestFailure,
	[ GRAVATAR_RECEIVE_IMAGE_FAILURE ]: onGravatarReceiveImageFailure,
	[ GRAVATAR_UPLOAD_REQUEST_FAILURE ]: onGravatarUploadRequestFailure,
	[ GRAVATAR_UPLOAD_REQUEST_SUCCESS ]: onGravatarUploadRequestSuccess,
	[ INVITES_DELETE_REQUEST_SUCCESS ]: onDeleteInvitesSuccess,
	[ INVITES_DELETE_REQUEST_FAILURE ]: onDeleteInvitesFailure,
	[ INVITE_RESEND_REQUEST_FAILURE ]: onInviteResendRequestFailure,
	[ POST_DELETE_FAILURE ]: onPostDeleteFailure,
	[ POST_DELETE_SUCCESS ]: onPostDeleteSuccess,
	[ POST_RESTORE_FAILURE ]: onPostRestoreFailure,
	[ POST_RESTORE_SUCCESS ]: onPostRestoreSuccess,
	[ POST_SAVE_SUCCESS ]: onPostSaveSuccess,
	[ GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS ]: onGuidedTransferHostDetailsSaveSuccess,
	[ SITE_DELETE ]: onSiteDelete,
	[ SITE_DELETE_FAILURE ]: onSiteDeleteFailure,
	[ SITE_DELETE_RECEIVE ]: onSiteDeleteReceive,
	[ SITE_MONITOR_SETTINGS_UPDATE_SUCCESS ]: onSiteMonitorSettingsUpdateSuccess,
	[ SITE_MONITOR_SETTINGS_UPDATE_FAILURE ]: onSiteMonitorSettingsUpdateFailure,
};

/**
 * Middleware
 */

export default ( store ) => ( next ) => ( action ) => {
	const rv = next( action );

	if ( ! get( action, 'meta.notices.skip' ) && handlers.hasOwnProperty( action.type ) ) {
		const noticeAction = handlers[ action.type ]( action );
		if ( noticeAction ) {
			store.dispatch( noticeAction );
		}
	}

	return rv;
};
