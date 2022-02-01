import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import { get, truncate } from 'lodash';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import wpcom from 'calypso/lib/wp';
import { acceptedNotice } from 'calypso/my-sites/invites/utils';
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
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { getInviteForSite } from 'calypso/state/invites/selectors';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { receiveSite } from 'calypso/state/sites/actions';

import 'calypso/state/invites/init';

/**
 * Triggers a network request to fetch invites for the specified site.
 *
 * @param  {?number}  siteId Site ID
 * @returns {Function}        Action thunk
 */
export function requestSiteInvites( siteId ) {
	return async ( dispatch ) => {
		dispatch( {
			type: INVITES_REQUEST,
			siteId,
		} );

		try {
			const { found, invites, links } = await wpcom.req.get( `/sites/${ siteId }/invites`, {
				status: 'all',
				number: 100,
			} );

			dispatch( {
				type: INVITES_REQUEST_SUCCESS,
				siteId,
				found,
				invites,
				links,
			} );
		} catch ( error ) {
			dispatch( {
				type: INVITES_REQUEST_FAILURE,
				siteId,
				error,
			} );
		}
	};
}

export function resendInvite( siteId, inviteId ) {
	return async ( dispatch ) => {
		dispatch( {
			type: INVITE_RESEND_REQUEST,
			siteId: siteId,
			inviteId: inviteId,
		} );

		try {
			const data = await wpcom.req.post( `/sites/${ siteId }/invites/${ inviteId }/resend` );
			dispatch( {
				type: INVITE_RESEND_REQUEST_SUCCESS,
				siteId,
				inviteId,
				data,
			} );
		} catch ( error ) {
			dispatch( {
				type: INVITE_RESEND_REQUEST_FAILURE,
				siteId,
				inviteId,
				error,
			} );
			dispatch( errorNotice( translate( 'Invitation failed to resend.' ) ) );
		}
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
	return async ( dispatch ) => {
		dispatch( {
			type: INVITES_DELETE_REQUEST,
			siteId: siteId,
			inviteIds: inviteIds,
		} );

		try {
			const data = await wpcom.req.post(
				{
					path: `/sites/${ siteId }/invites/delete`,
					apiNamespace: 'wpcom/v2',
				},
				{
					invite_ids: inviteIds,
				}
			);

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
		} catch ( error ) {
			dispatch( {
				type: INVITES_DELETE_REQUEST_FAILURE,
				siteId,
				inviteIds,
				error,
			} );
			dispatch( deleteInvitesFailureNotice( siteId, inviteIds ) );
		}
	};
}

function inviteAccepted( invite ) {
	return { type: INVITE_ACCEPTED, invite };
}

export function createAccount( userData, invite ) {
	return ( dispatch ) => {
		const result = wpcom.req.post( '/users/new', {
			...userData,
			validate: false,
			send_verification_email: userData.email !== invite.sentTo,
			locale: getLocaleSlug(),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
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
	return async ( dispatch ) => {
		await wpcom.req.post( {
			path: `/sites/${ siteId }/invites/links/generate`,
			apiNamespace: 'wpcom/v2',
		} );
		dispatch( requestSiteInvites( siteId ) );
	};
}

export function disableInviteLinks( siteId ) {
	return async ( dispatch ) => {
		await wpcom.req.post( {
			path: `/sites/${ siteId }/invites/links/disable`,
			apiNamespace: 'wpcom/v2',
		} );
		dispatch( requestSiteInvites( siteId ) );
	};
}

export function acceptInvite( invite ) {
	return async ( dispatch ) => {
		try {
			const data = await wpcom.req.get(
				`/sites/${ invite.site.ID }/invites/${ invite.inviteKey }/accept`,
				{
					activate: invite.activationKey,
					include_domain_only: true,
					apiVersion: '1.3',
				}
			);

			if ( invite.role !== 'follower' && invite.role !== 'viewer' ) {
				dispatch( receiveSite( data.site ) );
				await dispatch( fetchCurrentUser() );
			}

			if ( ! invite.site.is_vip ) {
				dispatch( successNotice( ...acceptedNotice( invite ) ) );
			}

			recordTracksEvent( 'calypso_invite_accepted', {
				is_p2_site: invite.site.is_wpforteams_site ?? false,
				inviter_blog_id: invite.site.ID,
			} );

			dispatch( inviteAccepted( invite ) );
			return data;
		} catch ( error ) {
			if ( error.message ) {
				dispatch( errorNotice( error.message ) );
			}
			recordTracksEvent( 'calypso_invite_accept_failed', { error: error.error } );
			throw error;
		}
	};
}
