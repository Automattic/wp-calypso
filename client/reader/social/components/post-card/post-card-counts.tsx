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
			<span>
				<ReaderCommentIcon iconSize={ ICON_SIZE } />
				<span className="screen-reader-text">{ translate( 'Replies:' ) } </span>
				{ counts.replies }
			</span>
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
