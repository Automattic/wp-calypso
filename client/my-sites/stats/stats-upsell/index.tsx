import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { Plans } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import statsFeaturesPNG from 'calypso/assets/images/stats/paid-features.png';
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
					<h1 className="stats-upsell__title">{ translate( 'Unlock site growth analytics' ) }</h1>
					<div className="stats-upsell__text">
						{ ! pricing
							? ''
							: translate(
									'Get detailed insights into your site’s performance for {{b}}%(planPrice)s/month{{/b}} with a Personal plan.',
									{
										components: { b: <b /> },
										args: {
											planPrice: formatCurrency(
												pricing.discountedPrice.monthly ?? pricing.originalPrice.monthly ?? 0,
												pricing.currencyCode ?? '',
												{
													stripZeros: true,
													isSmallestUnit: true,
												}
											),
										},
									}
							  ) }
					</div>
					<div className="stats-upsell__features">
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'View trends and data from any time period you choose' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'Understand how visitors find and use your site' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'Track which posts and pages are most popular' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'See where your visitors come from worldwide' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'Monitor email engagement and downloads' ) }
							</div>
						</div>
						<div className="stats-upsell__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							<div className="stats-upsell__feature-text">
								{ translate( 'Keep your data private and GDPR-compliant' ) }
							</div>
						</div>
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
					<img src={ statsFeaturesPNG } alt={ translate( 'Features' ) } />
				</div>
			</div>
		</div>
	);
}
