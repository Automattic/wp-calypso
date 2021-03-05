#!/usr/bin/env node

/**
 * Internal dependencies
 */
const api = require( './api' );

function main() {
	const args = process.argv.slice( 2 );
	if ( args.length === 0 || args.length === 1 ) {
		process.stdout.write(
			[
				'',
				'calypso-codemods codemodName[,additionalCodemods…] target1 [additionalTargets…]',
				'',
				'Valid transformation names:',
				api.getValidCodemodNames().join( '\n' ),
				'',
				'Example: "calypso-codemods commonjs-imports client/blocks client/devdocs"',
				'',
			].join( '\n' )
		);

		process.exit( 0 ); // eslint-disable-line no-process-exit
	}

	const [ names, ...targets ] = args;
	names.split( ',' ).forEach( ( codemodName ) => api.runCodemod( codemodName, targets ) );
}

main();
