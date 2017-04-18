/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import config, { isEnabled } from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { userCan } from 'lib/site/utils';

/**
 * Returns true if Automated Transfer is enabled for the given site
 * @param { object } site - a full site object
 * @returns { boolean } - true if AT is enabled for the site
 */
export function isATEnabled( site ) {
	// don't let this explode in SSR'd envs
	if ( typeof window !== 'object' ) {
		return false;
	}

	// Site has already been transferred
	if ( get( site, 'options.is_automated_transfer' ) ) {
		return true;
	}

	// Feature must be enabled on environment
	if ( ! isEnabled( 'automated-transfer' ) ) {
		return false;
	}

	// If it's wpcalypso, this is open
	if ( config( 'env_id' ) === 'wpcalypso' ) {
		return true;
	}

	// Site has Business plan
	const planSlug = get( site, 'plan.product_slug' );
	if ( planSlug !== PLAN_BUSINESS ) {
		return false;
	}

	// Current User can manage site
	const canManageSite = userCan( 'manage_options', site );
	if ( ! canManageSite ) {
		return false;
	}

	// Gate to 40% roll. If we modify this value, we need a new test name
	// in active-tests.js
	const abtest = require( 'lib/abtest' ).abtest;
	return abtest( 'automatedTransfer2' ) === 'enabled';
}
