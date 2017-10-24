/**
 * External dependencies
 *
 * @format
 */

import { defer } from 'lodash';

function fakeLoader( url, callback ) {
	fakeLoader.urlsLoaded.push( url );
	if ( callback ) {
		defer( callback );
	}
}

fakeLoader.urlsLoaded = [];

const exported = {
	loadScript: fakeLoader,
};

export default exported;
export { fakeLoader as loadScript };
