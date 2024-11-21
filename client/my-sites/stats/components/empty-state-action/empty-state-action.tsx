import { Card, CardBody, Icon } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import { trackStatsAnalyticsEvent } from 'calypso/my-sites/stats/utils';

import './styles.scss';

interface EmptyStateActionProps {
	text: string;
	icon: JSX.Element;
	analyticsDetails?: {
		feature: string;
		from: string;
	};
	onClick: () => void;
}

const EmptyStateAction: React.FC< EmptyStateActionProps > = ( {
	text,
	icon,
	analyticsDetails,
	onClick,
} ) => {
	const handleClick = () => {
		trackStatsAnalyticsEvent( 'empty_state_interaction', analyticsDetails );

		onClick();
	};

	const handleKeyPress = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' || event.key === ' ' ) {
			handleClick();
		}
	};

	return (
		<Card
			className="stats-empty-action__cta stats-empty-action__cta-parent"
			size="small"
			onClick={ handleClick }
			onKeyDown={ handleKeyPress }
			tabIndex={ 0 }
		>
			<CardBody className="stats-empty-action__card-body">
				<Icon className="stats-empty-action__cta-link-icon" icon={ icon } size={ 20 } />
				<span className="stats-empty-action__cta-link-text">{ text }</span>
				<Icon className="stats-empty-action__cta-link-icon" icon={ chevronRight } size={ 20 } />
			</CardBody>
		</Card>
	);
};

export default EmptyStateAction;
