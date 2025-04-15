import { is100Year } from '@automattic/calypso-products';
import { LoadingPlaceholder } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import CoreBadge from 'calypso/components/core/badge';
import { isPartnerPurchase, purchaseType } from 'calypso/lib/purchases';
import { getMyPurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { isA4AUser } from 'calypso/state/partner-portal/partner/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import ManageAddOnsButton from '../../../components/add-ons/manage-add-ons-button';
import PlanPricing from '../../../components/plan-pricing';
import PlanStats from '../../../components/plan-stats';

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
	const isA4APlan = planPurchase && isPartnerPurchase( planPurchase );
	const is100YearPlan = planPurchase && is100Year( planPurchase );

	const planName = isA4APlan ? purchaseType( planPurchase ) : planDetails?.product_name_short ?? '';
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;

	const isOwner = planDetails?.user_is_owner;
	const isA4AOwner = useSelector( isA4AUser );

	const isLoading = ! planDetails || planPurchaseLoading;

	const renderPricing = () => {
		if ( isFreePlan ) {
			return null;
		}
		if ( isA4APlan ) {
			return (
				<p className="plan-price-info">
					{ translate( 'This site is managed through {{a}}Automattic for Agencies{{/a}}.', {
						components: {
							a: isA4AOwner ? (
								<a href={ `https://agencies.automattic.com/sites/overview/${ site?.slug }` }></a>
							) : (
								<strong></strong>
							),
						},
					} ) }
				</p>
			);
		}
		return <PlanPricing inline />;
	};

	const renderManageAddOnsButton = () => {
		if ( isA4APlan || is100YearPlan ) {
			return null;
		}
		return <ManageAddOnsButton tracksEventName="calypso_plans_manage_add_ons_button_click" />;
	};

	const renderManageBillingButton = () => {
		if ( ! site || ! isOwner || isA4APlan ) {
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
								{ ! isA4APlan && ! is100YearPlan && (
									<CoreBadge>{ translate( 'Current plan' ) }</CoreBadge>
								) }
							</>
						) }
					</div>
					{ renderPricing() }
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

			<PlanStats needMoreStorageTracksEventName="calypso_plans_need_more_storage_click" />
			{ ! isA4APlan && ! is100YearPlan && <hr /> }
		</div>
	);
}
