/**
 * External dependencies
 */
import { get } from 'lodash';
/**
 * Internal dependencies
 */
import { isEnabled } from 'config';
import { PLAN_BUSINESS } from 'lib/plans/constants';
import { userCan } from 'lib/site/utils';

/**
 * Returns true if Automated Transfer is enabled for the current site and current user.
 * @returns {Boolean} true if enabled for the current site and current user
 */
export function isATEnabledForCurrentSite() {
	// don't let this explode in SSR'd envs
	if ( typeof window !== 'object' ) {
		return false;
	}

	// Feature must be enabled on environment
	if ( ! isEnabled( 'automated-transfer' ) ) {
		return false;
	}

	const abtest = require( 'lib/abtest' ).abtest;

	// Site has Business plan
	const site = require( 'lib/sites-list' )().getSelectedSite();
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
	return abtest( 'automatedTransfer1' ) === 'enabled';
}
