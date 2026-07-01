function fakeLoader( url, callback ) {
	fakeLoader.urlsLoaded.push( url );
	if ( callback ) {
		setTimeout( callback, 0 );
	}
}

fakeLoader.urlsLoaded = [];

export default { loadScript: fakeLoader };
