/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */

import createConfig from 'lib/create-config';

/**
 * Manages config flags for various deployment builds
 *
 * @module config/index
 */
if ( 'undefined' === typeof window || ! window.configData ) {
	throw new ReferenceError(
		'No configuration was found: please see client/config/README.md for more information'
	);
}

const configData = window.configData;

// calypso.live matches
// hash-abcd1234.calypso.live matches
// calypso.live.com doesn't match
const CALYPSO_LIVE_REGEX = /^([a-zA-Z0-9-]+\.)?calypso\.live$/;

// check if the current browser location is *.calypso.live
export function isCalypsoLive() {
	return typeof window !== 'undefined' && CALYPSO_LIVE_REGEX.test( window.location.host );
}

function applyFlags( flagsString, modificationMethod ) {
	const flags = flagsString.split( ',' );
	flags.forEach( ( flagRaw ) => {
		const flag = flagRaw.replace( /^[-+]/, '' );
		const enabled = ! /^-/.test( flagRaw );
		configData.features[ flag ] = enabled;
		// eslint-disable-next-line no-console
		console.log(
			'%cConfig flag %s via %s: %s',
			'font-weight: bold;',
			enabled ? 'enabled' : 'disabled',
			modificationMethod,
			flag
		);
	} );
}

if ( process.env.NODE_ENV === 'development' || configData.env_id === 'stage' || isCalypsoLive() ) {
	const cookies = cookie.parse( document.cookie );

	if ( cookies.flags ) {
		applyFlags( cookies.flags, 'cookie' );
	}

	const match =
		document.location.search && document.location.search.match( /[?&]flags=([^&]+)(&|$)/ );
	if ( match ) {
		applyFlags( match[ 1 ], 'URL' );
	}
}

const configApi = createConfig( configData );

export default configApi;
export const isEnabled = configApi.isEnabled;
