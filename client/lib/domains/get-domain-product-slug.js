/**
 * External dependencies
 */
import { includes, replace } from 'lodash';

/**
 * Internal dependencies
 */
import { getTld } from './get-tld';

export function getDomainProductSlug( domain ) {
	const tld = getTld( domain );
	const tldSlug = replace( tld, /\./g, 'dot' );

	if ( includes( [ 'com', 'net', 'org' ], tldSlug ) ) {
		return 'domain_reg';
	}

	return `dot${ tldSlug }_domain`;
}
