/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
} from 'state/action-types';

export const requestWordAdsApproval = ( siteId ) => ( dispatch ) => {
	dispatch( {
		type: WORDADS_SITE_APPROVE_REQUEST,
		siteId,
	} );

	return wpcom
		.undocumented()
		.wordAdsApprove( siteId )
		.then( ( result ) => {
			dispatch( {
				type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
				approved: result.approved,
				siteId,
			} );
		} )
		.catch( ( error ) =>
			dispatch( {
				type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
				siteId,
				error: error.toString(),
			} )
		);
};

export const dismissWordAdsError = ( siteId ) => ( {
	type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
	siteId,
} );
export const dismissWordAdsSuccess = ( siteId ) => ( {
	type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_SUCCESS,
	siteId,
} );
