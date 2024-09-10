import { __ } from '@wordpress/i18n';
import { tumblrTitle, tumblrDescription } from './helpers';
import TumblrPostActions from './post/actions';
import TumblrPostHeader from './post/header';
import type { TumblrPreviewProps } from './types';

import './styles.scss';

export const TumblrPostPreview: React.FC< TumblrPreviewProps > = ( {
	title,
	description,
	image,
	user,
	url,
	customText,
	media,
} ) => {
	const avatarUrl = user?.avatarUrl;

	const mediaItem = media?.[ 0 ];

	return (
		<div className="tumblr-preview__post">
			{ avatarUrl && <img className="tumblr-preview__avatar" src={ avatarUrl } alt="" /> }
			<div className="tumblr-preview__card">
				<TumblrPostHeader user={ user } />
				<div className="tumblr-preview__body">
					<div className="tumblr-preview__title">{ tumblrTitle( title ) }</div>
					{ customText && <div className="tumblr-preview__custom-text">{ customText }</div> }
					{ description && (
						<div className="tumblr-preview__description">{ tumblrDescription( description ) }</div>
					) }
					{ mediaItem ? (
						<div className="tumblr-preview__media-item">
							{ mediaItem.type.startsWith( 'video/' ) ? (
								// eslint-disable-next-line jsx-a11y/media-has-caption
								<video controls className="tumblr-preview__media--video">
									<source src={ mediaItem.url } type={ mediaItem.type } />
								</video>
							) : (
								<img className="tumblr-preview__image" src={ mediaItem.url } alt="" />
							) }
						</div>
					) : (
						image && (
							<img
								className="tumblr-preview__image"
								src={ image }
								alt={ __( 'Tumblr preview thumbnail', 'social-previews' ) }
							/>
						)
					) }
					<a className="tumblr-preview__url" href={ url } target="_blank" rel="noreferrer">
						{ __( 'View On WordPress', 'social-previews' ) }
					</a>
				</div>
				<TumblrPostActions />
			</div>
		</div>
	);
};
