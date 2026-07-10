import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

import './style.scss';

export default function VideoDetailsCard( {
	title,
	date,
}: {
	title: string | null;
	date: string | null;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if ( ! title ) {
		return null;
	}

	return (
		<Card className="stats-video-details-card">
			<h4 className="stats-video-details-card__heading">{ translate( 'Video details' ) }</h4>
			<div className="stats-video-details-card__info">
				<div className="stats-video-details-card__title">{ title }</div>
				{ date && (
					<div className="stats-video-details-card__date">
						{ translate( 'Published %(date)s', {
							args: { date: moment( date ).format( 'll' ) },
							comment: 'Date when the video was uploaded.',
						} ) }
					</div>
				) }
			</div>
		</Card>
	);
}
