import { Card, Gridicon } from '@automattic/components';
import { useState } from 'react';

import './style.scss';

interface TrialFeatureCardProps {
	illustration: string;
	title: string;
	subtitle: string;
	items: {
		title: string;
		subtitle: string;
	}[];
	expanded?: boolean;
}

export default function TrialFeatureCard( props: TrialFeatureCardProps ) {
	const { illustration, title, subtitle, items } = props;

	const [ expanded, setExpanded ] = useState( !! props.expanded );

	const toggleExpanded = () => {
		setExpanded( ! expanded );
	};

	return (
		<Card className="trial-feature-card">
			<img className="trial-feature-card__illustration" alt={ title } src={ illustration } />
			<div className="trial-feature-card__content">
				<div className="trial-feature-card__content-title">{ title }</div>
				<div className="trial-feature-card__content-subtitle">{ subtitle }</div>
				{ expanded && (
					<div className="trial-feature-card__content-items">
						{ items.map( ( item ) => (
							<div key={ item.title } className="trial-feature-card__content-items-item">
								<div className="trial-feature-card__content-items-item-icon">
									<Gridicon icon="checkmark" size={ 18 } />
								</div>
								<div className="trial-feature-card__content-items-item-content">
									<div className="trial-feature-card__content-items-item-content-title">
										{ item.title }
									</div>
									<div className="trial-feature-card__content-items-item-content-subtitle">
										{ item.subtitle }
									</div>
								</div>
							</div>
						) ) }
					</div>
				) }
			</div>
			<div className="trial-feature-card__accordion-toggle">
				{ expanded ? (
					<Gridicon icon="chevron-down" size={ 16 } onClick={ toggleExpanded } />
				) : (
					<Gridicon icon="chevron-up" size={ 16 } onClick={ toggleExpanded } />
				) }
			</div>
		</Card>
	);
}
