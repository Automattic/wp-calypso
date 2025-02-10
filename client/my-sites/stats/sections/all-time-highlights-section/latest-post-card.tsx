import config from '@automattic/calypso-config';
import { PostStatsCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import QueryPostStats from 'calypso/components/data/query-post-stats';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getPostStat, isRequestingPostStats } from 'calypso/state/stats/posts/selectors';
import { getProcessedText, truncateWithLimit } from '../../text-utils';

const POST_STATS_CARD_TITLE_LIMIT = 60;

interface LatestPost {
	ID: number;
	date: string;
	post_thumbnail: {
		URL: string;
	};
	title: string;
	like_count: number;
	discussion: {
		comment_count: number;
	};
}

export default function LatestPostCard( {
	siteId,
	siteSlug,
	latestPost,
	isLoading,
}: {
	siteId: number;
	siteSlug: string;
	latestPost: LatestPost;
	isLoading: boolean;
} ) {
	const translate = useTranslate();
	const userLocale = useSelector( getCurrentUserLocale );
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const lastesPostViewCount = useSelector( ( state ) =>
		getPostStat( state, siteId, latestPost?.ID, 'views' )
	);
	const isRequestingLatestPostViewCount = useSelector( ( state ) =>
		isRequestingPostStats( state, siteId, latestPost?.ID, [ 'views' ] )
	);

	const isLoadingLatestPost = isLoading || isRequestingLatestPostViewCount;

	const latestPostData = {
		date: latestPost?.date,
		post_thumbnail: latestPost?.post_thumbnail?.URL || null,
		title: truncateWithLimit( getProcessedText( latestPost?.title ), POST_STATS_CARD_TITLE_LIMIT ),
		likeCount: latestPost?.like_count,
		viewCount: lastesPostViewCount || 0,
		commentCount: latestPost?.discussion?.comment_count,
	};

	return (
		<>
			{ siteId && latestPost && (
				<QueryPostStats siteId={ siteId } postId={ latestPost.ID } fields={ [ 'views' ] } />
			) }

			{ ( isLoadingLatestPost || latestPost ) && (
				<PostStatsCard
					heading={ translate( 'Latest post' ) }
					likeCount={ latestPostData?.likeCount }
					post={ latestPostData }
					viewCount={ latestPostData?.viewCount }
					commentCount={ latestPostData?.commentCount }
					titleLink={ `/stats/post/${ latestPost?.ID }/${ siteSlug }` }
					uploadHref={ ! isOdysseyStats ? `/post/${ siteSlug }/${ latestPost?.ID }` : undefined }
					locale={ userLocale }
					isLoading={ isLoadingLatestPost }
				/>
			) }
		</>
	);
}
