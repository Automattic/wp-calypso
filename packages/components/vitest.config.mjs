import { mergeConfig } from 'vitest/config';
import base from '../../test/packages/vitest.config.mjs';

export default mergeConfig( base, {
	plugins: [
		{
			// Keeps machine-specific asset paths out of snapshots.
			name: 'asset-basename',
			enforce: 'pre',
			load( id ) {
				const file = id.split( '?' )[ 0 ];
				if ( file.endsWith( '.svg' ) ) {
					return `export default ${ JSON.stringify( file.slice( file.lastIndexOf( '/' ) + 1 ) ) };`;
				}
			},
		},
	],
	test: { setupFiles: [ './vitest-setup.js' ] },
} );
