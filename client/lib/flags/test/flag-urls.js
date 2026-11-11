import { readdirSync } from 'node:fs';
import path from 'node:path';
import * as flagUrls from '../flag-urls';

describe( 'flag-urls', () => {
	test( 'has one URL per flag-icons 4x3 SVG (if not, run `node bin/generate-moment-locale-and-flag-maps.mjs`)', () => {
		const flagDir = path.join(
			path.dirname( require.resolve( 'flag-icons/package.json' ) ),
			'flags/4x3'
		);
		const expected = Object.fromEntries(
			readdirSync( flagDir )
				.filter( ( file ) => file.endsWith( '.svg' ) )
				.map( ( file ) => [ file.slice( 0, -4 ), file ] )
		);

		// The Jest file transform turns each SVG import into its file name.
		expect( { ...flagUrls } ).toEqual( expected );
	} );
} );
