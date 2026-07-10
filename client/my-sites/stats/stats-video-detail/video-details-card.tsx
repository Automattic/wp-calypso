import { Card } from '@automattic/components';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';

import './style.scss';

export default function VideoDetailsCard( {
	title,
	date,
	isLoading = false,
}: {
	title: string | null;
	date: string | null;
	isLoading?: boolean;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	if ( ! title && ! isLoading ) {
		return null;
	}

	return (
		<Card className={ clsx( 'stats-video-details-card', { 'is-loading': isLoading } ) }>
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
		</Card>
	);
}
