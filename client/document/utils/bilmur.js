import config from '@automattic/calypso-config';

// The entry points whose clients load `bilmur-spa`.
// This list is needed while the feature is being tested and rolled out in stages.
const SPA_ENTRYPOINTS = [ 'entry-main' ];

export function isBilmurEnabled() {
	return config.isEnabled( 'bilmur-script' );
}

/**
 * Get the cache-busted URL for the bilmur script.
 */
export function getBilmurUrl() {
	const baseUrl = config( 'bilmur_url' );

	if ( ! isBilmurEnabled() || ! baseUrl ) {
		return undefined;
	}

	const oneWeek = 1000 * 60 * 60 * 24 * 7;
	return `${ config( 'bilmur_url' ) }?w=${ Math.floor( Date.now() / oneWeek ) }`;
}

/**
 * Whether the client loads `bilmur-spa`, which takes the place of the bilmur script.
 * @param {string} [entrypointName] Name of the entry point the document is rendered for.
 */
export function isBilmurSpaEnabled( entrypointName ) {
	return config.isEnabled( 'bilmur-spa' ) && SPA_ENTRYPOINTS.includes( entrypointName );
}
