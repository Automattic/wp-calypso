function fakeLoader( url, callback ) {
	fakeLoader.urlsLoaded.push( url );
	if ( callback ) {
		setTimeout( function() { callback(); }, 0 );
	}
}

fakeLoader.urlsLoaded = [];

module.exports = { loadScript: fakeLoader };
