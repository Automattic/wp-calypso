/**
 * Module dependencies
 */

import debugFactory from 'debug';
const debug = debugFactory( 'calypso:sync-handler:whitelist' );

const whitelist = [
	/^\/me\/posts$/,
	/^\/me\/settings/,
	/^\/sites\/[\w.]+\/posts$/
];

export const isWhitelisted = params => {
	const { path } = params;

	if ( params.method && 'get' !== params.method.toLowerCase() ) {
		debug( 'No allow %o request', params.method );
		return false;
	};

	for ( let i = 0; i < whitelist.length; i++ ) {
		if ( whitelist[ i ].test( path ) ) {
			debug( '%o whitelisted', path );
			return true;
		}
	}

	return false;
}
