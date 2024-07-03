import { __ } from '@wordpress/i18n';
import { preparePreviewText } from '../helpers';
import { FEED_TEXT_MAX_LENGTH, FEED_TEXT_MAX_LINES } from './constants';
import { Bookmark as BookmarkIcon } from './icons/bookmark';
import { Comment as CommentIcon } from './icons/comment';
import { DefaultAvatar } from './icons/default-avatar';
import { Heart as HeartIcon } from './icons/heart';
import { Menu as MenuIcon } from './icons/menu';
import { Share as ShareIcon } from './icons/share';
import { InstagramPreviewProps } from './types';

import './style.scss';

export function InstagramPostPreview( {
	image,
	media,
	name,
	profileImage,
	caption,
}: InstagramPreviewProps ) {
	const username = name || 'username';

	const mediaItem = media?.[ 0 ];

	return (
		<div className="instagram-preview__wrapper">
			<section className="instagram-preview__container">
				<div className="instagram-preview__header">
					<div className="instagram-preview__header--avatar">
						{ profileImage ? <img src={ profileImage } alt="" /> : <DefaultAvatar /> }
					</div>
					<div className="instagram-preview__header--profile">
						<div className="instagram-preview__header--profile-name">{ username }</div>
						<div className="instagram-preview__header--profile-menu">
							<MenuIcon />
						</div>
					</div>
				</div>
				<div className="instagram-preview__media">
					{ mediaItem ? (
						<div className="instagram-preview__media-item">
							{ mediaItem.type.startsWith( 'video/' ) ? (
								// eslint-disable-next-line jsx-a11y/media-has-caption
								<video controls={ false } className="instagram-preview__media--video">
									<source src={ mediaItem.url } type={ mediaItem.type } />
								</video>
							) : (
								<img className="instagram-preview__media--image" src={ mediaItem.url } alt="" />
							) }
						</div>
					) : (
						<img className="instagram-preview__media--image" src={ image } alt="" />
					) }
				</div>
				<div className="instagram-preview__content">
					<section className="instagram-preview__content--actions">
						<div className="instagram-preview__content--actions-primary">
							<HeartIcon />
							<CommentIcon />
							<ShareIcon />
						</div>
						<div className="instagram-preview__content--actions-secondary">
							<BookmarkIcon />
						</div>
					</section>
					<div className="instagram-preview__content--body">
						<div className="instagram-preview__content--name">{ username }</div>
						&nbsp;
						{ caption ? (
							<div className="instagram-preview__content--text">
								{ preparePreviewText( caption, {
									platform: 'instagram',
									maxChars: FEED_TEXT_MAX_LENGTH,
									maxLines: FEED_TEXT_MAX_LINES,
								} ) }
							</div>
						) : null }
					</div>
					<div className="instagram-preview__content--footer">
						<span>{ __( 'View one comment', 'social-previews' ) }</span>
					</div>
				</div>
			</section>
		</div>
	);
}
