import config from '@automattic/calypso-config';
import { PostStatsCard, ComponentSwapper } from '@automattic/components';
import { createSelector } from '@automattic/state-utils';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useSelector } from 'react-redux';
import QueryPosts from 'calypso/components/data/query-posts';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import DotPager from 'calypso/components/dot-pager';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import { getSitePost } from 'calypso/state/posts/selectors';
import { getSiteOption } from 'calypso/state/sites/selectors';
import {
	getTopPostAndPage,
	isRequestingSiteStatsForQuery,
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

const getStatsData = createSelector(
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	( state, siteId, topPostsQuery, isTopViewedPostRequesting ) => {
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

	const { topPostsQuery } = useSelector( ( state ) => getStatsQueries( state, siteId ) );

	const isTopViewedPostRequesting = useSelector( ( state ) =>
		isRequestingSiteStatsForQuery( state, siteId, 'statsTopPosts', topPostsQuery )
	);

	// Get the most `viewed` post from the past period defined in the `topPostsQuery`.
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

	const cards = [ <LatestPostCard siteId={ siteId } siteSlug={ siteSlug } /> ];
	if ( ! isTopViewedPostRequesting && mostPopularPost ) {
		cards.push(
			<PostStatsCard
				heading={ translate( 'Most popular post in the past year' ) }
				likeCount={ mostPopularPostData?.likeCount }
				post={ mostPopularPostData }
				viewCount={ mostPopularPostData?.viewCount }
				commentCount={ mostPopularPostData?.commentCount }
				titleLink={ `/stats/post/${ mostPopularPost.ID }/${ siteSlug }` }
				uploadHref={ ! isOdysseyStats ? `/post/${ siteSlug }/${ mostPopularPost.ID }` : undefined }
				locale={ userLocale }
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
