import { recordTracksEvent } from '@automattic/calypso-analytics';
import { MobilePromoCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import blazeDropDownIllustration from 'calypso/assets/images/illustrations/blaze-drop-down.svg';
import wordpressSeoIllustration from 'calypso/assets/images/illustrations/wordpress-seo-premium.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import DotPager from 'calypso/components/dot-pager';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

import './style.scss';

const EVENT_YOAST_PROMO_VIEW = 'calypso_stats_wordpress_seo_premium_banner_view';
const EVENT_BLAZE_PROMO_VIEW = 'calypso_stats_blaze_banner_view';
const EVENT_MOBILE_PROMO_VIEW = 'calypso_stats_traffic_mobile_cta_jetpack_view';

export default function PromoCards( { isOdysseyStats, slug } ) {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);

	// Yoast promo is disabled for Odyssey & self-hosted.
	// Mobile apps promos are always shown.
	const showBlazePromo = ! isOdysseyStats;
	const showYoastPromo = ! isOdysseyStats && ! jetpackNonAtomic;

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
		const eventLookup = [ EVENT_BLAZE_PROMO_VIEW, EVENT_YOAST_PROMO_VIEW, EVENT_MOBILE_PROMO_VIEW ];
		const eventName = eventLookup[ index ];
		recordTracksEvent( eventName );
	};

	// Trigger initial view event as DotPager don't call it.
	useEffect( () => pagerDidSelectPage( 0 ) );

	return (
		<div className="stats__promo-container">
			<div className="stats__promo-card">
				<DotPager className="stats__promo-pager" onPageSelected={ pagerDidSelectPage }>
					{ showBlazePromo && (
						<PromoCardBlock
							productSlug="blaze"
							clickEvent="calypso_stats_blaze_banner_click"
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
