/**
 * Internal dependencies
 */
import { getUrlParts } from 'calypso/lib/url/url-parts';

const VERSIONS = [ 'i5', 'spp' ];
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

	// The `spp` iteration still exists for now,
	// but the test is over, so we don't need (or want) to call `abtest`.
	// Instead, always return the default iteration.
	return DEFAULT_VERSION;
};
