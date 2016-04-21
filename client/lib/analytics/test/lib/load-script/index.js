import defer from 'lodash/defer';

function fakeLoader( url, callback ) {
	fakeLoader.urlsLoaded.push( url );
	if ( callback ) {
		defer( callback );
	}
}

fakeLoader.urlsLoaded = [];

module.exports = { loadScript: fakeLoader };
