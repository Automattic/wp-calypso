import { Button, LoadingPlaceholder } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import PlanStorage, { useDisplayUpgradeLink } from 'calypso/blocks/plan-storage';
import { isPartnerPurchase } from 'calypso/lib/purchases';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import { PlanBandwidth } from './plan-bandwidth';
import { PlanSiteVisits } from './plan-site-visits';
import PlanStorageBar from './plan-storage-bar';

import './style.scss';

type NeedMoreStorageProps = {
	noLink?: boolean;
};

function NeedMoreStorage( { noLink = false }: NeedMoreStorageProps ) {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const dispatch = useDispatch();
	const text = translate( 'Need more storage?' );

	if ( noLink ) {
		return text;
	}

	return (
		<Button
			plain
			href={ `/add-ons/${ site?.slug }` }
			onClick={ () => {
				dispatch( recordTracksEvent( 'calypso_hosting_overview_need_more_storage_click' ) );
			} }
		>
			{ text }
		</Button>
	);
}

export default function PlanStats() {
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const planData = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );
	const isFreePlan = planDetails?.is_free;
	const planPurchase = useSelector( getSelectedPurchase );
	const isAgencyPurchase = planPurchase && isPartnerPurchase( planPurchase );

	const planPurchaseLoading = ! isFreePlan && planPurchase === null;
	const isLoading = ! planDetails || ! planData || planPurchaseLoading;

	const footerWrapperIsLink = useDisplayUpgradeLink( site?.ID ?? null );
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId: site?.ID } );

	if ( isLoading ) {
		return <LoadingPlaceholder width="100px" height="16px" />;
	}
	return (
		<>
			<div className="plan-stats">
				<PlanStorage
					className="plan-storage"
					hideWhenNoStorage
					siteId={ site?.ID }
					storageBarComponent={ PlanStorageBar }
				>
					{ availableStorageAddOns.length && ! isAgencyPurchase ? (
						<div className="plan-storage-footer">
							<NeedMoreStorage noLink={ footerWrapperIsLink } />
						</div>
					) : null }
				</PlanStorage>

				{ site && (
					<div className="plan-stats__footer">
						<PlanBandwidth siteId={ site.ID } />
						<PlanSiteVisits siteId={ site.ID } />
					</div>
				) }
			</div>
		</>
	);
}
