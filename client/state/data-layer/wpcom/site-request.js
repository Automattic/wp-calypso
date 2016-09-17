import {
	omit,
} from 'lodash';

import wpcom from 'lib/wp';

import {
	SITE_RECEIVE,
	SITE_REQUEST,
	SITE_REQUEST_SUCCESS,
	SITE_REQUEST_FAILURE,
} from 'state/action-types';

export const requestSite = ( { dispatch } ) => siteId => (
	wpcom
		.site( siteId )
		.get()
		.then( site => {
			dispatch( {
				type: SITE_RECEIVE,
				site: omit( site, '_headers' )
			} );
			dispatch( {
				type: SITE_REQUEST_SUCCESS,
				siteId
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: SITE_REQUEST_FAILURE,
				siteId,
				error
			} );
		} )
);

export default [ SITE_REQUEST, requestSite ];
