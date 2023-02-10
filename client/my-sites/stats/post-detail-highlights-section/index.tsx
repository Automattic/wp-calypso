import config from '@automattic/calypso-config';
import { Card, PostStatsCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { decodeEntities, stripHTML } from 'calypso/lib/formatting';
import { getPostStat } from 'calypso/state/stats/posts/selectors';
import StatsDetailsNavigation from '../stats-details-navigation';
import PostLikes from '../stats-post-likes';

import './style.scss';

type PostThumbnail = {
	ID: number;
	URL: string;
};

type PostDiscussion = {
	comment_count: number;
	comment_status: string;
	comments_open: boolean;
	ping_status: string;
	pings_open: boolean;
};

type Post = {
	date: string;
	title: string;
	type: string;
	like_count: number;
	post_thumbnail: PostThumbnail | null;
	discussion: PostDiscussion;
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

	const viewCount = useSelector( ( state ) => getPostStat( state, siteId, postId, 'views' ) || 0 );

	const postData = {
		date: post?.date,
		post_thumbnail: post?.post_thumbnail?.URL || null,
		title: decodeEntities( stripHTML( textTruncator( post?.title, POST_STATS_CARD_TITLE_LIMIT ) ) ),
	};

	return (
		<div className="stats__post-detail-highlights-section">
			{ siteId && (
				<>
					<QuerySiteStats siteId={ siteId } statType="stats" query={ {} } />
					<QuerySiteStats siteId={ siteId } statType="statsInsights" />
				</>
			) }

			<div className="highlight-cards">
				{ config.isEnabled( 'newsletter/stats' ) && (
					<StatsDetailsNavigation postId={ postId } givenSiteId={ siteId } />
				) }

				<h1 className="highlight-cards-heading">{ translate( 'Highlights' ) }</h1>

				<div className="highlight-cards-list">
					<PostStatsCard
						heading={ translate( 'All-time stats' ) }
						likeCount={ post?.like_count }
						post={ postData }
						viewCount={ viewCount }
						commentCount={ post?.discussion?.comment_count }
					/>

					<Card className="highlight-card">
						<div className="highlight-card-heading">
							<span>{ translate( 'Post likes' ) }</span>
							<span className="likes-count">{ post?.like_count || 0 }</span>
						</div>
						{ !! postId && (
							<PostLikes siteId={ siteId } postId={ postId } postType={ post?.type } />
						) }
					</Card>
				</div>
			</div>
		</div>
	);
}
