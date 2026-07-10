import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

import './style.scss';

export interface VideoMediaItem {
	ID: number;
	title?: string;
	date?: string;
	/** Video duration in seconds. */
	length?: number;
}

export default function VideoDetailsCard( { media }: { media: VideoMediaItem | null } ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const isLoading = ! media;
	const isOdyssey = config.isEnabled( 'is_odyssey' );

	// The Odyssey stats-app proxy has no media route yet, so the media request
	// 404s and the card would shimmer forever. Hide it until the data arrives —
	// once the proxy learns the route, the card simply starts appearing.
	if ( isOdyssey && ! media ) {
		return null;
	}

	const classes = isLoading ? 'stats-video-details-card is-loading' : 'stats-video-details-card';

	return (
		<Card className={ classes }>
			<h4 className="stats-video-details-card__heading">{ translate( 'Video details' ) }</h4>
			<div className="stats-video-details-card__info">
				<div className="stats-video-details-card__title">{ media?.title }</div>
				{ ( isLoading || media?.date ) && (
					<div className="stats-video-details-card__date">
						{ media?.date &&
							translate( 'Published %(date)s', {
								args: { date: moment( media.date ).format( 'll' ) },
								comment: 'Date when the video was uploaded.',
							} ) }
					</div>
				) }
			</div>
		</Card>
	);
}
