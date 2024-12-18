import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { PLAN_PREMIUM } from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Gridicon, PlanPrice } from '@automattic/components';
import { Plans, PlanNext } from '@automattic/data-stores';
import formatCurrency from '@automattic/format-currency';
import { Button, Modal } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useDispatch } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import useCheckPlanAvailabilityForPurchase from 'calypso/my-sites/plans-features-main/hooks/use-check-plan-availability-for-purchase';
import { useSelector } from 'calypso/state';
import { getSiteOption } from 'calypso/state/sites/selectors';
import { toggleUpsellModal } from 'calypso/state/stats/paid-stats-upsell/actions';
import { getUpsellModalStatType } from 'calypso/state/stats/paid-stats-upsell/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { statTypeToPlan } from '../stat-type-to-plan';

import './style.scss';

export default function StatsUpsellModal( { siteId }: { siteId: number } ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const plans = Plans.usePlans( { coupon: undefined } );
	const statType = useSelector( ( state ) => getUpsellModalStatType( state, siteId ) );
	const planKey = statTypeToPlan( statType );
	const plan = plans?.data?.[ planKey ];
	const pricing = Plans.usePricingMetaForGridPlans( {
		planSlugs: [ planKey ],
		siteId: selectedSiteId,
		coupon: undefined,
		useCheckPlanAvailabilityForPurchase,
	} )?.[ planKey ];
	const planSlug = plan?.pathSlug ?? planKey;
	const isLoading = plans.isLoading || ! pricing;
	const isOdysseyStats = isEnabled( 'is_running_in_jetpack_site' );
	const eventPrefix = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
	const isSimpleClassic = useSelector( ( state ) =>
		getSiteOption( state, selectedSiteId, 'is_wpcom_simple' )
	);

	const closeModal = () => {
		dispatch( toggleUpsellModal( siteId, statType ) );
	};

	const redirectTo = encodeURIComponent( window.location.href );

	const onClick = ( event: React.MouseEvent< HTMLButtonElement, MouseEvent > ) => {
		event.preventDefault();
		closeModal();
		recordTracksEvent( `${ eventPrefix }_stats_upsell_modal_submit`, {
			stat_type: statType,
		} );
		if ( isSimpleClassic ) {
			const checkoutProductUrl = new URL(
				`https://wordpress.com/checkout/${ siteSlug }/${ planSlug }`
			);
			checkoutProductUrl.searchParams.set( 'redirect_to', redirectTo );
			window.open( checkoutProductUrl, '_self' );
		} else {
			page( `/checkout/${ siteSlug }/${ planSlug }?redirect_to=${ redirectTo }` );
		}
	};

	return (
		<Modal className="stats-upsell-modal" onRequestClose={ closeModal } __experimentalHideHeader>
			<TrackComponentView
				eventName={ `${ eventPrefix }_stats_upsell_modal_view` }
				eventProperties={ {
					stat_type: statType,
				} }
			/>
			<Button
				className="stats-upsell-modal__close-button"
				onClick={ closeModal }
				icon={ close }
				label={ translate( 'Close' ) }
			/>
			<div className="stats-upsell-modal__content">
				<div className="stats-upsell-modal__left">
					<h1 className="stats-upsell-modal__title">
						{ translate( 'Grow faster with Jetpack Stats' ) }
					</h1>
					<div className="stats-upsell-modal__text">
						{ translate( 'Finesse your scaling-up strategy with detailed insights and data.' ) }
					</div>
					<Button
						variant="primary"
						className="stats-upsell-modal__button"
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
				<div className="stats-upsell-modal__right">
					<h2 className="stats-upsell-modal__plan">
						{ ! plan?.productNameShort
							? ''
							: translate( '%(planName)s plan', { args: { planName: plan.productNameShort } } ) }
					</h2>
					{ pricing && (
						<div className="stats-upsell-modal__price-amount">
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
					<div className="stats-upsell-modal__price-per-month">
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
					{ plan?.planSlug === PLAN_PREMIUM ? (
						<PremiumFeatures plan={ plan } />
					) : (
						<PersonalFeatures plan={ plan } />
					) }
				</div>
			</div>
		</Modal>
	);
}

function PremiumFeatures( { plan }: { plan: PlanNext | undefined } ) {
	const translate = useTranslate();

	return (
		<div className="stats-upsell-modal__features">
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'All stats available: traffic trends, sources, optimal time to post…' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'Track campaign performance with UTM parameters' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'Instant access to upcoming features' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( '14-day money-back guarantee' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'All %(planName)s plan features', {
						args: { planName: plan?.productNameShort ?? '' },
					} ) }
				</div>
			</div>
		</div>
	);
}

function PersonalFeatures( { plan }: { plan: PlanNext | undefined } ) {
	const translate = useTranslate();
	return (
		<div className="stats-upsell-modal__features">
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'Stats beyond the last 7 days' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'Download data as CSV' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'Detailed traffic stats and site insights' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( '14-day money-back guarantee' ) }
				</div>
			</div>
			<div className="stats-upsell-modal__feature">
				<Gridicon icon="checkmark" size={ 18 } />
				<div className="stats-upsell-modal__feature-text">
					{ translate( 'All %(planName)s plan features', {
						args: { planName: plan?.productNameShort ?? '' },
					} ) }
				</div>
			</div>
		</div>
	);
}
