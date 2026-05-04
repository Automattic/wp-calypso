import { formatNumber } from '@automattic/number-formatters';
import clsx from 'clsx';
import ReaderLikeIcon from 'calypso/reader/components/icons/like-icon';
import { useLikeAction } from './like-context';

import './like-button.scss';

interface LikeButtonProps {
	post: {
		uri: string;
		counts: { likes: number };
		viewer?: { like: string | null; repost: string | null } | undefined;
		cid?: string;
	};
}

export function LikeButton( { post }: LikeButtonProps ) {
	const action = useLikeAction( post );

	if ( ! action.supported ) {
		return null;
	}

	const isLiked = action.isLiked;
	const isPending = action.isPending;
	const formattedLikes = formatNumber( post.counts.likes );
	const accessibleLabel = action.label.accessibleLabel( post.counts.likes );

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
		<button
			type="button"
			className={ clsx( 'social-post-card-like-button', {
				'is-liked': isLiked,
				'is-pending': isPending,
			} ) }
			aria-pressed={ isLiked }
			aria-label={ String( accessibleLabel ) }
			disabled={ isPending }
			onClick={ onClick }
		>
			<ReaderLikeIcon liked={ isLiked } iconSize={ 16 } />
			<span className="social-post-card-like-button__count">{ formattedLikes }</span>
		</button>
	);
}
