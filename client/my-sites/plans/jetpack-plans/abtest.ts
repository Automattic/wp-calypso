/**
 * Internal dependencies
 */
import { getUrlParts } from 'calypso/lib/url/url-parts';

const VERSIONS = [ 'v1', 'v2', 'i5' ];
const DEFAULT_VERSION = 'i5';

/**
 * Returns the name of the Conversion Rate Optimization test that is currently active.
 *
 * @returns {string}  The name of the active test.
 */
export const getJetpackCROActiveVersion = (): string => {
	let version;

	if ( 'undefined' !== typeof window ) {
		const versionQuery = getUrlParts( window.location.href ).searchParams?.get(
			'cloud-pricing-page'
		);

		if ( versionQuery && VERSIONS.includes( versionQuery ) ) {
			version = versionQuery;
		}
	}

	return version || DEFAULT_VERSION;
};
