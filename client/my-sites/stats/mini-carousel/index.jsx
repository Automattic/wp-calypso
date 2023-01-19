import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import YoastLogo from 'calypso/assets/images/icons/yoast-logo.svg';
import BlazeLogo from 'calypso/components/blaze-logo';
import DotPager from 'calypso/components/dot-pager';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import MiniCarouselBlock from './mini-carousel-block';

import './style.scss';

const MiniCarousel = ( { slug, isOdysseyStats } ) => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);

	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	// Blaze promo is disabled for Odyssey.
	const showBlazePromo = ! isOdysseyStats && shouldShowAdvertisingOption;
	// Yoast promo is disabled for Odyssey & self-hosted & non-traffic pages.
	const showYoastPromo = ! isOdysseyStats && ! jetpackNonAtomic;

	const blocks = [];

	if ( showBlazePromo ) {
		blocks.push(
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
		);
	}

	if ( showYoastPromo ) {
		blocks.push(
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
		);
	}

	if ( blocks.length === 0 ) {
		return null;
	}

	return (
		<DotPager className="mini-carousel" hasDynamicHeight>
			{ blocks }
		</DotPager>
	);
};

export default MiniCarousel;
