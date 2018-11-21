/** @format */
/**
 * External dependencies
 */
import child_process from 'child_process';
import path from 'path';

const scriptPath = path.join( '.', 'bin', 'get-jetpack-blocks-artifacts.js' );

describe( 'get-jetpack-blocks-artifacts', () => {
	test( 'We can fetch jetpack-blocks artifacts from CircleCI', () => {
		const url = child_process
			.execSync( `node ${ scriptPath }` )
			.toString()
			.trim();
		expect( url ).toMatch( /\bhttps:\/\/.+\/jetpack-blocks\/editor\.js\b/ );
	} );
} );
