/**
 * Internal dependencies
 */
import {
	ADWORDS_SITE_APPROVE_REQUEST,
	ADWORDS_SITE_APPROVE_REQUEST_SUCCESS,
	ADWORDS_SITE_APPROVE_REQUEST_FAILURE,
	ADWORDS_SITE_APPROVE_REQUEST_DISMISS_ERROR,
} from 'state/action-types';
import wpcom from 'lib/wp';

export const requestApproval = siteId => dispatch => {
	dispatch( {
		type: ADWORDS_SITE_APPROVE_REQUEST,
		siteId
	} );

	return wpcom.undocumented().wordAdsApprove( siteId )
	.then( () => dispatch( {
		type: ADWORDS_SITE_APPROVE_REQUEST_SUCCESS,
		siteId
	} ) )
	.then( error => dispatch( {
		type: ADWORDS_SITE_APPROVE_REQUEST_FAILURE,
		siteId,
		error: error
	} ) );
};

export const dismissError = () => ( { type: ADWORDS_SITE_APPROVE_REQUEST_DISMISS_ERROR } );
