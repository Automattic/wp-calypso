/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'calypso:invites-actions' );

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	INVITES_REQUEST,
	INVITES_REQUEST_FAILURE,
	INVITES_REQUEST_SUCCESS,
	INVITE_RESEND_REQUEST,
	INVITE_RESEND_REQUEST_FAILURE,
	INVITE_RESEND_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Triggers a network request to fetch invites for the specified site.
 *
 * @param  {?Number}  siteId Site ID
 * @return {Function}        Action thunk
 */
export function requestSiteInvites( siteId ) {
	return dispatch => {
		dispatch( {
			type: INVITES_REQUEST,
			siteId,
		} );

		wpcom
			.undocumented()
			.invitesList( siteId, { force: 'wpcom', status: 'all', number: 100 } )
			.then( ( { found, invites } ) => {
				dispatch( {
					type: INVITES_REQUEST_SUCCESS,
					siteId,
					found,
					invites,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: INVITES_REQUEST_FAILURE,
					siteId,
					error,
				} );
			} );
	};
}

export function resendInvite( siteId, inviteId ) {
	return dispatch => {
		debug( 'resendInvite Action', siteId, inviteId );
		dispatch( {
			type: INVITE_RESEND_REQUEST,
			siteId: siteId,
			inviteId: inviteId,
		} );

		wpcom
			.undocumented()
			.resendInvite( siteId, inviteId )
			.then( data => {
				dispatch( {
					type: INVITE_RESEND_REQUEST_SUCCESS,
					siteId,
					inviteId,
					data,
				} );
			} )
			.catch( error => {
				dispatch( {
					type: INVITE_RESEND_REQUEST_FAILURE,
					siteId,
					inviteId,
					error,
				} );
			} );
	};
}
