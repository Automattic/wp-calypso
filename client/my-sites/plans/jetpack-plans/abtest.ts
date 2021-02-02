/**
 * Internal dependencies
 */
import { getUrlParts } from 'calypso/lib/url/url-parts';

const VERSIONS = [ 'i5' ];
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

	return DEFAULT_VERSION;
};
