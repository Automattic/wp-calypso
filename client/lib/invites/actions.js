/**
 * External dependencies
 */

import Debug from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import Dispatcher from 'calypso/dispatcher';
import wpcom from 'calypso/lib/wp';
import { action as ActionTypes } from 'calypso/lib/invites/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { acceptedNotice } from 'calypso/my-sites/invites/utils';
import { requestSites, receiveSites } from 'calypso/state/sites/actions';
import { requestSiteInvites } from 'calypso/state/invites/actions';

/**
 * Module variables
 */
const debug = new Debug( 'calypso:invites-actions' );

export function createAccount( userData, invite, callback ) {
	const send_verification_email = userData.email !== invite.sentTo;

	return ( dispatch ) => {
		wpcom
			.undocumented()
			.usersNew(
				Object.assign( {}, userData, { validate: false, send_verification_email } ),
				( error, response ) => {
					const bearerToken = response && response.bearer_token;
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
					callback( error, bearerToken );
				}
			);
	};
}

export function generateInviteLinks( siteId ) {
	debug( 'generateInviteLinks', siteId );

	return ( dispatch ) => {
		debug( 'generateInviteLinks API request', siteId );
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
		Dispatcher.handleViewAction( {
			type: ActionTypes.INVITE_ACCEPTED,
			invite,
		} );
		wpcom.undocumented().acceptInvite( invite, ( error, data ) => {
			dispatch( {
				type: error
					? ActionTypes.RECEIVE_INVITE_ACCEPTED_ERROR
					: ActionTypes.RECEIVE_INVITE_ACCEPTED_SUCCESS,
				error,
				invite,
				data,
			} );
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
