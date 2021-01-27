/**
 * External dependencies
 */

import { get } from 'lodash';
/**
 * Internal dependencies
 */
import config, { isEnabled } from '@automattic/calypso-config';
import { isWpComBusinessPlan, isWpComEcommercePlan } from 'calypso/lib/plans';
import { userCan } from 'calypso/lib/site/utils';

/**
 * Returns true if Automated Transfer is enabled for the given site
 *
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

	// Site has Business or eCommerce plan
	const planSlug = get( site, 'plan.product_slug' );
	if ( ! isWpComBusinessPlan( planSlug ) && ! isWpComEcommercePlan( planSlug ) ) {
		return false;
	}

	// Current User can manage site
	return userCan( 'manage_options', site );
}
