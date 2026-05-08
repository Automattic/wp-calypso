import { formatNumber } from '@automattic/number-formatters';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import { useSocialAnalytics } from './analytics-context';
import { LikeButton } from './like-button';
import { useLikeAction } from './like-context';
import { RepostButton } from './repost-button';
import { useRepostAction } from './repost-context';
import type { SocialPost } from '../../types';

const ICON_SIZE = 18;

interface PostCardCountsProps {
	post: SocialPost;
	connectionId?: number;
	prominentTimestamp?: boolean;
}

export function PostCardCounts( { post, prominentTimestamp }: PostCardCountsProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const counts = post.counts;
	const postUri = post.uri;
	const inAppUrl = analytics?.getThreadUrl?.( postUri ) ?? null;
	const hideCount = Boolean( prominentTimestamp );

	const likeAction = useLikeAction( post );
	const repostAction = useRepostAction( post );

	// totalReposts (reposts + quotes) is used only to decide whether the stats
	// row should appear at all. Each stat item uses its own native count.
	const totalReposts = counts.reposts + counts.quotes;

	const repostsNoun = repostAction.supported
		? repostAction.label.statRowNoun( counts.reposts )
		: translate( 'repost', 'reposts', { count: counts.reposts, textOnly: true } );
	const likesNoun = likeAction.supported
		? likeAction.label.statRowNoun( counts.likes )
		: translate( 'like', 'likes', { count: counts.likes, textOnly: true } );
	const quotesNoun = translate( 'quote', 'quotes', { count: counts.quotes, textOnly: true } );

	const showStatsRow = Boolean( prominentTimestamp ) && totalReposts + counts.likes > 0;

	const formattedReposts = formatNumber( counts.reposts );
	const formattedQuotes = formatNumber( counts.quotes );
	const formattedLikes = formatNumber( counts.likes );

	const fireRepliesClicked = ( destination: 'in_app_thread' | 'bsky_app' | 'composer' ) => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_replies_count_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: postUri,
			replies_count: counts.replies,
			destination,
		} );
	};

	const repliesContent = (
		<>
			<ReaderCommentIcon iconSize={ ICON_SIZE } />
			<span className="screen-reader-text">{ translate( 'Replies:' ) } </span>
			{ ! hideCount && counts.replies }
		</>
	);

	const renderRepliesNode = () => {
		// Render the interactive reply button when an `onReplyClick`
		// handler is bound by the per-protocol shell. The shell decides
		// what addressing it needs from the post (atmosphere requires a
		// strong-ref `cid` and bails internally; Mastodon only uses
		// `post.uri` as the status_id). Don't gate on `post.cid` here —
		// Mastodon posts never carry a `cid`, so an extra `cid` check
		// would dark-ship the reply button on the very protocol that
		// needs it.
		if ( analytics?.onReplyClick ) {
			const onReplyClick = analytics.onReplyClick;
			return (
				<button
					type="button"
					className="social-post-card-counts__reply-button"
					onClick={ () => {
						onReplyClick( post );
						fireRepliesClicked( 'composer' );
					} }
					aria-label={ translate( 'Reply, %(count)d reply', 'Reply, %(count)d replies', {
						count: counts.replies,
						args: { count: counts.replies },
						textOnly: true,
					} ) }
				>
					{ repliesContent }
				</button>
			);
		}
		if ( inAppUrl ) {
			return (
				<a
					className="social-post-card-counts__link"
					href={ inAppUrl }
					onClick={ () => fireRepliesClicked( 'in_app_thread' ) }
				>
					{ repliesContent }
				</a>
			);
		}
		return <span>{ repliesContent }</span>;
	};

	return (
		<>
			{ showStatsRow && (
				<div className="social-post-card-stats">
					{ counts.reposts > 0 && (
						<span className="social-post-card-stats__item">
							<strong>{ formattedReposts }</strong> { String( repostsNoun ) }
						</span>
					) }
					{ counts.quotes > 0 && (
						<span className="social-post-card-stats__item">
							<strong>{ formattedQuotes }</strong> { String( quotesNoun ) }
						</span>
					) }
					{ counts.likes > 0 && (
						<span className="social-post-card-stats__item">
							<strong>{ formattedLikes }</strong> { String( likesNoun ) }
						</span>
					) }
				</div>
			) }
			<HStack
				alignment="center"
				spacing={ 4 }
				justify="flex-start"
				className={ clsx( 'social-post-card-counts', {
					'social-post-card-counts--prominent-timestamp': prominentTimestamp,
				} ) }
			>
				{ renderRepliesNode() }
				<RepostButton post={ post } hideCount={ hideCount } />
				<LikeButton post={ post } hideCount={ hideCount } />
			</HStack>
		</>
	);
}
