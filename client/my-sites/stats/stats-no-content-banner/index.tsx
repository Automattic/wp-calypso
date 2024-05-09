import { translate } from 'i18n-calypso';
import writePost from 'calypso/assets/images/onboarding/site-options.svg';
import Banner from 'calypso/components/banner';
import { useHasNeverPublishedPost } from 'calypso/data/stats/use-has-never-published-post';

import './style.scss';

interface StatsNoContentBannerProps {
	siteSlug: string;
	siteId: number;
}

export const StatsNoContentBanner = ( { siteId, siteSlug }: StatsNoContentBannerProps ) => {
	const { data: hasNeverPublishedPost, isLoading: isHasNeverPublishedPostLoading } =
		useHasNeverPublishedPost( siteId ?? null, true, {
			retry: false,
		} );

	if ( ! hasNeverPublishedPost || isHasNeverPublishedPostLoading ) {
		return null;
	}

	return (
		<Banner
			callToAction={ translate( 'Write a post' ) }
			className="stats-no-content-banner__banner"
			description={ translate(
				'Sites with content get more visitors. We’ve found that adding some personality and introducing yourself is a great start to click with your audience.'
			) }
			disableCircle
			event="calypso_stats_no-content_banner"
			dismissPreferenceName={ `stats-launch-no-content-${ siteSlug }` }
			href={ `/post/${ siteSlug }` }
			iconPath={ writePost }
			title={ translate( 'Start writing your first post to get more views' ) }
			tracksClickName="calypso_stats_no_content_banner_click"
			tracksDismissName="calypso_stats_no_content_banner_dismiss"
			tracksImpressionName="calypso_stats_no_content_banner_view"
		/>
	);
};
