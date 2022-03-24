import {
	isBusiness,
	isEcommerce,
	isEnterprise,
	isPro,
	isMonthly,
} from '@automattic/calypso-products';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
import { default as isVipSite } from 'calypso/state/selectors/is-vip-site';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from '@automattic/calypso-products';

const shouldUpgradeCheck = (
	state: IAppState,
	selectedSite: { ID: number; plan: WithSnakeCaseSlug | WithCamelCaseSlug }
) => {
	return selectedSite
		? ! (
				isPro( selectedSite?.plan ) ||
				isBusiness( selectedSite?.plan ) ||
				isEnterprise( selectedSite?.plan ) ||
				isEcommerce( selectedSite?.plan ) ||
				isJetpackSite( state, selectedSite?.ID ) ||
				isVipSite( state, selectedSite?.ID )
		  )
		: null;
};

export const isAnnualPlanOrUpgradeableAnnualPeriod = ( state: IAppState ) => {
	const selectedSiteId = getSelectedSiteId( state );
	const currentPlan = selectedSiteId && getCurrentPlan( state, selectedSiteId );
	const isAnnualPlan = currentPlan && ! isMonthly( currentPlan.productSlug );

	const selectedSite = getSelectedSite( state );
	const shouldUpgrade = selectedSite && shouldUpgradeCheck( state, selectedSite );

	const billingPeriod = getBillingInterval( state );
	const isAnnualPeriod = billingPeriod === IntervalLength.ANNUALLY;

	return ( ! shouldUpgrade && isAnnualPlan ) || ( shouldUpgrade && isAnnualPeriod );
};

export default shouldUpgradeCheck;
