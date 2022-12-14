import { translate } from 'i18n-calypso';
import wordpressSeoIllustration from 'calypso/assets/images/illustrations/wordpress-seo-premium.svg';
import PromoCardBlock from 'calypso/blocks/promo-card-block';

import './style.scss';

export default function MobilePromoCardWrapper( slug ) {
	// do some stuff
	// const slug = 'hello-slug';
	// render some stuff
	return (
		<>
			{ /** Promo Card is disabled for Odyssey because it doesn't make much sense in the context, which also removes an API call to `plugins`. */ }

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
		</>
	);
}
