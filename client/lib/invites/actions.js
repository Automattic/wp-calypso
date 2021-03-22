/**
 * External dependencies
 */

import Debug from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { acceptedNotice } from 'calypso/my-sites/invites/utils';
import { requestSites, receiveSites } from 'calypso/state/sites/actions';
import { requestSiteInvites } from 'calypso/state/invites/actions';
import { INVITE_ACCEPTED } from 'calypso/state/action-types';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:invites-actions' );

function inviteAccepted( invite ) {
	return { type: INVITE_ACCEPTED, invite };
}

export function createAccount( userData, invite, callback ) {
	return ( dispatch ) => {
		wpcom.undocumented().usersNew(
			{
				...userData,
				validate: false,
				send_verification_email: userData.email !== invite.sentTo,
			},
			( error, response ) => {
				if ( error ) {
					if ( error.message ) {
						dispatch( errorNotice( error.message ) );
					}
					recordTracksEvent( 'calypso_invite_account_creation_failed', {
						error: error.error,
					} );
				} else {
					recordTracksEvent( 'calypso_invite_account_created', {
						is_p2_site: get( invite, 'site.is_wpforteams_site', false ),
						inviter_blog_id: get( invite, 'site.ID', false ),
					} );
				}
				callback( error, response );
			}
		);
	};
}

export function generateInviteLinks( siteId ) {
	debug( 'generateInviteLinks', siteId );

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
	debug( 'disableInviteLinks', siteId );

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

export function acceptInvite( invite, callback ) {
	return ( dispatch ) => {
		dispatch( inviteAccepted( invite ) );
		wpcom.undocumented().acceptInvite( invite, ( error, data ) => {
			if ( error ) {
				if ( error.message ) {
					dispatch( errorNotice( error.message, { displayOnNextPage: true } ) );
				}
				recordTracksEvent( 'calypso_invite_accept_failed', {
					error: error.error,
				} );
			} else {
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
			}
			dispatch( requestSites() );
			if ( typeof callback === 'function' ) {
				callback( error, data );
			}
		} );
	};
}
