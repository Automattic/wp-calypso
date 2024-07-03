import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import {
	baseDomain,
	formatNextdoorDate,
	getTitleFromDescription,
	preparePreviewText,
} from '../helpers';
import { FEED_TEXT_MAX_LENGTH, FEED_TEXT_MAX_LINES } from './constants';
import { FooterActions } from './footer-actions';
import { ChevronIcon } from './icons/chevron-icon';
import { DefaultAvatar } from './icons/default-avatar';
import { DefaultImage } from './icons/default-image';
import { GlobeIcon } from './icons/globe-icon';
import { NextdoorPreviewProps } from './types';

import './style.scss';

export function NextdoorPostPreview( {
	image,
	name,
	profileImage,
	description,
	neighborhood,
	media,
	title,
	url,
}: NextdoorPreviewProps ) {
	const hasMedia = !! media?.length;

	return (
		<div className="nextdoor-preview__wrapper">
			<section className={ `nextdoor-preview__container ${ hasMedia ? 'has-media' : '' }` }>
				<div className="nextdoor-preview__content">
					<div className="nextdoor-preview__header">
						<div className="nextdoor-preview__header--avatar">
							{ profileImage ? <img src={ profileImage } alt="" /> : <DefaultAvatar /> }
						</div>
						<div className="nextdoor-preview__header--details">
							<div className="nextdoor-preview__header--name">
								{ name || __( 'Account Name', 'social-previews' ) }
							</div>
							<div className="nextdoor-preview__header--meta">
								<span>{ neighborhood || __( 'Neighborhood', 'social-previews' ) }</span>
								<span>•</span>
								<span>{ formatNextdoorDate( Date.now() ) }</span>
								<span>•</span>
								{ /* This is the Globe SVG that represents visibility to be "public" */ }
								<GlobeIcon />
							</div>
						</div>
					</div>
					<div className="nextdoor-preview__body">
						{ description ? (
							<div className="nextdoor-preview__caption">
								{ preparePreviewText( description, {
									platform: 'nextdoor',
									maxChars: FEED_TEXT_MAX_LENGTH,
									maxLines: FEED_TEXT_MAX_LINES,
								} ) }
							</div>
						) : null }
						{ hasMedia ? (
							<div className="nextdoor-preview__media">
								{ media.map( ( mediaItem, index ) => {
									return (
										<div
											key={ `nextdoor-preview__media-item-${ index }` }
											className="nextdoor-preview__media-item"
										>
											{ mediaItem?.type?.startsWith( 'video/' ) ? (
												// eslint-disable-next-line jsx-a11y/media-has-caption
												<video controls>
													<source src={ mediaItem.url } type={ mediaItem.type } />
												</video>
											) : (
												<img alt={ mediaItem.alt || '' } src={ mediaItem.url } />
											) }
										</div>
									);
								} ) }
							</div>
						) : null }

						<article
							className={ clsx( 'nextdoor-preview__card', {
								'small-preview': ! image || hasMedia,
							} ) }
						>
							{ image ? (
								<img className="nextdoor-preview__image" src={ image } alt="" />
							) : (
								<DefaultImage />
							) }
							{ url ? (
								<div className="nextdoor-preview__description">
									<h2 className="nextdoor-preview__description--title">
										{ title || getTitleFromDescription( description ) }
									</h2>
									<span className="nextdoor-preview__description--url">{ baseDomain( url ) }</span>
								</div>
							) : null }
							{ hasMedia ? (
								<div className="nextdoor-preview__card--chevron-wrapper">
									<ChevronIcon />
								</div>
							) : null }
						</article>
					</div>
					<div className="nextdoor-preview__footer">
						<FooterActions />
					</div>
				</div>
			</section>
		</div>
	);
}
