/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { isEcommercePlan } from 'lib/plans';

interface PrivacySettings {
	comingSoon?: number;
	public: number;
}

/**
 * Get the privacy settings for new site
 *
 * @param state The current client state
 * @returns privacy settings for new site
 */
export default function getNewSitePrivacySettings( state: object ): PrivacySettings {
	if ( config.isEnabled( 'coming-soon' ) ) {
		return {
			comingSoon: 1,
			public: -1,
		};
	}

	/**
	 * eCommerce sites are created public since they go Atomic at purchase.
	 * p1578348423018900-slack-CCS1W9QVA
	 */
	const plan = get( getSignupDependencyStore( state ), 'cartItem.product_slug', false );
	if ( plan && isEcommercePlan( plan ) ) {
		return {
			public: 1,
		};
	}

	return { public: -1 };
}
