/**
 * External dependencies
 */

import { defer } from 'lodash';

function fakeLoader( url, callback ) {
	fakeLoader.urlsLoaded.push( url );
	if ( callback ) {
		defer( callback );
	}
}

fakeLoader.urlsLoaded = [];

export default { loadScript: fakeLoader };
