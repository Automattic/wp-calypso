/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSiteOptions from 'calypso/state/selectors/get-site-options';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/**
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} True if current user is able to see the checklist
 */
export default function isEligibleForDotcomChecklist( state, siteId ) {
	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		return false;
	}

	if ( isSiteWPForTeams( state, siteId ) ) {
		return false;
	}

	//TODO: we should add checklist support for Atomic
	if ( isAtomicSite( state, siteId ) ) {
		return false;
	}

	const siteOptions = getSiteOptions( state, siteId );

	// Checklist should not show up if the site is created before the feature was launched.
	if ( get( siteOptions, 'created_at', '' ) < '2018-02-01' ) {
		return false;
	}

	return true;
}
