import { Card, PostStatsCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Count from 'calypso/components/count';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { getCurrentUserLocale } from 'calypso/state/current-user/selectors';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getPostStat } from 'calypso/state/stats/posts/selectors';
import StatsDetailsNavigation from '../stats-details-navigation';
import PostLikes from '../stats-post-likes';

import './style.scss';

type PostThumbnail = {
	ID: number;
	URL: string;
};

type Post = {
	date: string | null;
	title: string;
	type: string | null;
	like_count: number | null;
	post_thumbnail: PostThumbnail | null;
	comment_count: number | null;
};

const POST_STATS_CARD_TITLE_LIMIT = 48;

// Use ellipsis when characters count over the limit
const textTruncator = ( text: string, limit = 48 ) => {
	if ( ! text ) {
		return '';
	}

	const truncatedText = text.substring( 0, limit );

	return `${ truncatedText }${ text.length > limit ? '...' : '' } `;
};

export default function PostDetailHighlightsSection( {
	siteId,
	postId,
	post,
}: {
	siteId: number;
	postId: number;
	post: Post;
} ) {
	const translate = useTranslate();
	const userLocale = useSelector( getCurrentUserLocale );

	const viewCount = useSelector( ( state ) => getPostStat( state, siteId, postId, 'views' ) || 0 );

	const postData = {
		date: post?.date,
		post_thumbnail: post?.post_thumbnail?.URL || null,
		title: decodeEntities( stripHTML( textTruncator( post?.title, POST_STATS_CARD_TITLE_LIMIT ) ) ),
	};

	const isJetpack = useSelector( ( state ) => siteId && isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => siteId && isSiteWpcomAtomic( state, siteId ) );
	const isWPcomSite = ! isJetpack || isAtomic;

	// postId > 0: Show the tabs for posts except for the Home Page (postId = 0).
	// isWPcomSite: The Newsletter Stats is only covering `WPCOM sites` for now.
	const isEmailTabsAvailable = postId > 0 && isWPcomSite;

	return (
		<div className="stats__post-detail-highlights-section">
			{ siteId && (
				<>
					<QuerySiteStats siteId={ siteId } statType="stats" query={ {} } />
					<QuerySiteStats siteId={ siteId } statType="statsInsights" />
				</>
			) }

			<div className="highlight-cards">
				<h1 className="highlight-cards-heading">{ translate( 'Highlights' ) }</h1>

				{ isEmailTabsAvailable && (
					<StatsDetailsNavigation postId={ postId } givenSiteId={ siteId } />
				) }

				<div className="highlight-cards-list">
					<PostStatsCard
						heading={ translate( 'All-time stats' ) }
						likeCount={ post?.like_count || 0 }
						post={ postData }
						viewCount={ viewCount }
						commentCount={ post?.comment_count || 0 }
						locale={ userLocale }
					/>

					<Card className="highlight-card">
						<div className="highlight-card-heading">
							<span>{ translate( 'Post likes' ) }</span>
							<Count count={ post?.like_count || 0 } />
						</div>
						<PostLikes siteId={ siteId } postId={ postId } postType={ post?.type } />
					</Card>
				</div>
			</div>
		</div>
	);
}
