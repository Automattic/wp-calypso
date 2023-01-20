import { recordTracksEvent } from '@automattic/calypso-analytics';
import { translate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import YoastLogo from 'calypso/assets/images/icons/yoast-logo.svg';
import writePost from 'calypso/assets/images/onboarding/site-options.svg';
import BlazeLogo from 'calypso/components/blaze-logo';
import DotPager from 'calypso/components/dot-pager';
import { useHasNeverPublishedPost } from 'calypso/data/stats/use-has-never-published-post';
import { PromoteWidgetStatus, usePromoteWidget } from 'calypso/lib/promote-post';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import MiniCarouselBlock from './mini-carousel-block';
import { isBlockDismissed } from './selectors';

import './style.scss';

const EVENT_TRAFFIC_BLAZE_PROMO_VIEW = 'calypso_stats_traffic_blaze_banner_view';
const EVENT_TRAFFIC_BLAZE_PROMO_CLICK = 'calypso_stats_traffic_blaze_banner_click';
const EVENT_TRAFFIC_BLAZE_PROMO_DISMISS = 'calypso_stats_traffic_blaze_banner_dismiss';
const EVENT_YOAST_PROMO_VIEW = 'calypso_stats_wordpress_seo_premium_banner_view';
const EVENT_YOAST_PROMO_CLICK = 'calypso_stats_wordpress_seo_premium_banner_click';
const EVENT_YOAST_PROMO_DISMISS = 'calypso_stats_wordpress_seo_premium_banner_dismiss';
const EVENT_NO_CONTENT_BANNER_VIEW = 'calypso_stats_no_content_banner_view';
const EVENT_NO_CONTENT_BANNER_CLICK = 'calypso_stats_no_content_banner_click';
const EVENT_NO_CONTENT_BANNER_DISMISS = 'calypso_stats_no_content_banner_dismiss';

const MiniCarousel = ( { slug, isOdysseyStats, isSitePrivate } ) => {
	const selectedSiteId = useSelector( ( state ) => getSelectedSiteId( state ) );

	const { data: hasNeverPublishedPost, isLoading: isHasNeverPublishedPostLoading } =
		useHasNeverPublishedPost( selectedSiteId ?? null, true, {
			retry: false,
		} );

	const jetpackNonAtomic = useSelector(
		( state ) => isJetpackSite( state, selectedSiteId ) && ! isAtomicSite( state, selectedSiteId )
	);

	// Keep a replica of the pager index state.
	// TODO: Figure out an approach that doesn't require replicating state value from DotPager.
	const [ dotPagerIndex, setDotPagerIndex ] = useState( 0 );

	const shouldShowAdvertisingOption = usePromoteWidget() === PromoteWidgetStatus.ENABLED;

	// Write a Post banner.
	const showWriteAPostBanner =
		! isSitePrivate && hasNeverPublishedPost && ! isHasNeverPublishedPostLoading;

	// Blaze promo is disabled for Odyssey.
	const showBlazePromo =
		! useSelector( isBlockDismissed( 'calypso_stats_traffic_blaze_banner_dismiss' ) ) &&
		! isOdysseyStats &&
		shouldShowAdvertisingOption;

	// Yoast promo is disabled for Odyssey & self-hosted & non-traffic pages.
	const showYoastPromo =
		! useSelector( isBlockDismissed( 'calypso_stats_wordpress_seo_premium_banner_dismiss' ) ) &&
		! isOdysseyStats &&
		! jetpackNonAtomic;

	const viewEvents = useMemo( () => {
		const events = [];
		showWriteAPostBanner && events.push( EVENT_NO_CONTENT_BANNER_VIEW );
		showBlazePromo && events.push( EVENT_TRAFFIC_BLAZE_PROMO_VIEW );
		showYoastPromo && events.push( EVENT_YOAST_PROMO_VIEW );
		return events;
	}, [ showWriteAPostBanner, showBlazePromo, showYoastPromo ] );

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

	const pagerDidSelectPage = ( index ) => setDotPagerIndex( index );

	const blocks = [];

	if ( showWriteAPostBanner ) {
		blocks.push(
			<MiniCarouselBlock
				clickEvent={ EVENT_NO_CONTENT_BANNER_CLICK }
				dismissEvent={ EVENT_NO_CONTENT_BANNER_DISMISS }
				image={ <img src={ writePost } alt="" width={ 45 } height={ 45 } /> }
				headerText={ translate( 'Start writing your first post to get more views' ) }
				contentText={ translate(
					'Sites with content get more visitors. We’ve found that adding some personality and introducing yourself is a great start to click with your audience.'
				) }
				ctaText={ translate( 'Write a post' ) }
				href={ `/post/${ slug }` }
				key="write-a-post"
			/>
		);
	}

	if ( showBlazePromo ) {
		blocks.push(
			<MiniCarouselBlock
				clickEvent={ EVENT_TRAFFIC_BLAZE_PROMO_CLICK }
				image={ <BlazeLogo className="mini-carousel-blaze" size={ 45 } /> }
				headerText={ translate( 'Promote your content with Blaze' ) }
				contentText={ translate(
					'Grow your audience by promoting your content. Reach millions of users across Tumblr and WordPress.com'
				) }
				ctaText={ translate( 'Create campaign' ) }
				href={ `/advertising/${ slug || '' }` }
				dismissEvent={ EVENT_TRAFFIC_BLAZE_PROMO_DISMISS }
				key="blaze"
			/>
		);
	}

	if ( showYoastPromo ) {
		blocks.push(
			<MiniCarouselBlock
				clickEvent={ EVENT_YOAST_PROMO_CLICK }
				image={ <img src={ YoastLogo } alt="" width={ 45 } height={ 45 } /> }
				headerText={ translate( 'Increase your site visitors with Yoast SEO Premium' ) }
				contentText={ translate(
					'Purchase Yoast SEO Premium to ensure that more people find your incredible content.'
				) }
				ctaText={ translate( 'Get Yoast' ) }
				href={ `/plugins/wordpress-seo-premium/${ slug || '' }` }
				dismissEvent={ EVENT_YOAST_PROMO_DISMISS }
				key="yoast"
			/>
		);
	}

	if ( blocks.length === 0 ) {
		return null;
	}

	return (
		<DotPager className="mini-carousel" hasDynamicHeight onPageSelected={ pagerDidSelectPage }>
			{ blocks }
		</DotPager>
	);
};

export default MiniCarousel;
