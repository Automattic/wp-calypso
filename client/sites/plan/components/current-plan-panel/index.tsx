import { LoadingPlaceholder } from '@automattic/components';
import { useSelector } from 'react-redux';
import PlanPricing from 'calypso/sites/components/plan-pricing';
import PlanStats from 'calypso/sites/components/plan-stats';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export default function CurrentPlanPanel() {
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const isFreePlan = planDetails?.is_free;
	const planPurchase = useSelector( getSelectedPurchase );

	const planName = planDetails?.product_name_short ?? '';
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;
	const isLoading = ! planDetails || planPurchaseLoading;

	if ( isLoading ) {
		return <LoadingPlaceholder width="100px" height="16px" />;
	}

	return (
		<div className="current-plan-panel">
			<h3>{ planName }</h3>
			{ ! isFreePlan && <PlanPricing /> }
			<PlanStats />
			<hr />
		</div>
	);
}
