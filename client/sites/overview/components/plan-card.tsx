import { getPlan, PlanSlug, PLAN_MONTHLY_PERIOD } from '@automattic/calypso-products';
import { Button, PlanPrice, LoadingPlaceholder, Badge } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { usePricingMetaForGridPlans } from '@automattic/data-stores/src/plans';
import { usePlanBillingDescription } from '@automattic/plans-grid-next';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PlanStorage, { useDisplayUpgradeLink } from 'calypso/blocks/plan-storage';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { HostingCard, HostingCardLinkButton } from 'calypso/components/hosting-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { isPartnerPurchase, purchaseType } from 'calypso/lib/purchases';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import SitePreviewModal from 'calypso/sites-dashboard/components/site-preview-modal';
import { isStagingSite } from 'calypso/sites-dashboard/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isA4AUser } from 'calypso/state/partner-portal/partner/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';
import { LaunchIcon, ShareLinkIcon } from './icons';
import { PlanBandwidth } from './plan-bandwidth';
import { PlanSiteVisits } from './plan-site-visits';
import PlanStorageBar from './plan-storage-bar';
import { Action } from './quick-actions-card';

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
						href={ `/settings/general/${ site?.slug }` }
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

const PricingSection = () => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const planSlug = ( planDetails?.product_slug || '' ) as PlanSlug;
	const planData = useSelector( ( state ) => getCurrentPlan( state, site?.ID ) );
	const isFreePlan = planDetails?.is_free;
	const planPurchase = useSelector( getSelectedPurchase );
	const pricing = usePricingMetaForGridPlans( {
		coupon: undefined,
		planSlugs: [ planSlug ],
		siteId: site?.ID,
		useCheckPlanAvailabilityForPurchase,
	} )?.[ planSlug ];
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;
	const isLoading = ! pricing || ! planData || planPurchaseLoading;

	const planBillingDescription = usePlanBillingDescription( {
		siteId: site?.ID,
		planSlug,
		pricing: pricing ?? null,
		isMonthlyPlan: pricing?.billingPeriod === PLAN_MONTHLY_PERIOD,
		useCheckPlanAvailabilityForPurchase,
	} );

	const getBillingDetails = () => {
		if ( isFreePlan ) {
			return null;
		}

		return <>{ planBillingDescription || getPlan( planSlug )?.getBillingTimeFrame?.() }.</>;
	};

	const getExpireDetails = () => {
		if ( isFreePlan ) {
			return translate( 'No expiration date.' );
		}
		return site?.plan?.expired
			? translate( 'Your plan has expired.' )
			: translate( 'Expires on %s.', {
					args: moment( planData?.expiryDate ).format( 'LL' ),
			  } );
	};

	return (
		<>
			{ isLoading ? (
				<LoadingPlaceholder
					className="hosting-overview__plan-price-loading-placeholder"
					width="100px"
					height="32px"
				/>
			) : (
				<div className="hosting-overview__plan-price-wrapper">
					<PlanPrice
						className="hosting-overview__plan-price"
						currencyCode={ pricing?.currencyCode }
						isSmallestUnit
						rawPrice={ pricing?.originalPrice.monthly }
					/>
					<span className="hosting-overview__plan-price-term">
						{ translate( '/mo', {
							comment: '/mo is short for per month, referring to the monthly price of a site plan',
						} ) }
					</span>
				</div>
			) }
			{ isLoading ? (
				<LoadingPlaceholder
					className="hosting-overview__plan-info-loading-placeholder"
					width="200px"
					height="16px"
				/>
			) : (
				<div className="hosting-overview__plan-info">{ getBillingDetails() }</div>
			) }
			{ isLoading ? (
				<LoadingPlaceholder
					className="hosting-overview__plan-info-loading-placeholder"
					width="200px"
					height="16px"
				/>
			) : (
				<div
					className={ clsx( 'hosting-overview__plan-info', {
						'is-expired': site?.plan?.expired,
					} ) }
				>
					{ getExpireDetails() }
					<div className="hosting-overview__plan-cta">
						{ isFreePlan && (
							<Button
								href={ `/plans/${ site?.slug }` }
								onClick={ () =>
									dispatch( recordTracksEvent( 'calypso_hosting_overview_upgrade_plan_click' ) )
								}
							>
								{ translate( 'Upgrade your plan' ) }
							</Button>
						) }
						{ site?.plan?.expired && (
							<>
								<Button compact href={ `/plans/${ site?.slug }` }>
									{ translate( 'See all plans' ) }
								</Button>
								<Button
									style={ { marginLeft: '8px' } }
									primary
									compact
									href={ `/checkout/${ site?.slug }/${ planData.productSlug }` }
								>
									{ translate( 'Renew plan' ) }
								</Button>
							</>
						) }
					</div>
				</div>
			) }
		</>
	);
};

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

	const footerWrapperIsLink = useDisplayUpgradeLink( site?.ID ?? null );
	const availableStorageAddOns = AddOns.useAvailableStorageAddOns( { siteId: site?.ID } );

	const renderManageButton = () => {
		if ( isJetpack || ! site || isStaging || isAgencyPurchase || isDevelopmentSite ) {
			return false;
		}
		if ( isFreePlan ) {
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

				{ ! isAgencyPurchase && ! isStaging && <PricingSection /> }

				{ ! isLoading && (
					<div className="hosting-overview__site-metrics">
						<PlanStorage
							className="hosting-overview__plan-storage"
							hideWhenNoStorage
							siteId={ site?.ID }
							storageBarComponent={ PlanStorageBar }
						>
							{ availableStorageAddOns.length && ! isAgencyPurchase ? (
								<div className="hosting-overview__plan-storage-footer">
									<NeedMoreStorage noLink={ footerWrapperIsLink } />
								</div>
							) : null }
						</PlanStorage>

						{ site && (
							<div className="hosting-overview__site-metrics-footer">
								<PlanBandwidth siteId={ site.ID } />
								<PlanSiteVisits siteId={ site.ID } />
							</div>
						) }
					</div>
				) }
			</HostingCard>
		</>
	);
};

export default PlanCard;
