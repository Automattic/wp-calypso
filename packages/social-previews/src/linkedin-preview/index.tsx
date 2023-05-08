import { __ } from '@wordpress/i18n';
import { baseDomain, preparePreviewText } from '../helpers';
import './style.scss';
import { SocialPreviewBaseProps } from '../types';

export const FEED_TEXT_MAX_LENGTH = 212;
export const FEED_TEXT_MAX_LINES = 3;

export type LinkedInPreviewProps = SocialPreviewBaseProps & {
	jobTitle?: string;
	name: string;
	profileImage: string;
};

export function LinkedInPreview( {
	image,
	jobTitle,
	name,
	profileImage,
	description,
	title,
	url,
}: LinkedInPreviewProps ) {
	return (
		<section className="linkedin-preview">
			<div className="linkedin-preview__header">
				<div className="linkedin-preview__header--avatar">
					<img src={ profileImage } alt="" />
				</div>
				<div className="linkedin-preview__header--profile">
					<div className="linkedin-preview__header--profile-info">
						<div className="linkedin-preview__header--profile-name">{ name }</div>
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
					<div
						className="linkedin-preview__caption"
						// TODO: Replace `dangerouslySetInnerHTML` with `createInterpolateElement` inside `preparePreviewText`
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={ {
							__html: preparePreviewText( description, {
								platform: 'linkedin',
								maxChars: FEED_TEXT_MAX_LENGTH,
								maxLines: FEED_TEXT_MAX_LINES,
							} ),
						} }
					/>
				) : null }
				<article>
					{ image ? <img className="linkedin-preview__image" src={ image } alt="" /> : null }
					{ url ? (
						<div className="linkedin-preview__description">
							<h2 className="linkedin-preview__description--title">{ title }</h2>
							<div className="linkedin-preview__description--meta">
								<span className="linkedin-preview__description--url">{ baseDomain( url ) }</span>
								<span>•</span>
								<span>
									{
										// translators: x is the number of minutes it takes to read the article
										__( 'x min read', 'social-previews' )
									}
								</span>
							</div>
						</div>
					) : null }
				</article>
			</div>
		</section>
	);
}
