import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

export default function StatsEmptyState( { infoText = null } ) {
	const translate = useTranslate();
	const defaultInfoText = translate(
		'There was no data recorded during the selected time period. Try selecting a different time range.'
	);

	return (
		<div className="stats__empty-state">
			<Card className="empty-state-card">
				<div className="empty-state-card-heading">{ translate( 'No data in this period' ) }</div>
				<p className="empty-state-card-info">{ infoText ?? defaultInfoText }</p>
			</Card>
		</div>
	);
}
