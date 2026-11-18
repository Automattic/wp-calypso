import { readdirSync } from 'node:fs';
import path from 'node:path';
import momentLocaleLoaders from '../moment-locale-loaders';

describe( 'moment-locale-loaders', () => {
	test( 'has one loader per moment/locale file (if not, run `node bin/generate-moment-locale-and-flag-maps.mjs`)', () => {
		const localeDir = path.join(
			path.dirname( require.resolve( 'moment/package.json' ) ),
			'locale'
		);
		const locales = readdirSync( localeDir )
			.filter( ( file ) => file.endsWith( '.js' ) )
			.map( ( file ) => file.slice( 0, -3 ) )
			.sort();

		expect( Object.keys( momentLocaleLoaders ).sort() ).toEqual( locales );
	} );
} );
