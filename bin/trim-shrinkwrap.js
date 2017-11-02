#!/usr/bin/env node

/**
 * Removes the redundant fields on the npm-shrinkwrap.json file.
 * Similar to `shonkwrap`, but rewritten to be multiplatform.
 * It's plain JS with no external dependencies.
 */

const fs = require( 'fs' );
const shrinkwrap = require( '../npm-shrinkwrap.json' );

( function removeOptionalDeps( root ) {
	if ( ! root.dependencies ) {
		return;
	}
	Object.keys( root.dependencies ).forEach( function ( dep ) {
		if ( root.dependencies[ dep ].optional ) {
			delete root.dependencies[ dep ];
		} else {
			removeOptionalDeps( root.dependencies[ dep ] );
		}
	} );
} )( shrinkwrap );

function isGitDep( rep ) {
	return /^git/.test( rep );
}
function replacer( key, val ) {
	if ( ! this.version ) {
		return val;
	}
	if ( key === "from" && ! isGitDep( this.resolved ) ) {
		return undefined;
	}
	if ( key === "resolved" && ! isGitDep( val ) && this.from !== val ) {
		return undefined;
	}
	return val;
}

fs.writeFileSync( __dirname + '/../npm-shrinkwrap.json', JSON.stringify( shrinkwrap, replacer, 2 ) );
