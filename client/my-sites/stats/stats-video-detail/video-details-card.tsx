import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

import './style.scss';

export default function VideoDetailsCard( {
	title,
	date,
	poster,
	mediaLibraryUrl,
	isLoading = false,
}: {
	title: string | null;
	date: string | null;
	poster?: string | null;
	mediaLibraryUrl?: string | null;
	isLoading?: boolean;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	// Posters of private videos come back as tokenless CDN URLs that the CDN
	// rejects (STATS-374), so hide the image instead of showing a broken one.
	const [ failedPoster, setFailedPoster ] = useState< string | null >( null );

	if ( ! title && ! isLoading ) {
		return null;
	}

	const posterUrl = poster && poster !== failedPoster ? poster : null;

	// The card already shows the video's title next to the image, so the
	// thumbnail adds no information for screen readers — treat it as
	// decorative.
	const renderThumbnail = ( url: string ) => (
		<img
			className="stats-video-details-card__thumbnail"
			src={ url }
			alt=""
			onError={ () => setFailedPoster( url ) }
		/>
	);

	return (
		<Card
			className={ clsx( 'stats-video-details-card', {
				'is-loading': isLoading,
				'has-thumbnail': !! posterUrl,
			} ) }
		>
			<h4 className="stats-video-details-card__heading">{ translate( 'Video details' ) }</h4>
			<div className="stats-video-details-card__info">
				<div className="stats-video-details-card__title">{ title }</div>
				{ ( isLoading || date ) && (
					<div className="stats-video-details-card__date">
						{ date &&
							translate( 'Published %(date)s', {
								args: { date: moment( date ).format( 'll' ) },
								comment: 'Date when the video was uploaded.',
							} ) }
					</div>
				) }
			</div>
			{ posterUrl &&
				( mediaLibraryUrl ? (
					// The link, not the decorative image, carries the accessible name.
					<a
						className="stats-video-details-card__thumbnail-link"
						href={ mediaLibraryUrl }
						aria-label={ translate( 'View the video in the media library', { textOnly: true } ) }
					>
						{ renderThumbnail( posterUrl ) }
					</a>
				) : (
					renderThumbnail( posterUrl )
				) ) }
		</Card>
	);
}
