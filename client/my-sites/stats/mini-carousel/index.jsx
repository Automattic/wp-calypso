import { translate } from 'i18n-calypso';
import YoastLogo from 'calypso/assets/images/icons/yoast-logo.svg';
import BlazeLogo from 'calypso/components/blaze-logo';
import DotPager from 'calypso/components/dot-pager';
import MiniCarouselBlock from './mini-carousel-block';

import './style.scss';

const MiniCarousel = ( { slug } ) => {
	return (
		<DotPager className="mini-carousel" hasDynamicHeight>
			<MiniCarouselBlock
				clickEvent="calypso_stats_traffic_blaze_banner_click"
				image={ <BlazeLogo className="mini-carousel-blaze" size={ 45 } /> }
				headerText={ translate( 'Promote your content with Blaze' ) }
				contentText={ translate(
					'Grow your audience by promoting your content. Reach millions of users across Tumblr and WordPress.com'
				) }
				ctaText={ translate( 'Create campaign' ) }
				href={ `/advertising/${ slug || '' }` }
			/>
			<MiniCarouselBlock
				clickEvent="calypso_stats_wordpress_seo_premium_banner_click"
				image={ <img src={ YoastLogo } alt="" width={ 45 } height={ 45 } /> }
				headerText={ translate( 'Increase your site visitors with Yoast SEO Premium' ) }
				contentText={ translate(
					'Purchase Yoast SEO Premium to ensure that more people find your incredible content.'
				) }
				ctaText={ translate( 'Get Yoast' ) }
				href={ `/plugins/wordpress-seo-premium/${ slug || '' }` }
			/>
		</DotPager>
	);
};

export default MiniCarousel;
