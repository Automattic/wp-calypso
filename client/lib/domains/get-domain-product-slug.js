import { getTld } from './get-tld';

export function getDomainProductSlug( domain ) {
	const tld = getTld( domain );
	const tldSlug = tld.replace( /\./g, 'dot' );

	if ( 'com' === tldSlug ) {
		return 'domain_reg';
	}

	return `dot${ tldSlug }_domain`;
}
