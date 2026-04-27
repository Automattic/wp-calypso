import { __experimentalHStack as HStack } from '@wordpress/components';
import { Icon, quote } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import ReaderCommentIcon from 'calypso/reader/components/icons/comment-icon';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import ReaderRepostIcon from 'calypso/reader/components/icons/repost';
import type { AtmosphereCounts } from '@automattic/api-core';

const ICON_SIZE = 16;

interface PostCardCountsProps {
	counts: AtmosphereCounts;
}

export function PostCardCounts( { counts }: PostCardCountsProps ) {
	const translate = useTranslate();
	return (
		<HStack
			alignment="center"
			spacing={ 4 }
			justify="flex-start"
			className="social-post-card-counts"
		>
			<span aria-label={ translate( 'Replies' ) }>
				<ReaderCommentIcon iconSize={ ICON_SIZE } />
				{ counts.replies }
			</span>
			<span aria-label={ translate( 'Reposts' ) }>
				<ReaderRepostIcon iconSize={ ICON_SIZE } />
				{ counts.reposts }
			</span>
			<span aria-label={ translate( 'Likes' ) }>
				<ReaderLikeIcon iconSize={ ICON_SIZE } liked={ false } />
				{ counts.likes }
			</span>
			<span aria-label={ translate( 'Quotes' ) }>
				<Icon icon={ quote } size={ ICON_SIZE } />
				{ counts.quotes }
			</span>
		</HStack>
	);
}
