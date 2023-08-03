import config from '@automattic/calypso-config';
import { PostStatsCard, ComponentSwapper } from '@automattic/components';
import { createSelector } from '@automattic/state-utils';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import QueryPosts from 'calypso/components/data/query-posts';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import DotPager from 'calypso/components/dot-pager';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { useSelector } from 'calypso/state';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import {
	getSitePost,
	isRequestingSitePost,
	getPostsForQuery,
	isRequestingPostsForQuery,
} from 'calypso/state/posts/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import {
	getTopPostAndPage,
	hasSiteStatsForQueryFinished,
} from 'calypso/state/stats/lists/selectors';
import LatestPostCard from './latest-post-card';

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
		const period = 'day';
		const quantity = 365;

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

const getStatsTopPostsData = createSelector(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	( state, siteId, topPostsQuery, hasTopViewedPostQueryFinished ) => {
		const { post: topPost, page: topPage } = getTopPostAndPage( state, siteId, topPostsQuery );

		return {
			topPost,
			topPage,
		};
	},
	// Refresh memoized data from createSelector with the loading flag
	( state, siteId, topPostsQuery, isTopViewedPostRequesting ) => [
		topPostsQuery,
		isTopViewedPostRequesting,
	]
);

export default function PostCardsGroup( {
	siteId,
	siteSlug,
}: {
	siteId: number;
	siteSlug: string;
} ) {
	const translate = useTranslate();
	const userLocale = useSelector( getCurrentUserLocale );
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	// Prepare the latest post card.
	const posts = useSelector( ( state ) =>
		getPostsForQuery( state, siteId, { status: 'publish', number: 1 } )
	);
	const isRequestingPosts = useSelector( ( state ) =>
		isRequestingPostsForQuery( state, siteId, { status: 'publish', number: 1 } )
	);
	const latestPost = posts && posts.length ? posts[ 0 ] : null;

	// Get the most `viewed` post from the past period defined in the `topPostsQuery`.
	const { topPostsQuery } = useSelector( ( state ) => getStatsQueries( state, siteId ) );
	const hasTopViewedPostQueryFinished = useSelector( ( state ) =>
		hasSiteStatsForQueryFinished( state, siteId, 'statsTopPosts', topPostsQuery )
	);
	const { topPost: topViewedPost } = useSelector( ( state ) =>
		getStatsTopPostsData( state, siteId, topPostsQuery, hasTopViewedPostQueryFinished )
	);

	// Prepare the most popular post card.
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

	// Check if the most popular post is ready to be displayed.
	const isRequestingMostPopularPost = useSelector( ( state ) =>
		isRequestingSitePost( state, siteId, topViewedPost?.id )
	);
	const isPreparingMostPopularPost = ! hasTopViewedPostQueryFinished || isRequestingMostPopularPost;

	const cards = [];

	// Show two cards when the latest post is not the most popular post or both cards are loading.
	if ( isRequestingPosts || isPreparingMostPopularPost || latestPost?.ID !== mostPopularPost?.ID ) {
		cards.push(
			<LatestPostCard
				key="latestPostCard"
				siteId={ siteId }
				siteSlug={ siteSlug }
				isLoading={ isRequestingPosts }
				latestPost={ latestPost }
			/>
		);
	}

	// Show the most popular post card when it's ready or loading.
	if ( isPreparingMostPopularPost || mostPopularPost ) {
		cards.push(
			<PostStatsCard
				key="mostPopularPostCard"
				heading={ translate( 'Most popular post in the past year' ) }
				likeCount={ mostPopularPostData?.likeCount }
				post={ mostPopularPostData }
				viewCount={ mostPopularPostData?.viewCount }
				commentCount={ mostPopularPostData?.commentCount }
				titleLink={ `/stats/post/${ mostPopularPost?.ID }/${ siteSlug }` }
				uploadHref={ ! isOdysseyStats ? `/post/${ siteSlug }/${ mostPopularPost?.ID }` : undefined }
				locale={ userLocale }
				isLoading={ isPreparingMostPopularPost }
			/>
		);
	}

	const cardsGroup = <div className="highlight-cards-list">{ cards }</div>;
	const mobileCardsGroup = <DotPager>{ cards }</DotPager>;

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

			<ComponentSwapper
				className="all-time-highlights-section__highlight-cards-swapper"
				breakpoint="<660px"
				breakpointActiveComponent={ mobileCardsGroup }
				breakpointInactiveComponent={ cardsGroup }
			/>
		</>
	);
}
