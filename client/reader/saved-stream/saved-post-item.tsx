import { Button } from '@wordpress/components';
import { closeSmall } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import resizeImageUrl from 'calypso/lib/resize-image-url';
import { getPostUrl } from 'calypso/reader/route';
import { useDispatch, useSelector } from 'calypso/state';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import { markSavedPostRead, unsavePost } from 'calypso/state/reader/saved/actions';
import type { SavedPostItem as SavedPostItemType } from 'calypso/state/reader/saved/types';

interface Props {
	item: SavedPostItemType;
}

export function SavedPostItem( { item }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const moment = useLocalizedMoment();
	const post = useSelector( ( state ) => getPostByKey( state, item.postKey ) );

	const title = post?.title || translate( 'Untitled' );
	const siteName = post?.site_name || post?.site_URL || '';
	const minutesToRead = post?.minutes_to_read;
	const date = post?.date_liked || post?.date || item.savedAt;
	const rawThumbnail = post?.canonical_image?.uri || post?.featured_image;
	const thumbnail = rawThumbnail ? resizeImageUrl( rawThumbnail, { fit: '56,56' } ) : null;
	const postUrl = post ? getPostUrl( post ) : null;

	function handleClick() {
		dispatch( markSavedPostRead( item.postKey ) );
	}

	function handleRemove() {
		dispatch( unsavePost( item.postKey ) );
	}

	const metaParts = [
		siteName,
		minutesToRead ? translate( '%d min read', { args: [ minutesToRead ] } ) : null,
		date ? moment( date ).format( 'MMM D' ) : null,
	].filter( Boolean );

	return (
		<div className={ clsx( 'saved-post-item', { 'is-read': item.isRead } ) }>
			{ thumbnail && (
				<div className="saved-post-item__thumbnail">
					<img src={ thumbnail } alt="" loading="lazy" />
				</div>
			) }

			<div className="saved-post-item__content">
				{ postUrl ? (
					<a href={ postUrl } className="saved-post-item__title" onClick={ handleClick }>
						{ title }
					</a>
				) : (
					<span className="saved-post-item__title">{ title }</span>
				) }
				{ metaParts.length > 0 && (
					<span className="saved-post-item__meta">{ metaParts.join( '  \u00b7  ' ) }</span>
				) }
			</div>

			<Button
				className="saved-post-item__remove"
				onClick={ handleRemove }
				icon={ closeSmall }
				label={ translate( 'Remove' ) }
				size="small"
			/>
		</div>
	);
}
