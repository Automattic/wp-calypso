import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import ReaderSaveButton from 'calypso/blocks/reader-save-button';
import AutoDirection from 'calypso/components/auto-direction';
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
	const featuredImage =
		typeof post.featured_image === 'string' && post.featured_image
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
								<span className="reader-post-card__site">{ post.site_name }</span>
							) }
						</div>
					) }
					{ bylineItems.length > 0 && (
						<div className="reader-post-card__author-and-timestamp">
							<span className="reader-post-card__byline-secondary">
								{ bylineItems.join( ' · ' ) }
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
				</div>
				{ featuredImage && (
					<img className="saved-snapshot-card__image" src={ featuredImage } alt="" />
				) }
			</div>
			<ul className="reader-post-actions ignore-click">
				<li className="reader-post-actions__item">
					<ReaderSaveButton post={ post } iconSize={ 20 } />
				</li>
			</ul>
		</article>
	);
}
