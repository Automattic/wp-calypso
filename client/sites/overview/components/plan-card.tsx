import { LoadingPlaceholder, Badge } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { HostingCard, HostingCardLinkButton } from 'calypso/components/hosting-card';
import { isPlansPageUntangled } from 'calypso/lib/plans/untangling-plans-experiment';
import { isPartnerPurchase, purchaseType } from 'calypso/lib/purchases';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import SitePreviewModal from 'calypso/sites-dashboard/components/site-preview-modal';
import { isStagingSite } from 'calypso/sites-dashboard/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isA4AUser } from 'calypso/state/partner-portal/partner/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import ManageAddOnsButton from '../../components/add-ons/manage-add-ons-button';
import PlanPricing from '../../components/plan-pricing';
import PlanStats from '../../components/plan-stats';
import { LaunchIcon, ShareLinkIcon } from './icons';
import { Action } from './quick-actions-card';

import './style.scss';

const DevelopmentSiteActions = () => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );

	const [ isSitePreviewModalVisible, setSitePreviewModalVisible ] = useState( false );
	const openSitePreviewModal = () => setSitePreviewModalVisible( true );
	const closeSitePreviewModal = () => setSitePreviewModalVisible( false );

	return (
		<>
			<div className="hosting-overview__development-site-ctas">
				<ul className="hosting-overview__actions-list">
					<Action
						icon={ <ShareLinkIcon /> }
						onClick={ openSitePreviewModal }
						text={ translate( 'Share a preview link with clients' ) }
					/>
					<Action
						icon={ <LaunchIcon /> }
						href={ `/sites/settings/site/${ site?.slug }` }
						text={ translate( 'Prepare for launch' ) }
					/>
				</ul>
			</div>

			<SitePreviewModal
				siteUrl={ site?.URL ?? '' }
				siteId={ site?.ID ?? 0 }
				isVisible={ isSitePreviewModalVisible }
				closeModal={ closeSitePreviewModal }
			/>
		</>
	);
};

const PlanCard = () => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const isFreePlan = planDetails?.is_free;
	const isJetpack = useSelector( ( state ) =>
		isJetpackSite( state, site?.ID, { treatAtomicAsJetpackSite: false } )
	);
	const isStaging = isStagingSite( site ?? undefined );
	const isOwner = planDetails?.user_is_owner;
	const planPurchaseId = useSelector( ( state: AppState ) =>
		getCurrentPlanPurchaseId( state, site?.ID ?? 0 )
	);
	const planPurchase = useSelector( getSelectedPurchase );
	const isAgencyPurchase = planPurchase && isPartnerPurchase( planPurchase );
	const isDevelopmentSite = Boolean( site?.is_a4a_dev_site );
	const isA4A = useSelector( isA4AUser );

	// Show that this is an Agency Managed plan for agency purchases.
	const planName = isAgencyPurchase
		? purchaseType( planPurchase )
		: planDetails?.product_name_short ?? '';
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;
	const isLoading = ! planDetails || planPurchaseLoading;

	const plansPageIsUntangled = useSelector( isPlansPageUntangled );

	const renderManageButton = () => {
		if ( isJetpack || ! site || isStaging || isAgencyPurchase || isDevelopmentSite ) {
			return false;
		}
		if ( isFreePlan ) {
			if ( plansPageIsUntangled ) {
				return (
					<ManageAddOnsButton tracksEventName="calypso_hosting_overview_manage_add_ons_button_click" />
				);
			}
			return (
				<HostingCardLinkButton to={ `/add-ons/${ site?.slug }` } hideOnMobile>
					{ translate( 'Manage add-ons' ) }
				</HostingCardLinkButton>
			);
		}
		if ( isOwner ) {
			return (
				<HostingCardLinkButton
					to={ getManagePurchaseUrlFor( site?.slug, planPurchaseId ?? 0 ) }
					hideOnMobile
				>
					{ translate( 'Manage plan' ) }
				</HostingCardLinkButton>
			);
		}
	};

	return (
		<>
			<QuerySitePlans siteId={ site?.ID } />
			<HostingCard className="hosting-overview__plan">
				<div className="hosting-overview__plan-card-header">
					{ isLoading ? (
						<LoadingPlaceholder width="100px" height="16px" />
					) : (
						<>
							<h3 className="hosting-overview__plan-card-title">
								{ isStaging ? translate( 'Staging site' ) : planName }
							</h3>
							{ isDevelopmentSite && (
								<Badge className="hosting-overview__development-site-badge" type="info-purple">
									{ translate( 'Development' ) }
								</Badge>
							) }
							{ renderManageButton() }
						</>
					) }
				</div>

				{ isAgencyPurchase && (
					<>
						<div className="hosting-overview__plan-agency-purchase">
							<p>
								{ translate( 'This site is managed through {{a}}Automattic for Agencies{{/a}}.', {
									components: {
										a: isA4A ? (
											<a
												href={ `https://agencies.automattic.com/sites/overview/${ site?.slug }` }
												onClick={ () => {
													recordTracksEvent( 'calypso_overview_agency_managed_site_click' );
												} }
											></a>
										) : (
											<strong></strong>
										),
									},
								} ) }
							</p>
						</div>

						{
							/* Enclosing the following check within isAgencyPurchase helps eliminate some layout shifts during load time. */
							isDevelopmentSite && <DevelopmentSiteActions />
						}
					</>
				) }
				{ ! isAgencyPurchase && ! isStaging && <PlanPricing /> }
				<PlanStats needMoreStorageTracksEventName="calypso_hosting_overview_need_more_storage_click" />
			</HostingCard>
		</>
	);
};

export default PlanCard;
