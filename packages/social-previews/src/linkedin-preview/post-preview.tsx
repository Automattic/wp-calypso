import { __, sprintf } from '@wordpress/i18n';
import { baseDomain, getTitleFromDescription, preparePreviewText } from '../helpers';
import { FEED_TEXT_MAX_LENGTH, FEED_TEXT_MAX_LINES } from './constants';
import { DefaultAvatar } from './icons/default-avatar';
import { LinkedInPreviewProps } from './types';

import './style.scss';

export function LinkedInPostPreview( {
	articleReadTime = 5,
	image,
	jobTitle,
	name,
	profileImage,
	description,
	media,
	title,
	url,
}: LinkedInPreviewProps ) {
	const hasMedia = !! media?.length;

	return (
		<div className="linkedin-preview__wrapper">
			<section className={ `linkedin-preview__container ${ hasMedia ? 'has-media' : '' }` }>
				<div className="linkedin-preview__header">
					<div className="linkedin-preview__header--avatar">
						{ profileImage ? <img src={ profileImage } alt="" /> : <DefaultAvatar /> }
					</div>
					<div className="linkedin-preview__header--profile">
						<div className="linkedin-preview__header--profile-info">
							<div className="linkedin-preview__header--profile-name">
								{ name || __( 'Account Name', 'social-previews' ) }
							</div>
							<span>•</span>
							<div className="linkedin-preview__header--profile-actor">
								{
									// translators: refers to the actor level of the post being shared, e.g. "1st", "2nd", "3rd", etc.
									__( '1st', 'social-previews' )
								}
							</div>
						</div>
						{ jobTitle ? (
							<div className="linkedin-preview__header--profile-title">{ jobTitle }</div>
						) : null }
						<div className="linkedin-preview__header--profile-meta">
							<span>
								{
									// translators: refers to the time since the post was published, e.g. "1h"
									__( '1h', 'social-previews' )
								}
							</span>
							<span>•</span>
							{ /* This is the Globe SVG that represents visibility to be "public" */ }
							<svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" focusable="false">
								<path d="M8 1a7 7 0 107 7 7 7 0 00-7-7zM3 8a5 5 0 011-3l.55.55A1.5 1.5 0 015 6.62v1.07a.75.75 0 00.22.53l.56.56a.75.75 0 00.53.22H7v.69a.75.75 0 00.22.53l.56.56a.75.75 0 01.22.53V13a5 5 0 01-5-5zm6.24 4.83l2-2.46a.75.75 0 00.09-.8l-.58-1.16A.76.76 0 0010 8H7v-.19a.51.51 0 01.28-.45l.38-.19a.74.74 0 01.68 0L9 7.5l.38-.7a1 1 0 00.12-.48v-.85a.78.78 0 01.21-.53l1.07-1.09a5 5 0 01-1.54 9z" />
							</svg>
						</div>
					</div>
				</div>
				<div className="linkedin-preview__content">
					{ description ? (
						<div className="linkedin-preview__caption">
							{ preparePreviewText( description, {
								platform: 'linkedin',
								maxChars: FEED_TEXT_MAX_LENGTH,
								maxLines: FEED_TEXT_MAX_LINES,
							} ) }
						</div>
					) : null }
					{ hasMedia ? (
						<div className="linkedin-preview__media">
							{ media.map( ( mediaItem, index ) => (
								<div
									key={ `linkedin-preview__media-item-${ index }` }
									className="linkedin-preview__media-item"
								>
									{ mediaItem.type.startsWith( 'video/' ) ? (
										// eslint-disable-next-line jsx-a11y/media-has-caption
										<video controls>
											<source src={ mediaItem.url } type={ mediaItem.type } />
										</video>
									) : (
										<img alt={ mediaItem.alt || '' } src={ mediaItem.url } />
									) }
								</div>
							) ) }
						</div>
					) : (
						<article>
							{ image ? <img className="linkedin-preview__image" src={ image } alt="" /> : null }
							{ url ? (
								<div className="linkedin-preview__description">
									<h2 className="linkedin-preview__description--title">
										{ title || getTitleFromDescription( description ) }
									</h2>
									<div className="linkedin-preview__description--meta">
										<span className="linkedin-preview__description--url">
											{ baseDomain( url ) }
										</span>
										<span>•</span>
										<span>
											{ sprintf(
												// translators: %d is the number of minutes it takes to read the article
												__( '%d min read', 'social-previews' ),
												articleReadTime
											) }
										</span>
									</div>
								</div>
							) : null }
						</article>
					) }
				</div>
			</section>
		</div>
	);
}
