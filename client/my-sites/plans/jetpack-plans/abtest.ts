/**
 * Internal dependencies
 */
import { abtest } from 'calypso/lib/abtest';
import { getUrlParts } from 'calypso/lib/url/url-parts';

const VERSIONS = [ 'v1', 'v2', 'i5', 'spp' ];
const DEFAULT_VERSION = 'i5';

/**
 * Returns the name of the Conversion Rate Optimization test that is currently active.
 *
 * @returns {string}  The name of the active test.
 */
export const getJetpackCROActiveVersion = (): string => {
	// If we see a query parameter, obey that,
	// regardless of any active A/B test value
	if ( typeof window !== 'undefined' ) {
		const iterationQuery = getUrlParts( window.location.href ).searchParams?.get(
			'cloud-pricing-page'
		);

		if ( iterationQuery && VERSIONS.includes( iterationQuery ) ) {
			return iterationQuery;
		}
	}

	// Otherwise, check for the assigned A/B test value
	const variant = abtest( 'jetpackSimplifyPricingPage' );

	switch ( variant ) {
		case 'test':
			return 'spp';
		default:
			return DEFAULT_VERSION;
	}
};
