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
import Sites from 'lib/sites-list';

export const requestApproval = siteId => dispatch => {
	dispatch( {
		type: WORDADS_SITE_APPROVE_REQUEST,
		siteId
	} );

	return wpcom.undocumented().wordAdsApprove( siteId )
	.then( result => {
		if ( result.approved ) {
			//We need to propagate this change to flux
			const site = Sites().getSite( siteId );
			if ( ! site.options.wordads ) {
				site.options.wordads = true;
				site.emit( 'change' );
			}
		}

		dispatch( {
			type: WORDADS_SITE_APPROVE_REQUEST_SUCCESS,
			approved: result.approved,
			siteId
		} );
	} )
	.catch( error => dispatch( {
		type: WORDADS_SITE_APPROVE_REQUEST_FAILURE,
		siteId,
		error: error.toString()
	} ) );
};

export const dismissError = () => ( { type: WORDADS_SITE_APPROVE_REQUEST_DISMISS_ERROR } );
