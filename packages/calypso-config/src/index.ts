/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */

import createConfig from '@automattic/create-calypso-config';
import type { ConfigData } from '@automattic/create-calypso-config';

declare global {
	interface Window {
		configData: ConfigData;
		electron: any; // eslint-disable-line @typescript-eslint/no-explicit-any
	}
}

/**
 * Manages config flags for various deployment builds
 *
 * @module config/index
 */
if ( 'undefined' === typeof window || ! window.configData ) {
	throw new ReferenceError(
		'No configuration was found: please see packages/calypso-config/README.md for more information'
	);
}

const isDesktop = window.electron !== undefined;

let configData: ConfigData;

if ( isDesktop ) {
	configData = Object.assign( window.configData, { env_id: 'desktop', client_slug: 'desktop' } );
	if ( configData.features ) {
		configData.features[ 'desktop' ] = true;
		configData.features[ 'desktop-promo' ] = false;
	}
} else {
	configData = window.configData;
}

// calypso.live matches
// hash-abcd1234.calypso.live matches
// calypso.live.com doesn't match
const CALYPSO_LIVE_REGEX = /^([a-zA-Z0-9-]+\.)?calypso\.live$/;

// check if the current browser location is *.calypso.live
export function isCalypsoLive(): boolean {
	return typeof window !== 'undefined' && CALYPSO_LIVE_REGEX.test( window.location.host );
}

function applyFlags( flagsString: string, modificationMethod: 'cookie' | 'URL' ) {
	const flags = flagsString.split( ',' );
	flags.forEach( ( flagRaw ) => {
		const flag = flagRaw.replace( /^[-+]/, '' );
		const enabled = ! /^-/.test( flagRaw );
		if ( configData.features ) {
			configData.features[ flag ] = enabled;
			// eslint-disable-next-line no-console
			console.log(
				'%cConfig flag %s via %s: %s',
				'font-weight: bold;',
				enabled ? 'enabled' : 'disabled',
				modificationMethod,
				flag
			);
		}
	} );
}

const flagEnvironments = [ 'wpcalypso', 'horizon', 'stage', 'jetpack-cloud-stage' ];

if (
	process.env.NODE_ENV === 'development' ||
	flagEnvironments.includes( configData.env_id ) ||
	isCalypsoLive()
) {
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
export const enabledFeatures = configApi.enabledFeatures;
export const enable = configApi.enable;
export const disable = configApi.disable;
