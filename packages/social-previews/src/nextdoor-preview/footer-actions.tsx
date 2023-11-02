import { __ } from '@wordpress/i18n';
import { CommentIcon } from './icons/comment-icon';
import { LikeIcon } from './icons/like-icon';
import { ShareIcon } from './icons/share-icon';

export function FooterActions() {
	return (
		<div className="nextdoor-preview__footer--actions">
			<div className="nextdoor-preview__footer--actions-item">
				<LikeIcon />
				<span>{ __( 'Like', 'social-previews' ) }</span>
			</div>
			<div className="nextdoor-preview__footer--actions-item">
				<CommentIcon />
				<span>{ __( 'Comment', 'social-previews' ) }</span>
			</div>
			<div className="nextdoor-preview__footer--actions-item">
				<ShareIcon />
				<span>{ __( 'Share', 'social-previews' ) }</span>
			</div>
		</div>
	);
}
