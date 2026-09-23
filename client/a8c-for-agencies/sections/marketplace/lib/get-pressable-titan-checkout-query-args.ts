import { getQueryArg } from '@wordpress/url';
import type { PressableTitanCheckoutParams } from 'calypso/a8c-for-agencies/data/marketplace/use-prepare-pressable-titan-checkout';

const REQUIRED_ARGS = [ 'agency_id', 'domain', 'quantity', 'signature' ] as const;
const OPTIONAL_ARGS = [ 'plan', 'is_trial' ] as const;

/**
 * Read the signed Pressable Titan checkout params from the current URL.
 *
 * Values are kept as the strings Pressable sent and absent optional params are
 * left out, because the signature is computed over exactly the fields present.
 * Returns null when any required param is missing.
 */
export function getPressableTitanCheckoutQueryArgs(): PressableTitanCheckoutParams | null {
	const href = window.location.href;
	const params: Record< string, string > = {};

	for ( const name of REQUIRED_ARGS ) {
		const value = getQueryArg( href, name );
		if ( typeof value !== 'string' || value === '' ) {
			return null;
		}
		params[ name ] = value;
	}

	for ( const name of OPTIONAL_ARGS ) {
		const value = getQueryArg( href, name );
		if ( typeof value === 'string' ) {
			params[ name ] = value;
		}
	}

	return params as unknown as PressableTitanCheckoutParams;
}
