/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, truncate } from 'lodash';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getSiteDomain } from 'calypso/state/sites/selectors';
import { getInviteForSite } from 'calypso/state/invites/selectors';
import {
	GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	INVITES_DELETE_REQUEST_FAILURE,
	SITE_DELETE,
	SITE_DELETE_FAILURE,
	SITE_DELETE_RECEIVE,
} from 'calypso/state/action-types';
import { purchasesRoot } from 'calypso/me/purchases/paths';

/**
 * Handlers
 */

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

const onGuidedTransferHostDetailsSaveSuccess = () =>
	successNotice( translate( 'Thanks for confirming those details!' ) );

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

/**
 * Handler action type mapping
 */

export const handlers = {
	[ INVITES_DELETE_REQUEST_SUCCESS ]: onDeleteInvitesSuccess,
	[ INVITES_DELETE_REQUEST_FAILURE ]: onDeleteInvitesFailure,
	[ INVITE_RESEND_REQUEST_FAILURE ]: onInviteResendRequestFailure,
	[ GUIDED_TRANSFER_HOST_DETAILS_SAVE_SUCCESS ]: onGuidedTransferHostDetailsSaveSuccess,
	[ SITE_DELETE ]: onSiteDelete,
	[ SITE_DELETE_FAILURE ]: onSiteDeleteFailure,
	[ SITE_DELETE_RECEIVE ]: onSiteDeleteReceive,
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
