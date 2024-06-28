import {
	getPlan,
	PlanSlug,
	PRODUCT_1GB_SPACE,
	PLAN_MONTHLY_PERIOD,
} from '@automattic/calypso-products';
import { Button, PlanPrice, LoadingPlaceholder } from '@automattic/components';
import { AddOns } from '@automattic/data-stores';
import { usePricingMetaForGridPlans } from '@automattic/data-stores/src/plans';
import { usePlanBillingDescription } from '@automattic/plans-grid-next';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { FC } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PlanStorage from 'calypso/blocks/plan-storage';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import { HostingCard, HostingCardLinkButton } from 'calypso/components/hosting-card';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PlanStorageBar from 'calypso/hosting-overview/components/plan-storage-bar';
import { isPartnerPurchase, purchaseType } from 'calypso/lib/purchases';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { getManagePurchaseUrlFor } from 'calypso/my-sites/purchases/paths';
import { isStagingSite } from 'calypso/sites-dashboard/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isA4AUser } from 'calypso/state/partner-portal/partner/selectors';
import getCurrentPlanPurchaseId from 'calypso/state/selectors/get-current-plan-purchase-id';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { IAppState } from 'calypso/state/types';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';

const PricingSection: FC = () => {
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
		storageAddOns: null,
		useCheckPlanAvailabilityForPurchase,
	} )?.[ planSlug ];
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;
	const isLoading = ! pricing || ! planData || planPurchaseLoading;

	const planBillingDescription = usePlanBillingDescription( {
		siteId: site?.ID,
		planSlug,
		pricing: pricing ?? null,
		isMonthlyPlan: pricing?.billingPeriod === PLAN_MONTHLY_PERIOD,
		storageAddOnsForPlan: null,
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
								primary
								compact
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

const PlanCard: FC = () => {
	const translate = useTranslate();
	const site = useSelector( getSelectedSite );
	const planDetails = site?.plan;
	const isFreePlan = planDetails?.is_free;
	const isJetpack = useSelector( ( state ) =>
		isJetpackSite( state, site?.ID, { treatAtomicAsJetpackSite: false } )
	);
	const isStaging = isStagingSite( site ?? undefined );
	const isOwner = planDetails?.user_is_owner;
	const planPurchaseId = useSelector( ( state: IAppState ) =>
		getCurrentPlanPurchaseId( state, site?.ID ?? 0 )
	);
	const planPurchase = useSelector( getSelectedPurchase );
	const isAgencyPurchase = planPurchase && isPartnerPurchase( planPurchase );
	const isA4A = useSelector( isA4AUser );
	// Show that this is an Agency Managed plan for agency purchases.
	const planName = isAgencyPurchase
		? purchaseType( planPurchase )
		: planDetails?.product_name_short ?? '';
	const planPurchaseLoading = ! isFreePlan && planPurchase === null;
	const isLoading = ! planDetails || planPurchaseLoading;

	// Check for storage addons available for purchase.
	const addOns = AddOns.useAddOns( { selectedSiteId: site?.ID } );
	const storageAddons = addOns.filter(
		( addOn ) => addOn?.productSlug === PRODUCT_1GB_SPACE && ! addOn?.exceedsSiteStorageLimits
	);
	const renderManageButton = () => {
		if ( isJetpack || ! site || isStaging || isAgencyPurchase ) {
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
							{ renderManageButton() }
						</>
					) }
				</div>
				{ ! isStaging && (
					<>
						{ isAgencyPurchase && (
							<div className="hosting-overview__plan-agency-purchase">
								<p>
									{ translate( 'This site is managed through {{a}}Automattic for Agencies{{/a}}.', {
										components: {
											a: isA4A ? (
												<a
													href={ `https://agencies.automattic.com/sites/overview/${ site?.slug }` }
												></a>
											) : (
												<strong></strong>
											),
										},
									} ) }
								</p>
							</div>
						) }
						{ ! isAgencyPurchase && <PricingSection /> }
						{ ! isLoading && (
							<PlanStorage
								className="hosting-overview__plan-storage"
								hideWhenNoStorage
								siteId={ site?.ID }
								StorageBarComponent={ PlanStorageBar }
							>
								{ storageAddons.length > 0 && ! isAgencyPurchase && (
									<div className="hosting-overview__plan-storage-footer">
										<Button
											className="hosting-overview__link-button"
											plain
											href={ `/add-ons/${ site?.slug }` }
										>
											{ translate( 'Need more storage?' ) }
										</Button>
									</div>
								) }
							</PlanStorage>
						) }
					</>
				) }
			</HostingCard>
		</>
	);
};

export default PlanCard;
