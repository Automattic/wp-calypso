/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import getSiteOptions from 'state/selectors/get-site-options';
import { isJetpackSite } from 'state/sites/selectors';
import isAtomicSite from 'state/selectors/is-site-automated-transfer';

/**
 * @param {Object} state Global state tree
 * @param {Number} siteId Site ID
 * @param {Object} cart object
 * @return {Boolean} True if current user is able to see the checklist
 */
export default function isEligibleForDotcomChecklist( state, siteId ) {
	const siteOptions = getSiteOptions( state, siteId );
	const designType = get( siteOptions, 'design_type' );
	const createdAt = get( siteOptions, 'created_at', '' );

	// Checklist should not show up if the site is created before the feature was launched.
	if (
		! createdAt ||
		createdAt.substr( 0, 4 ) === '0000' ||
		moment( createdAt ).isBefore( '2018-02-01' )
	) {
		return false;
	}

	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		return false;
	}

	return 'store' !== designType;
}
