import { formatNumber } from '@automattic/number-formatters';
import { Tooltip } from '@wordpress/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import { useLikeAction } from './like-context';
import type { SocialPost } from '../../types';

import './like-button.scss';

interface LikeButtonProps {
	post: SocialPost;
	hideCount?: boolean;
}

const ICON_SIZE = 18;

export function LikeButton( { post, hideCount }: LikeButtonProps ) {
	const translate = useTranslate();
	const action = useLikeAction( post );
	const formattedLikes = formatNumber( post.counts.likes );

	// No <LikeProvider> mounted (or the adapter declined to support the post)
	// — render a static count so the cell isn't empty. Mirrors the
	// non-interactive markup `<PostCardCounts>` used to inline before the
	// adapter pattern took over the gate.
	if ( ! action.supported ) {
		return (
			<span className="social-post-card-like-button social-post-card-like-button--static">
				<ReaderLikeIcon liked={ false } iconSize={ ICON_SIZE } />
				{ ! hideCount && (
					<>
						<span className="screen-reader-text">{ translate( 'Likes:' ) } </span>
						<span className="social-post-card-like-button__count">{ formattedLikes }</span>
					</>
				) }
			</span>
		);
	}

	const isLiked = action.isLiked;
	const isPending = action.isPending;
	const accessibleLabel = String( action.label.accessibleLabel( post.counts.likes ) );

	const onClick = ( event: React.MouseEvent< HTMLButtonElement > ) => {
		event.preventDefault();
		event.stopPropagation();

		if ( isPending ) {
			return;
		}

		if ( isLiked ) {
			action.unlike();
			return;
		}

		action.like();
	};

	return (
		<Tooltip text={ accessibleLabel }>
			<button
				type="button"
				className={ clsx( 'social-post-card-like-button', {
					'is-liked': isLiked,
					'is-pending': isPending,
				} ) }
				aria-pressed={ isLiked }
				aria-label={ accessibleLabel }
				aria-disabled={ isPending || undefined }
				onClick={ onClick }
			>
				<ReaderLikeIcon liked={ isLiked } iconSize={ ICON_SIZE } />
				{ ! hideCount && (
					<span className="social-post-card-like-button__count">{ formattedLikes }</span>
				) }
			</button>
		</Tooltip>
	);
}
