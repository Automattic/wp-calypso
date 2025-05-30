import { Card, Spinner } from '@automattic/components';
import { formatNumberCompact } from '@automattic/number-formatters';
import { ReactNode } from 'react';
import InfoPopover from 'calypso/components/info-popover';
import 'calypso/my-sites/stats/components/highlight-cards/style.scss';
import './style.scss';

type SubscriberStatsCardProps = {
	heading: string;
	icon: ReactNode;
	value?: number | string;
	isLoading: boolean;
	helpText?: string;
};

const SubscriberStatsCardValue = ( {
	value,
	isLoading,
}: Pick< SubscriberStatsCardProps, 'value' | 'isLoading' > ) => {
	const isNumber = Number.isFinite( value );

	if ( isLoading ) {
		return <Spinner />;
	}
	if ( value === null ) {
		return <span className="highlight-card-count-value subscriber-stats-card__value">-</span>;
	}

	if ( ! isNumber ) {
		return (
			<span
				className="highlight-card-count-value subscriber-stats-card__value"
				title={ String( value ) }
			>
				{ value }
			</span>
		);
	}

	return (
		<span
			className="highlight-card-count-value subscriber-stats-card__value"
			title={ String( value ) }
		>
			{ typeof value === 'number' ? formatNumberCompact( value ) : '-' }
		</span>
	);
};

const SubscriberStatsCard = ( {
	heading,
	icon,
	value,
	isLoading,
	helpText,
}: SubscriberStatsCardProps ) => {
	return (
		<Card className="highlight-card subscriber-stats-card">
			<div className="highlight-card-icon subscriber-stats-card__icon">{ icon }</div>
			<div className="highlight-card-heading subscriber-stats-card__heading">
				{ heading }
				{ helpText ? <InfoPopover position="bottom left">{ helpText }</InfoPopover> : null }
			</div>
			<div className="highlight-card-count subscriber-stats-card__count">
				<SubscriberStatsCardValue value={ value } isLoading={ isLoading } />
			</div>
		</Card>
	);
};

export default SubscriberStatsCard;
