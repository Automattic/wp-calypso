import { flattenTitle } from '../entity-title';

describe( 'flattenTitle', () => {
	it.each( [
		[ 'About', 'About' ],
		[ { raw: 'About & More', rendered: 'About &amp; More' }, 'About & More' ],
		[ { rendered: 'About &amp; More' }, 'About & More' ],
		// A raw call can send any type; only a string member is a title.
		[ { raw: 7, rendered: 'About' }, 'About' ],
		[ { raw: 7 }, '' ],
		[ null, '' ],
		[ undefined, '' ],
	] )( 'flattens %p to %p', ( title, expected ) => {
		expect( flattenTitle( title ) ).toBe( expected );
	} );
} );
