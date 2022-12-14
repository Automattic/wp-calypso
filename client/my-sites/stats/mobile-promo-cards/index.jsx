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

export default function MobilePromoCardWrapper( { isJetpack, isOdysseyStats, slug } ) {
	// do some stuff
	// Yoast promo is disabled for Odyssey & self-hosted.
	// Mobile apps promos are always shown.
	const showYoastPromo = ! isOdysseyStats && ! isJetpack;
	const showBothPromoCards = showYoastPromo;
	// send first impression if not using the DotPager UI
	// we don't worry about the Yoast card as it sends on mount
	useEffect( () => {
		if ( ! showBothPromoCards ) {
			// sent tracks event
			recordTracksEvent( EVENT_MOBILE_PROMO_VIEW );
		}
	}, [ showBothPromoCards ] );
	// handle view events here
	const pagerDidSelectPage = ( index ) => {
		const evenLookup = [ EVENT_YOAST_PROMO_VIEW, EVENT_MOBILE_PROMO_VIEW ];
		const eventName = evenLookup[ index ];
		// console.log( `selected index: ${ index } -- event: ${ eventName }` );
		// send an impression event
		recordTracksEvent( eventName );
	};
	// render some stuff
	return (
		<>
			{ ! showBothPromoCards && (
				<div className="stats__promo-container">
					<div className="stats__promo-card">
						<MobilePromoCard className="stats__promo-card-apps" />
					</div>
				</div>
			) }
			{ showBothPromoCards && (
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

							<div>
								<MobilePromoCard className="stats__promo-card-apps" />
							</div>
						</DotPager>
					</div>
				</div>
			) }
		</>
	);
}
