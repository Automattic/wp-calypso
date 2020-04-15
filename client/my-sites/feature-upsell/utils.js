/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { getPlan } from 'lib/plans';
import { getPlanRawPrice } from 'state/plans/selectors';
import { getPlanDiscountedRawPrice } from 'state/sites/plans/selectors';
import { canCurrentUserUpgradeSite } from 'state/sites/selectors';
import redirectIf from './redirect-if';

export const getUpsellPlanPrice = ( state, upsellPlanSlug, selectedSiteId ) => {
	const upsellPlan = getPlan( upsellPlanSlug );
	const upsellPlanId = upsellPlan.getProductId();
	const rawPrice = getPlanRawPrice( state, upsellPlanId, false );
	const discountedRawPrice = getPlanDiscountedRawPrice( state, selectedSiteId, upsellPlanSlug, {
		isMonthly: false,
	} );
	return discountedRawPrice || rawPrice;
};

/**
 * Access control, users without rights to upgrade should not see these pages
 *
 * @param {React.Component} Component - Component to wrap in redirectIf
 * @returns {Function} Wrapped Component
 */
export const redirectUnlessCanUpgradeSite = ( Component ) =>
	redirectIf( ( state ) => ! canCurrentUserUpgradeSite( state ), '/stats' )( Component );
