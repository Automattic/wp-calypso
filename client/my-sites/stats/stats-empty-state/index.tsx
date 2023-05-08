import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { ReactChild } from 'react';

import './style.scss';

export default function StatsEmptyState( {
	headingText = null,
	infoText = null,
}: {
	headingText?: null | ReactChild;
	infoText?: null | ReactChild;
} ) {
	const translate = useTranslate();
	const defaultHeadingText = translate( 'No data in this period' );
	const defaultInfoText = translate(
		'There was no data recorded during the selected time period. Try selecting a different time range.'
	);

	return (
		<div className="stats__empty-state">
			<Card className="empty-state-card">
				<div className="empty-state-card-heading">{ headingText ?? defaultHeadingText }</div>
				<p className="empty-state-card-info">{ infoText ?? defaultInfoText }</p>
			</Card>
		</div>
	);
}
