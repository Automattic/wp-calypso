/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getSignupDependencyStore } from 'state/signup/dependency-store/selectors';
import { isEcommercePlan } from 'lib/plans';

/**
 * Should the site be private by default
 *
 * @param state The current client state
 * @returns `true` for private by default & `false` for not
 */
export default function shouldNewSiteBePrivateByDefault( state: object ): boolean {
	/**
	 * eCommerce sites are created public since they go Atomic at purchase.
	 * p1578348423018900-slack-CCS1W9QVA
	 */
	const plan = get( getSignupDependencyStore( state ), 'cartItem.product_slug', false );
	if ( plan && isEcommercePlan( plan ) ) {
		return false;
	}

	return true;
}
