/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOptions from 'state/selectors/get-site-options';
import isJetpackSite from 'state/sites/selectors/is-jetpack-site';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';

/**
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} True if current user is able to see the checklist
 */
export default function isEligibleForDotcomChecklist( state, siteId ) {
	const siteOptions = getSiteOptions( state, siteId );
	const isWpComStore = get( siteOptions, 'is_wpcom_store' );
	const createdAt = get( siteOptions, 'created_at', '' );

	// Checklist should not show up if the site is created before the feature was launched.
	if (
		! createdAt ||
		createdAt.substr( 0, 4 ) === '0000' ||
		new Date( createdAt ) < new Date( '2018-02-01' )
	) {
		return false;
	}

	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		return false;
	}

	return ! isWpComStore;
}
