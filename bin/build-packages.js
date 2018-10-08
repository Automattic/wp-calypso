#!/usr/bin/env node

// find all the packages
const glob = require('glob');
const {execSync} = require('child_process');
const path = require('path');

glob( 'packages/*/package.json', ( err, matches ) => {
	if ( err ) { console.error( err ); return; }

	matches.forEach( match => {
		const dir = path.dirname( match );
		const inputDir = path.join( dir, 'src' );
		const outputDir = path.join( dir, 'dist', 'esm' );
		console.log( `Building ${ dir }...` );
		execSync( `node ./node_modules/.bin/babel -d ${outputDir} ${inputDir}`, {
			env: Object.assign( {}, process.env, { CALYPSO_CLIENT: 'true' } )
		} );
	 } );
	 console.log('Done building packages');
} );
