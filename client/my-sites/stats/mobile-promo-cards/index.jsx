import { recordTracksEvent } from '@automattic/calypso-analytics';
import { MobilePromoCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import blazeDropDownIllustration from 'calypso/assets/images/illustrations/blaze-drop-down.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import DotPager from 'calypso/components/dot-pager';

import './style.scss';

const EVENT_BLAZE_PROMO_VIEW = 'calypso_stats_blaze_banner_view';
const EVENT_MOBILE_PROMO_VIEW = 'calypso_stats_traffic_mobile_cta_jetpack_view';

export default function MobilePromoCardWrapper( { isJetpack, isOdysseyStats, slug } ) {
	// Blaze promo is disabled for Odyssey & self-hosted.
	// Mobile apps promos are always shown.
	const showBlazePromo = ! isOdysseyStats && ! isJetpack;
	const showBothPromoCards = showBlazePromo;
	// Handle initial view event if not using the DotPager UI.
	// We don't worry about the Blaze card as it sends on mount.
	useEffect( () => {
		if ( ! showBothPromoCards ) {
			recordTracksEvent( EVENT_MOBILE_PROMO_VIEW );
		}
	}, [ showBothPromoCards ] );
	// Handle click events from promo card.
	const promoCardDidReceiveClick = ( event ) => {
		// Events need to incorporate the page and the click type.
		// This will allow us to account for integration across different pages.
		// FORMAT: calypso_stats_PAGE_mobile_cta_EVENT
		const tracksEventName = `calypso_stats_traffic_mobile_cta_${ event.replaceAll( '-', '_' ) }`;
		recordTracksEvent( tracksEventName );
	};
	// Handle view events from DotPager UI.
	const pagerDidSelectPage = ( index ) => {
		const eventLookup = [ EVENT_BLAZE_PROMO_VIEW, EVENT_MOBILE_PROMO_VIEW ];
		const eventName = eventLookup[ index ];
		recordTracksEvent( eventName );
	};
	// Render one or both promo cards.
	return (
		<>
			{ ! showBothPromoCards && (
				<div className="stats__promo-container">
					<div className="stats__promo-card">
						<MobilePromoCard
							className="stats__promo-card-apps"
							clickHandler={ promoCardDidReceiveClick }
						/>
					</div>
				</div>
			) }
			{ showBothPromoCards && (
				<div className="stats__promo-container">
					<div className="stats__promo-card">
						<DotPager className="stats__promo-pager" onPageSelected={ pagerDidSelectPage }>
							<PromoCardBlock
								productSlug="blaze"
								impressionEvent={ EVENT_BLAZE_PROMO_VIEW }
								clickEvent="calypso_stats_blaze_banner_click"
								headerText={ translate( 'Reach new readers and customers' ) }
								contentText={ translate(
									'Use WordPress Blaze to increase your reach by promoting your work to the larger WordPress.com community of blogs and sites. '
								) }
								ctaText={ translate( 'Get started' ) }
								image={ blazeDropDownIllustration }
								href={ `/advertising/${ slug || '' }` }
							/>

							<div>
								<MobilePromoCard
									className="stats__promo-card-apps"
									clickHandler={ promoCardDidReceiveClick }
								/>
							</div>
						</DotPager>
					</div>
				</div>
			) }
		</>
	);
}
