/**
 * External dependencies
 */
import child_process from 'child_process';
import path from 'path';

const scriptPath = path.join( '.', 'bin', 'get-circle-string-artifact-url' );

describe( 'get-circle-string-artifact-url', () => {
	test( 'We can fetch translation strings from CircleCi artifacts', () => {
		const url = child_process.execSync( `node ${ scriptPath }` ).toString().trim();
		expect( url ).toMatch( /^https:\/\/.+\/calypso-strings\.pot$/ );
	} );
} );
