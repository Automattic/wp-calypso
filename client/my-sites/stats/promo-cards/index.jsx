import { recordTracksEvent } from '@automattic/calypso-analytics';
import { MobilePromoCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import blazeDropDownIllustration from 'calypso/assets/images/illustrations/blaze-drop-down.svg';
import wordpressSeoIllustration from 'calypso/assets/images/illustrations/wordpress-seo-premium.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import DotPager from 'calypso/components/dot-pager';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

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

	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);
	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	// Blaze promo is disabled for Odyssey.
	const showBlazePromo = ! isOdysseyStats && shouldShowAdvertisingOption;
	// Yoast promo is disabled for Odyssey & self-hosted & non-traffic pages.
	const showYoastPromo = ! isOdysseyStats && ! jetpackNonAtomic && pageSlug === 'traffic';

	const viewEvents = useMemo( () => {
		const events = [];
		if ( pageSlug === 'traffic' ) {
			showBlazePromo && events.push( EVENT_TRAFFIC_BLAZE_PROMO_VIEW );
			showYoastPromo && events.push( EVENT_YOAST_PROMO_VIEW );
			events.push( EVENT_TRAFFIC_MOBILE_PROMO_VIEW );
		} else if ( pageSlug === 'annual-insights' ) {
			showBlazePromo && events.push( EVENT_ANNUAL_BLAZE_PROMO_VIEW );
			events.push( EVENT_ANNUAL_MOBILE_PROMO_VIEW );
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
		const tracksEventName = `calypso_stats_traffic_mobile_cta_${ event.replaceAll( '-', '_' ) }`;
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
							image={ blazeDropDownIllustration }
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
					<MobilePromoCard
						className="stats__promo-card-apps"
						clickHandler={ promoCardDidReceiveClick }
					/>
				</DotPager>
			</div>
		</div>
	);
}
