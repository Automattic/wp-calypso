import { Card } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';

import './style.scss';

interface Props {
	stateType: string;
}

export default function StatsEmptyState( { stateType }: Props ) {
	const _stateType = String( stateType ).toLowerCase().trim();
	const translate = useTranslate();

	return (
		<div className="stats__empty-state">
			<Card className="empty-state-card">
				<div className="empty-state-card-heading">
					{ translate( 'No %(_stateType)s in this period', {
						args: { _stateType },
					} ) }
				</div>
				<p className="empty-state-card-info">
					{ translate(
						'There were no %(_stateType)s recorded during the selected time period. Try selecting a different time range.',
						{
							args: { _stateType },
						}
					) }
				</p>
			</Card>
		</div>
	);
}
