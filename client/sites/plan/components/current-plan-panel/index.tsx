import { LoadingPlaceholder } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CoreBadge from 'calypso/components/core/badge';
import { getMyPurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import PlanPricing from 'calypso/sites/components/plan-pricing';
import PlanStats from 'calypso/sites/components/plan-stats';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

import './style.scss';

export default function CurrentPlanPanel() {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const isFreePlan = planDetails?.is_free;
	const planPurchase = useSelector( getSelectedPurchase );
	const planPurchaseId = useSelector( ( state: AppState ) =>
		getCurrentPlanPurchaseId( state, site?.ID ?? 0 )
	);

	const planName = planDetails?.product_name_short ?? '';
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;

	const isOwner = planDetails?.user_is_owner;

	const isLoading = ! planDetails || planPurchaseLoading;

	const renderManageAddOnsButton = () => {
		return (
			<Button variant="tertiary" href={ `/add-ons/${ site?.slug }` }>
				{ translate( 'Manage add-ons' ) }
			</Button>
		);
	};

	const renderManageBillingButton = () => {
		if ( ! site || ! isOwner ) {
			return null;
		}
		return (
			<Button variant="secondary" href={ getMyPurchaseUrlFor( site.slug, planPurchaseId ?? 0 ) }>
				{ translate( 'Manage billing' ) }
			</Button>
		);
	};

	return (
		<div className="current-plan-panel">
			<div className="current-plan-heading">
				<div className="current-plan-info">
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
				</div>
				<div className="manage-buttons">
					{ ! isLoading && (
						<>
							{ renderManageBillingButton() }
							{ renderManageAddOnsButton() }
						</>
					) }
				</div>
			</div>

			<PlanStats />
			<hr />
		</div>
	);
}
