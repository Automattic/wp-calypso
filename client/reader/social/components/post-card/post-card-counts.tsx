import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon, quote } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import ReaderRepostIcon from 'calypso/reader/components/icons/repost';
import { useSocialAnalytics } from './analytics-context';
import { LikeButton } from './like-button';
import { QuoteButton } from './quote-button';
import { RepostButton } from './repost-button';
import type { SocialPost } from '../../types';

const ICON_SIZE = 16;

interface PostCardCountsProps {
	post: SocialPost;
	connectionId?: number;
}

export function PostCardCounts( { post, connectionId }: PostCardCountsProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const counts = post.counts;
	const postUri = post.uri;
	const inAppUrl = analytics?.getThreadUrl?.( postUri ) ?? null;

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
			{ counts.replies }
		</>
	);

	const renderRepliesNode = () => {
		// Mirror the like-button gating: only render the interactive
		// reply button when we have both an `onReplyClick` handler AND
		// a strong-ref `cid` to address the post (atmosphere posts
		// without `cid` would silently no-op the click and emit a
		// phantom `replies_count_clicked / destination=composer` Tracks
		// event). Fall through to the in-app/external thread link or
		// the static count otherwise.
		if ( analytics?.onReplyClick && post.cid ) {
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
		<HStack
			alignment="center"
			spacing={ 4 }
			justify="flex-start"
			className="social-post-card-counts"
		>
			{ renderRepliesNode() }
			{ connectionId && post.cid ? (
				<RepostButton
					post={ {
						uri: post.uri,
						cid: post.cid,
						counts: post.counts,
						viewer: post.viewer,
					} }
					connectionId={ connectionId }
					onQuote={ analytics?.onQuoteClick ? () => analytics.onQuoteClick?.( post ) : undefined }
				/>
			) : (
				<span>
					<ReaderRepostIcon iconSize={ ICON_SIZE } />
					<span className="screen-reader-text">{ translate( 'Reposts:' ) } </span>
					{ counts.reposts }
				</span>
			) }
			{ connectionId && post.cid ? (
				<LikeButton
					post={ {
						uri: post.uri,
						cid: post.cid,
						counts: post.counts,
						viewer: post.viewer,
					} }
					connectionId={ connectionId }
				/>
			) : (
				<span>
					<ReaderLikeIcon iconSize={ ICON_SIZE } liked={ false } />
					<span className="screen-reader-text">{ translate( 'Likes:' ) } </span>
					{ counts.likes }
				</span>
			) }
			{ connectionId && post.cid && analytics?.onQuoteClick ? (
				<QuoteButton post={ post } />
			) : (
				<span>
					<Icon icon={ quote } size={ ICON_SIZE } />
					<span className="screen-reader-text">{ translate( 'Quotes:' ) } </span>
					{ counts.quotes }
				</span>
			) }
		</HStack>
	);
}
