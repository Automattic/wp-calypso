import config from '@automattic/calypso-config';

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
