/**
 * Internal dependencies
 */
import {
	WORDADS_SITE_APPROVE_REQUEST,
	WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
	WORDADS_SITE_APPROVE_REQUEST_FAILURE,
	WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
} from 'state/action-types';
import wpcom from 'lib/wp';

export const requestApproval = siteId => dispatch => {
	dispatch( {
		type: WORDADS_SITE_APPROVE_REQUEST,
		siteId
	} );

	return wpcom.undocumented().wordAdsApprove( siteId )
	.then( () => dispatch( {
		type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
		siteId
	} ) )
	.then( error => dispatch( {
		type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
		siteId,
		error: error
	} ) );
};

export const dismissError = () => ( { type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR } );
