import { formatNumber } from '@automattic/number-formatters';
import { __experimentalHStack as HStack } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import { useSocialAnalytics } from './analytics-context';
import { BlogAboutButton } from './blog-about-button';
import { LikeButton } from './like-button';
import { useLikeAction } from './like-context';
import { RepostButton } from './repost-button';
import { useRepostAction } from './repost-context';
import type { SocialPost } from '../../types';

const ICON_SIZE = 18;

interface PostCardCountsProps {
	post: SocialPost;
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

	// Generic "{{strong}}%(count)s{{/strong}} <noun>" form used by both the
	// no-adapter fallback and the quotes stat (which has no per-protocol slot —
	// ATmosphere is the only protocol that exposes `counts.quotes` today).
	// Add a `statRowQuoteText` adapter slot the day a second protocol grows
	// native quotes.
	const fallbackRepostsText = translate(
		'{{strong}}%(count)s{{/strong}} repost',
		'{{strong}}%(count)s{{/strong}} reposts',
		{
			count: counts.reposts,
			args: { count: formatNumber( counts.reposts ) },
			components: { strong: <strong /> },
		}
	);
	const fallbackLikesText = translate(
		'{{strong}}%(count)s{{/strong}} like',
		'{{strong}}%(count)s{{/strong}} likes',
		{
			count: counts.likes,
			args: { count: formatNumber( counts.likes ) },
			components: { strong: <strong /> },
		}
	);
	const quotesText = translate(
		'{{strong}}%(count)s{{/strong}} quote',
		'{{strong}}%(count)s{{/strong}} quotes',
		{
			count: counts.quotes,
			args: { count: formatNumber( counts.quotes ) },
			components: { strong: <strong /> },
		}
	);

	const repostsText = repostAction.supported
		? repostAction.label.statRowText( counts.reposts )
		: fallbackRepostsText;
	const likesText = likeAction.supported
		? likeAction.label.statRowText( counts.likes )
		: fallbackLikesText;

	const showStatsRow = hideCount && totalReposts + counts.likes > 0;

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
				<div
					role="list"
					aria-label={ translate( 'Post stats', {
						comment:
							'Accessible label for the engagement-summary list (reposts/quotes/likes) above a focused post.',
						textOnly: true,
					} ) }
					className="social-post-card-stats"
				>
					{ counts.reposts > 0 && (
						<span role="listitem" className="social-post-card-stats__item">
							{ repostsText }
						</span>
					) }
					{ counts.quotes > 0 && (
						<span role="listitem" className="social-post-card-stats__item">
							{ quotesText }
						</span>
					) }
					{ counts.likes > 0 && (
						<span role="listitem" className="social-post-card-stats__item">
							{ likesText }
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
				<BlogAboutButton post={ post } />
			</HStack>
		</>
	);
}
