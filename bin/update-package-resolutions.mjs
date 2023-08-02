import fs from 'node:fs';
import path from 'node:path';

const packageJSONPath = path.resolve( process.cwd(), 'package.json' );
const packageFile = fs.readFileSync( packageJSONPath, 'utf-8' );
const packageJSON = JSON.parse( packageFile );

if ( ! packageJSON.resolutions ) {
	console.error( 'No resolutions found in package.json -- try running from the root directory.' );
	process.exit( 1 );
}

const toUpdate = process.argv[ 2 ] ?? '@wordpress';
let didUpdate = false;

await Promise.all(
	Object.entries( packageJSON.resolutions ).map( async ( [ pkg, version ] ) => {
		if ( ! pkg.startsWith( toUpdate ) ) {
			return;
		}
		const latestVersion = await getLatestVersion( pkg );

		// Handle ^ and ~ prefixes for very basic semver support.
		let currentVersion = version;
		const startingChar = version.startsWith( '^' ) || version.startsWith( '~' ) ? version[ 0 ] : '';
		if ( startingChar ) {
			currentVersion = currentVersion.slice( 1 );
		}

		if ( latestVersion && latestVersion !== currentVersion ) {
			console.log( `Updating ${ pkg } from ${ version } to ${ startingChar }${ latestVersion }` );
			packageJSON.resolutions[ pkg ] = startingChar + latestVersion;
			didUpdate = true;
		}
	} )
);

if ( didUpdate ) {
	// Use tab for spacing and append a new line after the JSON content to match our prettier format.
	fs.writeFileSync( packageJSONPath, JSON.stringify( packageJSON, null, '\t' ) + '\n' );
	console.log( 'Updated package.json resolutions.' );
} else {
	console.log( 'No updates were found.' );
}

async function getLatestVersion( pkg ) {
	const res = await fetch( `https://registry.npmjs.org/${ pkg }` );
	const pkgInfo = await res.json();
	return pkgInfo[ 'dist-tags' ].latest;
}
