import { sameUrl, urlKey } from '../same-url';

describe( 'urlKey', () => {
	it.each( [
		[ '/about/', 'http://localhost/about' ],
		[ 'http://localhost/about', 'http://localhost/about' ],
		[ '/about/?p=1#team', 'http://localhost/about?p=1#team' ],
		[ undefined, null ],
		[ null, null ],
		[ '  ', null ],
		[ { url: '/about/' }, null ],
	] )( 'reduces %p to %p', ( url, expected ) => {
		expect( urlKey( url ) ).toBe( expected );
	} );
} );

describe( 'sameUrl', () => {
	it.each( [
		[ '/about/', 'http://localhost/about', true ],
		[ '/about/#team', '/about/#contact', true ],
		[ '/about/?p=1', '/about/', false ],
		// Not a url on either side is never the same place.
		[ undefined, undefined, false ],
	] )( 'compares %p and %p as %p', ( a, b, expected ) => {
		expect( sameUrl( a, b ) ).toBe( expected );
	} );
} );
