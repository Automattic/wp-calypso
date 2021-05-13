/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { get, truncate } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { acceptedNotice } from 'calypso/my-sites/invites/utils';
import { getInviteForSite } from 'calypso/state/invites/selectors';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { requestSites, receiveSites } from 'calypso/state/sites/actions';
import {
	INVITES_DELETE_REQUEST,
	INVITES_DELETE_REQUEST_FAILURE,
	INVITES_DELETE_REQUEST_SUCCESS,
	INVITES_REQUEST,
	INVITES_REQUEST_FAILURE,
	INVITES_REQUEST_SUCCESS,
	INVITE_ACCEPTED,
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

function inviteAccepted( invite ) {
	return { type: INVITE_ACCEPTED, invite };
}

export function createAccount( userData, invite ) {
	return ( dispatch ) => {
		const result = wpcom.undocumented().usersNew( {
			...userData,
			validate: false,
			send_verification_email: userData.email !== invite.sentTo,
		} );

		result
			.then( () => {
				recordTracksEvent( 'calypso_invite_account_created', {
					is_p2_site: get( invite, 'site.is_wpforteams_site', false ),
					inviter_blog_id: get( invite, 'site.ID', false ),
				} );
			} )
			.catch( ( error ) => {
				if ( error.message ) {
					dispatch( errorNotice( error.message ) );
				}
				recordTracksEvent( 'calypso_invite_account_creation_failed', { error: error.error } );
			} );

		return result;
	};
}

export function generateInviteLinks( siteId ) {
	return ( dispatch ) => {
		wpcom
			.undocumented()
			.site( siteId )
			.generateInviteLinks()
			.then( () => {
				dispatch( requestSiteInvites( siteId ) );
			} );
	};
}

export function disableInviteLinks( siteId ) {
	return ( dispatch ) => {
		wpcom
			.undocumented()
			.site( siteId )
			.disableInviteLinks()
			.then( () => {
				dispatch( requestSiteInvites( siteId ) );
			} );
	};
}

export function acceptInvite( invite ) {
	return ( dispatch ) => {
		const result = wpcom.undocumented().acceptInvite( invite );
		result
			.then( ( data ) => {
				if ( invite.role !== 'follower' && invite.role !== 'viewer' ) {
					dispatch( receiveSites( data.sites ) );
				}

				if ( ! get( invite, 'site.is_vip' ) ) {
					dispatch( successNotice( ...acceptedNotice( invite ) ) );
				}

				recordTracksEvent( 'calypso_invite_accepted', {
					is_p2_site: get( invite, 'site.is_wpforteams_site', false ),
					inviter_blog_id: get( invite, 'site.ID', false ),
				} );

				dispatch( inviteAccepted( invite ) );
				dispatch( requestSites() );
			} )
			.catch( ( error ) => {
				if ( error.message ) {
					dispatch( errorNotice( error.message, { displayOnNextPage: true } ) );
				}
				recordTracksEvent( 'calypso_invite_accept_failed', { error: error.error } );
			} );

		return result;
	};
}
