import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import ReaderSaveButton from 'calypso/blocks/reader-save-button';
import { SiteIcon } from 'calypso/blocks/site-icon';
import AutoDirection from 'calypso/components/auto-direction';
import getEmbedMetadata from 'calypso/lib/get-video-id';
import { safeLink } from 'calypso/lib/post-normalizer/utils';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import type { Post } from 'calypso/reader/data/post';
import type { MouseEvent, Ref } from 'react';

import './snapshot-card.scss';

interface SavedSnapshotCardProps {
	post: Post;
	isSelected?: boolean;
	itemRef?: Ref< HTMLElement >;
	handleClick?: () => void;
}

const IMAGE_WIDTH = 160;

const YOUTUBE_VIDEO_ID = /^[\w-]{11}$/;

/**
 * The ID of the YouTube video at `url`, or `null` if it isn't one.
 */
function getYouTubeVideoId( url: string | undefined ) {
	const { service, id } = ( url && getEmbedMetadata( url ) ) || {};
	return service === 'youtube' && typeof id === 'string' && YOUTUBE_VIDEO_ID.test( id ) ? id : null;
}

/**
 * A saved YouTube video's player, which plays it in the card.
 */
function SavedYouTubeVideo( { videoId, title }: { videoId: string; title: string } ) {
	return (
		<div className="saved-snapshot-card__video">
			<iframe
				src={ `https://www.youtube-nocookie.com/embed/${ videoId }` }
				title={ title }
				allow="encrypted-media; picture-in-picture; web-share"
				allowFullScreen
				loading="lazy"
				// YouTube refuses to play an embed it gets no referrer for.
				referrerPolicy="strict-origin-when-cross-origin"
			/>
		</div>
	);
}

function useSavedDate( dateSaved: unknown ) {
	const translate = useTranslate();
	if ( typeof dateSaved !== 'string' || ! dateSaved ) {
		return null;
	}

	const date = new Date( dateSaved );
	if ( Number.isNaN( date.getTime() ) ) {
		return null;
	}

	return translate( 'Saved %(date)s', {
		args: {
			date: new Intl.DateTimeFormat( translate.localeSlug, { dateStyle: 'medium' } ).format( date ),
		},
		comment: 'When the user saved the page. %(date)s is a date, for example: Oct 31, 2026',
	} );
}

/**
 * A card for a saved snapshot: a page saved by URL, or a feed item that's since
 * been deleted. There's no Reader post or site behind it, so it only shows the
 * snapshot and opens the page in a new tab.
 */
export function SavedSnapshotCard( {
	post,
	isSelected,
	itemRef,
	handleClick,
}: SavedSnapshotCardProps ) {
	const savedDate = useSavedDate( post.date_saved );
	const url = post.URL ? safeLink( post.URL ) : undefined;
	const siteUrl = typeof post.site_URL === 'string' ? safeLink( post.site_URL ) : undefined;
	const youTubeVideoId = getYouTubeVideoId( url );
	const featuredImage =
		! youTubeVideoId && typeof post.featured_image === 'string' && post.featured_image
			? resizeImageUrl( post.featured_image, { w: IMAGE_WIDTH }, null )
			: null;
	const authorName = post.author?.name;
	const bylineItems = [ authorName, savedDate ].filter( Boolean );

	const openPage = ( event: MouseEvent< HTMLElement > ) => {
		const target = event.target as HTMLElement;
		if ( target.closest( 'a, button' ) || window.getSelection?.()?.toString() ) {
			return;
		}
		handleClick?.();
	};

	return (
		// The title link is the keyboard and screen reader target; clicking the rest
		// of the card is a shortcut to it, like other Reader cards.
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
		<article
			ref={ itemRef }
			className={ clsx( 'card reader-post-card saved-snapshot-card', {
				'is-selected': isSelected,
			} ) }
			onClick={ openPage }
		>
			<div className="reader-post-card__byline">
				<SiteIcon size={ 40 } />
				<div className="reader-post-card__byline-details">
					{ post.site_name && (
						<div className="reader-post-card__byline-site">
							{ siteUrl ? (
								<a
									className="reader-post-card__site reader-post-card__link"
									href={ siteUrl }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ post.site_name }
								</a>
							) : (
								<span className="reader-post-card__site reader-post-card__link">
									{ post.site_name }
								</span>
							) }
						</div>
					) }
					{ bylineItems.length > 0 && (
						<div className="reader-post-card__author-and-timestamp">
							<span className="reader-post-card__byline-secondary">
								{ bylineItems.map( ( item, index ) => (
									<Fragment key={ index }>
										{ index > 0 && (
											<span className="reader-post-card__byline-secondary-bullet-wrapper">
												<span className="reader-post-card__byline-secondary-bullet">·</span>
											</span>
										) }
										<span className="reader-post-card__byline-secondary-item">{ item }</span>
									</Fragment>
								) ) }
							</span>
						</div>
					) }
				</div>
			</div>
			<div className="reader-post-card__post">
				<div className="reader-post-card__post-details">
					<AutoDirection>
						<h2 className="reader-post-card__title">
							{ url ? (
								<a
									className="reader-post-card__title-link"
									href={ url }
									target="_blank"
									rel="noopener noreferrer"
								>
									{ post.title || url }
								</a>
							) : (
								post.title
							) }
						</h2>
					</AutoDirection>
					{ post.excerpt && (
						<AutoDirection>
							<p className="reader-excerpt">{ post.excerpt }</p>
						</AutoDirection>
					) }
					{ youTubeVideoId && (
						<SavedYouTubeVideo videoId={ youTubeVideoId } title={ post.title || url || '' } />
					) }
					<ul className="reader-post-actions ignore-click">
						<li className="reader-post-actions__item">
							<ReaderSaveButton post={ post } iconSize={ 20 } />
						</li>
					</ul>
				</div>
				{ featuredImage && (
					<img className="saved-snapshot-card__image" src={ featuredImage } alt="" />
				) }
			</div>
		</article>
	);
}
