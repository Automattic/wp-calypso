import wpcom from 'lib/wp';

import {
	SITES_RECEIVE,
	SITES_REQUEST,
	SITES_REQUEST_FAILURE,
	SITES_REQUEST_SUCCESS,
} from 'state/action-types';

export const requestSites = ( { dispatch } ) => () => (
	wpcom
		.me()
		.sites( { site_visibility: 'all' } )
		.then( ( { sites } ) => {
			dispatch( {
				type: SITES_RECEIVE,
				sites
			} );
			dispatch( {
				type: SITES_REQUEST_SUCCESS
			} );
		} )
		.catch( error => dispatch( {
			type: SITES_REQUEST_FAILURE,
			error
		} ) )
);

export default [ SITES_REQUEST, requestSites ];
