/* eslint-disable import/no-nodejs-modules */
import fs from 'node:fs';
import { entrypoints } from './constants.js';

const packageJson = JSON.parse( fs.readFileSync( 'package.json', 'utf8' ) );

// Clear exports before updating.
packageJson.exports = {};

for ( const [ $path, entrypoint ] of Object.entries( entrypoints ) ) {
	// Remove the extension from the entrypoint.
	const base = entrypoint.replace( /\.[a-z]+$/, '' );
	// If it's not root, then prepend "./"
	const name = $path === '.' ? '.' : `./${ $path }`;

	// Update exports for each entrypoint.
	packageJson.exports[ name ] = {
		'calypso:src': `./src/${ entrypoint }`,
		types: {
			import: `./dist/${ base }.d.ts`,
			require: `./dist/${ base }.d.cts`,
		},
		import: `./dist/${ base }.js`,
		require: `./dist/${ base }.cjs`,
	};

	// Update typesVersions for older Node versions.
	if ( '.' !== $path ) {
		packageJson.typesVersions[ '*' ][ $path ] = [ `./dist/${ base }.d.cts` ];
	}
}

fs.writeFileSync( 'package.json', JSON.stringify( packageJson, null, '\t' ) + '\n' );
