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
	isLoading = false,
}: {
	title: string | null;
	date: string | null;
	poster?: string | null;
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
			{ posterUrl && (
				<img
					className="stats-video-details-card__thumbnail"
					src={ posterUrl }
					alt={ translate( 'Thumbnail for a video titled "%(title)s"', {
						args: { title: title ?? '' },
						comment: 'Alt-text for a video thumbnail.',
						textOnly: true,
					} ) }
					onError={ () => setFailedPoster( posterUrl ) }
				/>
			) }
		</Card>
	);
}
