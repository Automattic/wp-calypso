import config from '@automattic/calypso-config';
import { PostStatsCard } from '@automattic/components';
import { createSelector } from '@automattic/state-utils';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useSelector } from 'react-redux';
import QueryPosts from 'calypso/components/data/query-posts';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { getSitePost } from 'calypso/state/posts/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import {
	getTopPostAndPage,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';

const POST_STATS_CARD_TITLE_LIMIT = 60;

// Use ellipsis when characters count over the limit.
// TODO: Extract to shared utilities
const textTruncator = ( text: string, limit = 48 ) => {
	if ( ! text ) {
		return '';
	}

	const truncatedText = text.substring( 0, limit );

	return `${ truncatedText }${ text.length > limit ? '...' : '' } `;
};

const getStatsQueries = createSelector(
	( state, siteId ) => {
		const period = 'year';
		const quantity = 1;

		const gmtOffset = getSiteOption( state, siteId, 'gmt_offset' ) as string | number;
		const date = moment()
			.utcOffset( Number.isFinite( gmtOffset ) ? gmtOffset : 0 )
			.format( 'YYYY-MM-DD' );

		const topPostsQuery = {
			date,
			num: quantity,
			period,
		};

		return {
			topPostsQuery,
		};
	},
	( state, siteId ) => getSiteOption( state, siteId, 'gmt_offset' )
);

const getStatsData = createSelector(
	( state, siteId, topPostsQuery ) => {
		const { post: topPost, page: topPage } = getTopPostAndPage( state, siteId, topPostsQuery );

		return {
			topPost,
			topPage,
		};
	},
	( state, siteId, topPostsQuery, isTopViewedPostRequesting ) => [
		topPostsQuery,
		isTopViewedPostRequesting,
	]
);

export default function MostPopularPostCard( {
	siteId,
	siteSlug,
}: {
	siteId: number;
	siteSlug: string;
} ) {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const { topPostsQuery } = useSelector( ( state ) => getStatsQueries( state, siteId ) );

	const isTopViewedPostRequesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'statsTopPosts', topPostsQuery )
	);

	// Get the most `viewed` post from the past period defined in the `topPostsQuery`.
	// Refresh memoized data from `createSelector` with the loading flag
	const { topPost: topViewedPost } = useSelector( ( state ) =>
		getStatsData( state, siteId, topPostsQuery, isTopViewedPostRequesting )
	);

	const mostPopularPost = useSelector( ( state ) =>
		getSitePost( state, siteId, topViewedPost?.id )
	);

	const mostPopularPostData = {
		date: mostPopularPost?.date,
		post_thumbnail: mostPopularPost?.post_thumbnail?.URL || null,
		title: decodeEntities(
			stripHTML( textTruncator( mostPopularPost?.title, POST_STATS_CARD_TITLE_LIMIT ) )
		),
		likeCount: mostPopularPost?.like_count,
		viewCount: topViewedPost?.views,
		commentCount: mostPopularPost?.discussion?.comment_count,
	};

	return (
		<>
			{ siteId && (
				<>
					<QuerySiteStats siteId={ siteId } statType="statsTopPosts" query={ topPostsQuery } />
				</>
			) }

			{ siteId && topViewedPost && (
				<>
					<QueryPosts siteId={ siteId } postId={ topViewedPost.id } query={ {} } />
				</>
			) }

			{ ! isTopViewedPostRequesting && mostPopularPost && (
				<PostStatsCard
					heading={ translate( 'Most popular post in the past year' ) }
					likeCount={ mostPopularPostData?.likeCount }
					post={ mostPopularPostData }
					viewCount={ mostPopularPostData?.viewCount }
					commentCount={ mostPopularPostData?.commentCount }
					titleLink={ `/stats/post/${ mostPopularPost.ID }/${ siteSlug }` }
					uploadHref={
						! isOdysseyStats ? `/post/${ siteSlug }/${ mostPopularPost.ID }` : undefined
					}
				/>
			) }
		</>
	);
}
