/**
 * External dependencies
 */

import { defer } from 'lodash';

function fakeLoader( url, callback ) {
	// eslint-disable-next-line no-undef
	google = {
		maps: {
			Geocoder: function () {
				return {
					geocode: function ( queryParams, result_callback ) {
						defer( result_callback, [ 1, 2, 3 ], 'OK' ); // fake the results
					},
				};
			},
		},
	};
	fakeLoader.urlsLoaded.push( url );
	if ( callback ) {
		defer( callback );
	}
}

fakeLoader.urlsLoaded = [];

export default { loadScript: fakeLoader };
