/**
 * External dependencies
 */
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';
import { truncate } from 'lodash';
const debug = debugFactory( 'calypso:invites-actions' );

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getInviteForSite } from 'calypso/state/invites/selectors';
import {
	INVITES_DELETE_REQUEST,
	INVITES_DELETE_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	INVITES_REQUEST,
	INVITES_REQUEST_FAILURE,
	INVITES_REQUEST_SUCCESS,
	INVITE_RESEND_REQUEST,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITE_RESEND_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

import 'calypso/state/invites/init';

/**
 * Triggers a network request to fetch invites for the specified site.
 *
 * @param  {?number}  siteId Site ID
 * @returns {Function}        Action thunk
 */
export function requestSiteInvites( siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: INVITES_REQUEST,
			siteId,
		} );

		wpcom
			.undocumented()
			.invitesList( siteId, { status: 'all', number: 100 } )
			.then( ( { found, invites, links } ) => {
				dispatch( {
					type: INVITES_REQUEST_SUCCESS,
					siteId,
					found,
					invites,
					links,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: INVITES_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

export function resendInvite( siteId, inviteId ) {
	return ( dispatch ) => {
		debug( 'resendInvite Action', siteId, inviteId );
		dispatch( {
			type: INVITE_RESEND_REQUEST,
			siteId: siteId,
			inviteId: inviteId,
		} );

		wpcom
			.undocumented()
			.resendInvite( siteId, inviteId )
			.then( ( data ) => {
				dispatch( {
					type: INVITE_RESEND_REQUEST_SUCCESS,
					siteId,
					inviteId,
					data,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: INVITE_RESEND_REQUEST_FAILURE,
					siteId,
					inviteId,
					error,
				} );
				dispatch( errorNotice( translate( 'Invitation failed to resend.' ) ) );
			} );
	};
}

export function deleteInvite( siteId, inviteId ) {
	return deleteInvites( siteId, [ inviteId ] );
}

const deleteInvitesFailureNotice = ( siteId, inviteIds ) => ( dispatch, getState ) => {
	for ( const inviteId of inviteIds ) {
		const invite = getInviteForSite( getState(), siteId, inviteId );
		dispatch(
			errorNotice(
				translate( 'An error occurred while deleting the invite for %s.', {
					args: truncate( invite.user.email || invite.user.login, { length: 20 } ),
				} )
			)
		);
	}
};

export function deleteInvites( siteId, inviteIds ) {
	return ( dispatch ) => {
		debug( 'deleteInvites Action', siteId, inviteIds );
		dispatch( {
			type: INVITES_DELETE_REQUEST,
			siteId: siteId,
			inviteIds: inviteIds,
		} );

		wpcom
			.undocumented()
			.site( siteId )
			.deleteInvites( inviteIds )
			.then( ( data ) => {
				if ( data.deleted.length > 0 ) {
					dispatch( {
						type: INVITES_DELETE_REQUEST_SUCCESS,
						siteId,
						inviteIds: data.deleted,
						data,
					} );
					dispatch(
						successNotice(
							translate( 'Invite deleted.', 'Invites deleted.', { count: inviteIds.length } ),
							{
								displayOnNextPage: true,
							}
						)
					);
				}

				// It's possible for the request to succeed, but the deletion to fail.
				if ( data.invalid.length > 0 ) {
					dispatch( {
						type: INVITES_DELETE_REQUEST_FAILURE,
						siteId,
						inviteIds: data.invalid,
						data,
					} );
					dispatch( deleteInvitesFailureNotice( siteId, inviteIds ) );
				}
			} )
			.catch( ( error ) => {
				dispatch( {
					type: INVITES_DELETE_REQUEST_FAILURE,
					siteId,
					inviteIds,
					error,
				} );
				dispatch( deleteInvitesFailureNotice( siteId, inviteIds ) );
			} );
	};
}
