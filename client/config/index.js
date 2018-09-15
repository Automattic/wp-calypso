/** @format */

/**
 * Internal dependencies
 */

import createConfig from 'lib/create-config';

/**
 * Manages config flags for various deployment builds
 * @module config/index
 */
if ( 'undefined' === typeof window || ! window.configData ) {
	throw new ReferenceError(
		'No configuration was found: please see client/config/README.md for more information'
	);
}

const configData = window.configData;

// https://calypso.live matches
// https://calypso.live/hello matches
// https://hash-abcd1234.calypso.live matches
// https://calypso.live.com doesn't match
const CALYPSO_LIVE_REGEX = /^https:\/\/([a-zA-Z0-9-]+\.)?calypso.live($|\/)/;

if (
	process.env.NODE_ENV === 'development' ||
	configData.env_id === 'stage' ||
	( window && CALYPSO_LIVE_REGEX.test( window.location.href ) )
) {
	const match =
		document.location.search && document.location.search.match( /[?&]flags=([^&]+)(&|$)/ );
	if ( match ) {
		const flags = match[ 1 ].split( ',' );
		flags.forEach( flagRaw => {
			const flag = flagRaw.replace( /^[-+]/, '' );
			const enabled = ! /^-/.test( flagRaw );
			configData.features[ flag ] = enabled;
			// eslint-disable-next-line no-console
			console.log(
				'%cConfig flag %s via URL: %s',
				'font-weight: bold;',
				enabled ? 'enabled' : 'disabled',
				flag
			);
		} );
	}
}

const configApi = createConfig( configData );

export default configApi;
export const isEnabled = configApi.isEnabled;
