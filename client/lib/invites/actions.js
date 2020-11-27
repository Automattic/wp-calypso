/**
 * External dependencies
 */

import Debug from 'debug';
import { get, isEmpty } from 'lodash';
import i18n from 'i18n-calypso';

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

export function sendInvites( siteId, usernamesOrEmails, role, message, formId, isExternal ) {
	return ( dispatch ) => {
		Dispatcher.handleViewAction( {
			type: ActionTypes.SENDING_INVITES,
			siteId,
			usernamesOrEmails,
			role,
			message,
			isExternal,
		} );
		wpcom
			.undocumented()
			.sendInvites( siteId, usernamesOrEmails, role, message, isExternal, ( error, data ) => {
				const validationErrors = get( data, 'errors' );
				const isErrored = !! error || ! isEmpty( validationErrors );

				Dispatcher.handleServerAction( {
					type: isErrored
						? ActionTypes.RECEIVE_SENDING_INVITES_ERROR
						: ActionTypes.RECEIVE_SENDING_INVITES_SUCCESS,
					error,
					siteId,
					usernamesOrEmails,
					role,
					message,
					formId,
					data,
					isExternal,
				} );

				if ( isErrored ) {
					// If there are no validation errors but the form errored, assume that all errored
					const countErrors =
						error || isEmpty( validationErrors ) || 'object' !== typeof validationErrors
							? usernamesOrEmails.length
							: Object.keys( data.errors ).length;

					if ( countErrors === usernamesOrEmails.length ) {
						message = i18n.translate( 'Invitation failed to send', 'Invitations failed to send', {
							count: countErrors,
							context: 'Displayed in a notice when all invitations failed to send.',
						} );
					} else {
						message = i18n.translate(
							'An invitation failed to send',
							'Some invitations failed to send',
							{
								count: countErrors,
								context: 'Displayed in a notice when some invitations failed to send.',
							}
						);
					}

					dispatch( errorNotice( message ) );
					recordTracksEvent( 'calypso_invite_send_failed' );
				} else {
					dispatch(
						successNotice(
							i18n.translate( 'Invitation sent successfully', 'Invitations sent successfully', {
								count: usernamesOrEmails.length,
							} )
						)
					);
					recordTracksEvent( 'calypso_invite_send_success', { role } );
				}
			} );
	};
}

export function createInviteValidation( siteId, usernamesOrEmails, role ) {
	Dispatcher.handleViewAction( {
		type: ActionTypes.CREATE_INVITE_VALIDATION,
		siteId,
		usernamesOrEmails,
		role,
	} );
	wpcom.undocumented().createInviteValidation( siteId, usernamesOrEmails, role, ( error, data ) => {
		Dispatcher.handleServerAction( {
			type: error
				? ActionTypes.RECEIVE_CREATE_INVITE_VALIDATION_ERROR
				: ActionTypes.RECEIVE_CREATE_INVITE_VALIDATION_SUCCESS,
			error,
			siteId,
			usernamesOrEmails,
			role,
			data,
		} );
		if ( error ) {
			recordTracksEvent( 'calypso_invite_create_validation_failed' );
		} else {
			recordTracksEvent( 'calypso_invite_create_validation_success' );
		}
	} );
}
