import { recordTracksEvent } from '@automattic/calypso-analytics';
import { MobilePromoCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import wordpressSeoIllustration from 'calypso/assets/images/illustrations/wordpress-seo-premium.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import DotPager from 'calypso/components/dot-pager';

import './style.scss';

const EVENT_YOAST_PROMO_VIEW = 'calypso_stats_wordpress_seo_premium_banner_view';
const EVENT_MOBILE_PROMO_VIEW = 'calypso_stats_traffic_mobile_cta_jetpack_view';

export default function PromoCards( { isJetpack, isOdysseyStats, slug } ) {
	// Yoast promo is disabled for Odyssey & self-hosted.
	// Mobile apps promos are always shown.
	const showYoastPromo = ! isOdysseyStats && ! isJetpack;
	// Handle initial view event if not using the DotPager UI.
	// We don't worry about the Yoast card as it sends on mount.
	useEffect( () => {
		if ( ! showYoastPromo ) {
			recordTracksEvent( EVENT_MOBILE_PROMO_VIEW );
		}
	}, [ showYoastPromo ] );
	// Handle click events from promo card.
	const promoCardDidReceiveClick = ( event ) => {
		// Events need to incorporate the page and the click type.
		// This will allow us to account for integraton across different pages.
		// FORMAT: calypso_stats_PAGE_mobile_cta_EVENT
		const tracksEventName = `calypso_stats_traffic_mobile_cta_${ event.replaceAll( '-', '_' ) }`;
		recordTracksEvent( tracksEventName );
	};
	// Handle view events from DotPager UI.
	const pagerDidSelectPage = ( index ) => {
		const evenLookup = [ EVENT_YOAST_PROMO_VIEW, EVENT_MOBILE_PROMO_VIEW ];
		const eventName = evenLookup[ index ];
		recordTracksEvent( eventName );
	};
	// Render one or both promo cards.
	return (
		<>
			{ ! showYoastPromo && (
				<div className="stats__promo-container">
					<div className="stats__promo-card">
						<MobilePromoCard
							className="stats__promo-card-apps"
							clickHandler={ promoCardDidReceiveClick }
						/>
					</div>
				</div>
			) }
			{ showYoastPromo && (
				<div className="stats__promo-container">
					<div className="stats__promo-card">
						<DotPager className="stats__promo-pager" onPageSelected={ pagerDidSelectPage }>
							<PromoCardBlock
								productSlug="wordpress-seo-premium"
								impressionEvent={ EVENT_YOAST_PROMO_VIEW }
								clickEvent="calypso_stats_wordpress_seo_premium_banner_click"
								headerText={ translate( 'Increase site visitors with Yoast SEO Premium' ) }
								contentText={ translate(
									'Purchase Yoast SEO Premium to ensure that more people find your incredible content.'
								) }
								ctaText={ translate( 'Learn more' ) }
								image={ wordpressSeoIllustration }
								href={ `/plugins/wordpress-seo-premium/${ slug }` }
							/>
							<MobilePromoCard
								className="stats__promo-card-apps"
								clickHandler={ promoCardDidReceiveClick }
							/>
						</DotPager>
					</div>
				</div>
			) }
		</>
	);
}
