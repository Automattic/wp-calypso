import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon, PlanPrice } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useSelector } from 'calypso/state';
import { getUpsellModalStatType } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

import './style.scss';

export default function StatsUpsell( { siteId }: { siteId: number } ) {
	const translate = useTranslate();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const plans = Plans.usePlans( { coupon: undefined } );
	const plan = plans?.data?.[ PLAN_PREMIUM ];
	const pricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ PLAN_PREMIUM ],
		siteId: selectedSiteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
		storageAddOns: null,
	} )?.[ PLAN_PREMIUM ];
	const isLoading = plans.isLoading || ! pricing;
	const isOdysseyStats = isEnabled( 'is_running_in_jetpack_site' );
	const eventPrefix = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	const statType = useSelector( ( state ) => getUpsellModalStatType( state, siteId ) );

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		recordTracksEvent( `${ eventPrefix }_stats_upsell_submit`, {
			stat_type: statType,
		} );
		if ( isOdysseyStats ) {
			const checkoutProductUrl = new URL(
				`https://wordpress.com/checkout/${ siteSlug }/${ PLAN_PREMIUM }`
			);
			window.open( checkoutProductUrl, '_self' );
		} else {
			page( `/checkout/${ siteSlug }/${ plan?.pathSlug ?? 'premium' }` );
		}
	};

	return (
		<div className="stats-upsell">
			<TrackComponentView
				eventName={ `${ eventPrefix }_stats_upsell_view` }
				eventProperties={ {
					stat_type: statType,
				} }
			/>
			<div className="stats-upsell__content">
				<div className="stats-upsell__left">
					<h1 className="stats-upsell__title">{ translate( 'Grow faster with Jetpack Stats' ) }</h1>
					<div className="stats-upsell__text">
						{ translate( 'Finesse your scaling-up strategy with detailed insights and data.' ) }
					</div>
					<Button
						variant="primary"
						className="stats-upsell__button"
						onClick={ onClick }
						disabled={ isLoading }
					>
						{ ! plan?.productNameShort
							? translate( 'Upgrade plan' )
							: translate( 'Upgrade to %(planName)s', {
									args: { planName: plan.productNameShort },
							  } ) }
					</Button>
				</div>
				<div className="stats-upsell__right">
					<h2 className="stats-upsell__plan">
						{ ! plan?.productNameShort
							? ''
							: translate( '%(planName)s plan', { args: { planName: plan.productNameShort } } ) }
					</h2>
					{ pricing && (
						<div className="stats-upsell__price-amount">
							<PlanPrice
								className="screen-upsell__plan-price"
								currencyCode={ pricing.currencyCode }
								rawPrice={ pricing.discountedPrice.monthly ?? pricing.originalPrice.monthly }
								displayPerMonthNotation={ false }
								isLargeCurrency
								isSmallestUnit
							/>
						</div>
					) }
					<div className="stats-upsell__price-per-month">
						{ ! pricing
							? ''
							: translate( 'per month, %(planPrice)s billed yearly', {
									args: {
										planPrice: formatCurrency(
											pricing.discountedPrice.full ?? pricing.originalPrice.full ?? 0,
											pricing.currencyCode ?? '',
											{
												stripZeros: true,
												isSmallestUnit: true,
											}
										),
									},
							  } ) }
					</div>
					<div className="stats-upsell__features">
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate(
									'All stats available: traffic trends, sources, optimal time to post…'
								) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'Download data as CSV' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'Instant access to upcoming features' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( '14-day money-back guarantee' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'All %(planName)s plan features', {
									args: { planName: plan?.productNameShort ?? '' },
								} ) }
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
