import { recordTracksEvent } from '@automattic/calypso-analytics';
import page from '@automattic/calypso-router';
import { DotPager } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import blazeIllustration from 'calypso/assets/images/customer-home/illustration--blaze.svg';
import wordpressSeoIllustration from 'calypso/assets/images/illustrations/wordpress-seo-premium.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import { AppPromoCard } from 'calypso/components/app-promo-card';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

const EVENT_ADS_MOBILE_PROMO_VIEW = 'calypso_stats_ads_mobile_cta_jetpack_view';
const EVENT_TRAFFIC_BLAZE_PROMO_VIEW = 'calypso_stats_traffic_blaze_banner_view';
const EVENT_TRAFFIC_MOBILE_PROMO_VIEW = 'calypso_stats_traffic_mobile_cta_jetpack_view';
const EVENT_YOAST_PROMO_VIEW = 'calypso_stats_wordpress_seo_premium_banner_view';

// TODO: Register the following events with Tracks to ensure they're properly tracked.
const EVENT_ANNUAL_BLAZE_PROMO_VIEW = 'calypso_stats_annual_insights_blaze_banner_view';
const EVENT_ANNUAL_MOBILE_PROMO_VIEW = 'calypso_stats_annual_insights_mobile_cta_jetpack_view';

export default function PromoCards( { isOdysseyStats, slug, pageSlug } ) {
	// Keep a replica of the pager index state.
	// TODO: Figure out an approach that doesn't require replicating state value from DotPager.
	const [ dotPagerIndex, setDotPagerIndex ] = useState( 0 );

	const selectedSiteId = useSelector( getSelectedSiteId );
	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);
	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	// This is used to show some banner only on annual stats page.
	const isAnnualStatsPage = page.current.includes( 'annualstats' );

	// Blaze promo is disabled for Odyssey.
	const showBlazePromo = isAnnualStatsPage && ! isOdysseyStats && shouldShowAdvertisingOption;
	// Yoast promo is disabled for Odyssey & self-hosted & non-traffic pages.
	const showYoastPromo =
		isAnnualStatsPage && ! isOdysseyStats && ! jetpackNonAtomic && pageSlug === 'traffic';

	const viewEvents = useMemo( () => {
		const events = [];
		if ( pageSlug === 'traffic' ) {
			showBlazePromo && events.push( EVENT_TRAFFIC_BLAZE_PROMO_VIEW );
			showYoastPromo && events.push( EVENT_YOAST_PROMO_VIEW );
			events.push( EVENT_TRAFFIC_MOBILE_PROMO_VIEW );
		} else if ( pageSlug === 'annual-insights' ) {
			showBlazePromo && events.push( EVENT_ANNUAL_BLAZE_PROMO_VIEW );
			events.push( EVENT_ANNUAL_MOBILE_PROMO_VIEW );
		} else if ( pageSlug === 'ads' ) {
			events.push( EVENT_ADS_MOBILE_PROMO_VIEW );
		}
		return events;
	}, [ pageSlug, showBlazePromo, showYoastPromo ] );

	// Handle view events upon initial mount and upon paging DotPager.
	useEffect( () => {
		if ( viewEvents.length === 0 ) {
			return;
		} else if ( dotPagerIndex >= viewEvents.length ) {
			// Prevent out of bounds index when switching sites.
			recordTracksEvent( viewEvents[ viewEvents.length - 1 ], { site_id: selectedSiteId } );
		} else {
			recordTracksEvent( viewEvents[ dotPagerIndex ], { site_id: selectedSiteId } );
		}
	}, [ viewEvents, dotPagerIndex, selectedSiteId ] );

	// Handle click events from promo card.
	const promoCardDidReceiveClick = ( event ) => {
		// Events need to incorporate the page and the click type.
		// This will allow us to account for integration across different pages.
		// FORMAT: calypso_stats_PAGE_mobile_cta_EVENT
		// Current known events across Stats pages are listed below.
		// This comment will fall out of date if the PromoCards component
		// is added to any new pages.
		// Ads:
		// - calypso_stats_ads_mobile_cta_jetpack_click_a8c
		// - calypso_stats_ads_mobile_cta_jetpack_click_apple
		// - calypso_stats_ads_mobile_cta_jetpack_click_google
		// - calypso_stats_ads_mobile_cta_woo_click_a8c
		// - calypso_stats_ads_mobile_cta_woo_click_apple
		// - calypso_stats_ads_mobile_cta_woo_click_google
		// Annual Insights:
		// - calypso_stats_annual_insights_mobile_cta_jetpack_click_a8c
		// - calypso_stats_annual_insights_mobile_cta_jetpack_click_apple
		// - calypso_stats_annual_insights_mobile_cta_jetpack_click_google
		// - calypso_stats_annual_insights_mobile_cta_woo_click_a8c
		// - calypso_stats_annual_insights_mobile_cta_woo_click_apple
		// - calypso_stats_annual_insights_mobile_cta_woo_click_google
		// Traffic
		// - calypso_stats_traffic_mobile_cta_jetpack_click_a8c
		// - calypso_stats_traffic_mobile_cta_jetpack_click_apple
		// - calypso_stats_traffic_mobile_cta_jetpack_click_google
		// - calypso_stats_traffic_mobile_cta_woo_click_a8c
		// - calypso_stats_traffic_mobile_cta_woo_click_apple
		// - calypso_stats_traffic_mobile_cta_woo_click_google
		const tracksEventName = `calypso_stats_${ pageSlug }_mobile_cta_${ event }`.replaceAll(
			'-',
			'_'
		);
		recordTracksEvent( tracksEventName );
	};

	const pagerDidSelectPage = ( index ) => setDotPagerIndex( index );

	return (
		<div className="stats__promo-container">
			<div className="stats__promo-card">
				<DotPager className="stats__promo-pager" onPageSelected={ pagerDidSelectPage }>
					{ showBlazePromo && (
						<PromoCardBlock
							productSlug="blaze"
							clickEvent="calypso_stats_traffic_blaze_banner_click"
							headerText={ translate( 'Reach new readers and customers' ) }
							contentText={ translate(
								'Use WordPress Blaze to increase your reach by promoting your work to the larger WordPress.com community of blogs and sites. '
							) }
							ctaText={ translate( 'Get started' ) }
							image={ blazeIllustration }
							href={ `/advertising/${ slug || '' }` }
						/>
					) }
					{ showYoastPromo && (
						<PromoCardBlock
							productSlug="wordpress-seo-premium"
							clickEvent="calypso_stats_wordpress_seo_premium_banner_click"
							headerText={ translate( 'Increase site visitors with Yoast SEO Premium' ) }
							contentText={ translate(
								'Purchase Yoast SEO Premium to ensure that more people find your incredible content.'
							) }
							ctaText={ translate( 'Learn more' ) }
							image={ wordpressSeoIllustration }
							href={ `/plugins/wordpress-seo-premium/${ slug }` }
						/>
					) }
					<AppPromoCard
						className="stats__promo-card-apps"
						clickHandler={ promoCardDidReceiveClick }
					/>
				</DotPager>
			</div>
		</div>
	);
}
