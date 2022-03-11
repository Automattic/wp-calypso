import { translate } from 'i18n-calypso';
import writePost from 'calypso/assets/images/onboarding/site-options.svg';
import Banner from 'calypso/components/banner';
import { useGetHasEverCreatedContent } from 'calypso/data/stats/use-get-has-ever-created-content';
import type { HasEverCreatedContent } from 'calypso/data/stats/use-get-has-ever-created-content';

import './style.scss';

interface StatsNoContentBannerProps {
	siteSlug: string;
	siteId: number;
}

export const StatsNoContentBanner = ( {
	siteId,
	siteSlug,
}: StatsNoContentBannerProps ): JSX.Element | null => {
	const { data, isLoading: isHasEverCreatedContentLoading } = useGetHasEverCreatedContent(
		siteId ?? null,
		{
			retry: false,
		}
	);

	if ( ! data || isHasEverCreatedContentLoading ) {
		return null;
	}

	const renderBanner = (
		siteId: number,
		siteSlug: string,
		hasEverCreatedContent: HasEverCreatedContent
	) => {
		if (
			hasEverCreatedContent?.hasEverPublishedPage ||
			hasEverCreatedContent?.hasEverPublishedPost
		) {
			return null;
		}
		return (
			<Banner
				callToAction={ translate( 'Write a post' ) }
				className="stats-no-content-banner__banner"
				description={ translate(
					'Sites with content get more visitors. We’ve found that adding some personality and introducing yourself is a great start to click with your audience.'
				) }
				disableCircle="true"
				event="calypso_stats_no-content_banner"
				dismissPreferenceName={ `stats-launch-no-content-${ siteSlug }` }
				href={ `/post/${ siteSlug }` }
				iconPath={ writePost }
				title={ translate( 'Start writing your first post to get more views' ) }
				tracksClickName="calypso_stats_no-content_banner_click"
				tracksDismissName="calypso_stats_no-content_banner_dismiss"
				tracksImpressionName="calypso_stats_no-content_banner_view"
			/>
		);
	};

	return (
		<>
			{ isHasEverCreatedContentLoading
				? null
				: renderBanner( siteId, siteSlug, data.hasEverCreatedContent ) }
		</>
	);
};
