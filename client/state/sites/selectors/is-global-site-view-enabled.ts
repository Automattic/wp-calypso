import { isEnabled } from '@automattic/calypso-config';
import getSiteOption from './get-site-option';
import type { AppState } from 'calypso/types';

/**
 * Returns true if site has the nav redesign Global Site view enabled, false if it is not enabled.
 *
 * @param  {Object}    state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?boolean}        Whether site has the nav redesign enabled
 */
export default function isGlobalSiteViewEnabled( state: AppState, siteId: number | null ) {
	if ( ! isEnabled( 'layout/dotcom-nav-redesign' ) ) {
		return false;
	}

	const isAdminInterfaceWPAdmin =
		getSiteOption( state, siteId, 'wpcom_admin_interface' ) === 'wp-admin';
	const isClassicEarlyRelease = !! getSiteOption( state, siteId, 'wpcom_classic_early_release' );

	// A site is eliglible if:
	// 1. The Calypso environment has the feature flag "layout/docom-nav-redesign-early-release".
	//    This flag is not meant to be enabled in production and it serves as a faux proxy mechanism.
	// 2. The site has the site option "wpcom_classic_early_release".
	const isNavRedesignEligible =
		isEnabled( 'layout/dotcom-nav-redesign-early-release' ) || isClassicEarlyRelease;

	return isAdminInterfaceWPAdmin && isNavRedesignEligible;
}
