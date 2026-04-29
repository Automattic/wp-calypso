import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon, quote } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import ReaderRepostIcon from 'calypso/reader/components/icons/repost';
import { useSocialAnalytics } from './analytics-context';
import type { SocialCounts } from '../../types';

const ICON_SIZE = 16;

interface PostCardCountsProps {
	counts: SocialCounts;
	postUri: string;
}

export function PostCardCounts( { counts, postUri }: PostCardCountsProps ) {
	const translate = useTranslate();
	const analytics = useSocialAnalytics();
	const inAppUrl = analytics?.getThreadUrl?.( postUri ) ?? null;

	const fireRepliesClicked = () => {
		if ( ! analytics ) {
			return;
		}
		analytics.onClick( `calypso_reader_${ analytics.source }_timeline_replies_count_clicked`, {
			connection_id: analytics.connectionId,
			post_uri: postUri,
			replies_count: counts.replies,
			destination: inAppUrl ? 'in_app_thread' : 'bsky_app',
		} );
	};

	const repliesContent = (
		<>
			<ReaderCommentIcon iconSize={ ICON_SIZE } />
			<span className="screen-reader-text">{ translate( 'Replies:' ) } </span>
			{ counts.replies }
		</>
	);

	return (
		<HStack
			alignment="center"
			spacing={ 4 }
			justify="flex-start"
			className="social-post-card-counts"
		>
			{ inAppUrl ? (
				<a
					className="social-post-card-counts__link"
					href={ inAppUrl }
					onClick={ fireRepliesClicked }
				>
					{ repliesContent }
				</a>
			) : (
				<span>{ repliesContent }</span>
			) }
			<span>
				<ReaderRepostIcon iconSize={ ICON_SIZE } />
				<span className="screen-reader-text">{ translate( 'Reposts:' ) } </span>
				{ counts.reposts }
			</span>
			<span>
				<ReaderLikeIcon iconSize={ ICON_SIZE } liked={ false } />
				<span className="screen-reader-text">{ translate( 'Likes:' ) } </span>
				{ counts.likes }
			</span>
			<span>
				<Icon icon={ quote } size={ ICON_SIZE } />
				<span className="screen-reader-text">{ translate( 'Quotes:' ) } </span>
				{ counts.quotes }
			</span>
		</HStack>
	);
}
