import { Card } from '@automattic/components';
import { manualBook } from '@automattic/components/src/icons';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import './style.scss';

interface EmptyStateProps {
	headingText?: string | React.ReactNode | null;
	infoText?: string | React.ReactNode | null;
}

export default function StatsEmptyState( {
	headingText = null,
	infoText = null,
}: EmptyStateProps ) {
	const translate = useTranslate();
	const defaultHeadingText = translate( 'No data in this period' );
	const defaultInfoText = translate(
		'There was no data recorded during the selected time period. Try selecting a different time range.'
	);

	return (
		<div className="stats__empty-state">
			<Card className="empty-state-card">
				<Icon className="empty-state-card__icon" icon={ manualBook } size={ 20 } />
				<div className="empty-state-card__content">
					<div className="empty-state-card-heading">{ headingText ?? defaultHeadingText }</div>
					<div className="empty-state-card-info">{ infoText ?? defaultInfoText }</div>
				</div>
			</Card>
		</div>
	);
}
