import { getPlan, PlanSlug, PLAN_MONTHLY_PERIOD } from '@automattic/calypso-products';
import { Button, PlanPrice, LoadingPlaceholder } from '@automattic/components';
import { usePricingMetaForGridPlans } from '@automattic/data-stores/src/plans';
import { usePlanBillingDescription } from '@automattic/plans-grid-next';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useSelector, useDispatch } from 'react-redux';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedPurchase, getSelectedSite } from 'calypso/state/ui/selectors';
import './style.scss';

export default function PlanPricing() {
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
					className="plan-price-loading-placeholder"
					width="100px"
					height="32px"
				/>
			) : (
				<div className="plan-price-wrapper">
					<PlanPrice
						currencyCode={ pricing?.currencyCode }
						isSmallestUnit
						rawPrice={ pricing?.originalPrice.monthly }
					/>
					<span className="plan-price-term">
						{ translate( '/mo', {
							comment: '/mo is short for per month, referring to the monthly price of a site plan',
						} ) }
					</span>
				</div>
			) }
			{ isLoading ? (
				<LoadingPlaceholder
					className="plan-price-info-loading-placeholder"
					width="200px"
					height="16px"
				/>
			) : (
				<div className="plan-price-info">{ getBillingDetails() }</div>
			) }
			{ isLoading ? (
				<LoadingPlaceholder
					className="plan-price-info-loading-placeholder"
					width="200px"
					height="16px"
				/>
			) : (
				<div
					className={ clsx( 'plan-price-info', {
						'is-expired': site?.plan?.expired,
					} ) }
				>
					{ getExpireDetails() }
					<div className="plan-price-cta">
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
}
