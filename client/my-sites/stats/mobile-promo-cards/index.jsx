import { recordTracksEvent } from '@automattic/calypso-analytics';
import { translate } from 'i18n-calypso';
import { MobilePromoCard } from 'calypso/../packages/components/src';
import wordpressSeoIllustration from 'calypso/assets/images/illustrations/wordpress-seo-premium.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';
import DotPager from 'calypso/components/dot-pager';

import './style.scss';

export default function MobilePromoCardWrapper( slug ) {
	// do some stuff
	const showMobileAppsPromo = false;
	const showYoastPromo = false;
	const showBothPromoCards = true;
	// handle view events here
	const pagerDidSelectPage = ( index ) => {
		const evenLookup = [
			'calypso_stats_wordpress_seo_premium_banner_view',
			'calypso_stats_traffic_mobile_cta_jetpack_view',
		];
		const eventName = evenLookup[ index ];
		// console.log( `selected index: ${ index } -- event: ${ eventName }` );
		// send an impression event
		recordTracksEvent( eventName );
	};
	// render some stuff
	return (
		<>
			{ /** Promo Card is disabled for Odyssey because it doesn't make much sense in the context, which also removes an API call to `plugins`. */ }
			{ showYoastPromo && (
				<div className="stats-content-promo">
					<PromoCardBlock
						productSlug="wordpress-seo-premium"
						impressionEvent="calypso_stats_wordpress_seo_premium_banner_view"
						clickEvent="calypso_stats_wordpress_seo_premium_banner_click"
						headerText={ translate( 'Increase site visitors with Yoast SEO Premium' ) }
						contentText={ translate(
							'Purchase Yoast SEO Premium to ensure that more people find your incredible content.'
						) }
						ctaText={ translate( 'Learn more' ) }
						image={ wordpressSeoIllustration }
						href={ `/plugins/wordpress-seo-premium/${ slug }` }
					/>
				</div>
			) }
			{ showMobileAppsPromo && (
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
							<div>
								<PromoCardBlock
									productSlug="wordpress-seo-premium"
									impressionEvent="calypso_stats_wordpress_seo_premium_banner_view"
									clickEvent="calypso_stats_wordpress_seo_premium_banner_click"
									headerText={ translate( 'Increase site visitors with Yoast SEO Premium' ) }
									contentText={ translate(
										'Purchase Yoast SEO Premium to ensure that more people find your incredible content.'
									) }
									ctaText={ translate( 'Learn more' ) }
									image={ wordpressSeoIllustration }
									href={ `/plugins/wordpress-seo-premium/${ slug }` }
								/>
							</div>
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
