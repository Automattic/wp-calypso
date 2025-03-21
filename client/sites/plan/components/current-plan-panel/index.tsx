import { LoadingPlaceholder } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CoreBadge from 'calypso/components/core/badge';
import PlanPricing from 'calypso/sites/components/plan-pricing';
import PlanStats from 'calypso/sites/components/plan-stats';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';

import './style.scss';

export default function CurrentPlanPanel() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const isFreePlan = planDetails?.is_free;
	const planPurchase = useSelector( getSelectedPurchase );

	const planName = planDetails?.product_name_short ?? '';
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;
	const isLoading = ! planDetails || planPurchaseLoading;

	return (
		<div className="current-plan-panel">
			<div className="current-plan-name">
				{ isLoading ? (
					<LoadingPlaceholder width="200px" height="24px" />
				) : (
					<>
						<h3>{ planName }</h3>
						<CoreBadge>{ translate( 'Current plan' ) }</CoreBadge>
					</>
				) }
			</div>

			{ ! isFreePlan && <PlanPricing inline /> }
			<PlanStats />
			<hr />
		</div>
	);
}
