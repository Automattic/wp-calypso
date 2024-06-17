import { Card, CardBody, Icon } from '@wordpress/components';
import { chevronRight } from '@wordpress/icons';
import { trackStatsAnalyticsEvent } from '../../utils';

import './styles.scss';

interface EmptyStateActionProps {
	text: string;
	icon: JSX.Element;
	onClick: () => void;
}

const EmptyStateAction: React.FC< EmptyStateActionProps > = ( { text, icon, onClick } ) => {
	const handleClick = () => {
		trackStatsAnalyticsEvent( 'utm_builder_opened' );
		trackStatsAnalyticsEvent( 'advanced_feature_interaction', { feature: 'utm_builder' } );

		onClick();
	};

	return (
		<Card className="stats-empty-action__cta" size="small" onClick={ handleClick }>
			<CardBody className="stats-empty-action__card-body">
				<Icon className="stats-empty-action__cta-link-icon" icon={ icon } size={ 20 } />
				<span className="stats-empty-action__cta-link-text">{ text }</span>
				<Icon className="stats-empty-action__cta-link-icon" icon={ chevronRight } size={ 20 } />
			</CardBody>
		</Card>
	);
};

export default EmptyStateAction;
