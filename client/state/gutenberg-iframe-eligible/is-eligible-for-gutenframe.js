/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/gutenberg-iframe-eligible/init';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteOption } from 'calypso/state/sites/selectors';
import versionCompare from 'calypso/lib/version-compare';

export const isEligibleForGutenframe = ( state, siteId ) => {
	// On some Jetpack sites (9.2, not Atomic),
	// Calypsoify is broken.
	// Let's not enable it for them.
	// This problem was then fixed in Jetpack 9.2.1.
	const jetpackVersion = getSiteOption( state, siteId, 'jetpack_version' );
	const isBrokenJetpack =
		jetpackVersion &&
		versionCompare( jetpackVersion, '9.2-alpha', '>=' ) &&
		versionCompare( jetpackVersion, '9.2.1', '<' ) &&
		! isAtomicSite( state, siteId );

	return ! isBrokenJetpack && get( state, [ 'gutenbergIframeEligible', siteId ], true );
};
export default isEligibleForGutenframe;
