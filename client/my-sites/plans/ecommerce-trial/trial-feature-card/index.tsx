import { Card, Gridicon } from '@automattic/components';
import { useState } from 'react';

import './style.scss';

interface Props {
	illustration: string;
	title: string;
	subtitle: string;
	items: {
		title: string;
		subtitle: string;
	}[];
	expanded?: boolean;
}

export default function TrialFeatureCard( props: Props ) {
	const { illustration, title, subtitle, items } = props;

	const [ expanded, setExpanded ] = useState( !! props.expanded );

	const toggle = () => {
		setExpanded( ! expanded );
	};

	return (
		<Card className="trial-feature-card__card">
			<img className="trial-feature-card__illustration" alt={ title } src={ illustration } />
			<div className="trial-feature-card__text">
				<div className="trial-feature-card__title">{ title }</div>
				<div className="trial-feature-card__subtitle">{ subtitle }</div>
				{ expanded && (
					<div className="trial-feature-card__items-wrapper">
						{ items.map( ( item ) => (
							<div key={ item.title } className="trial-feature-card__item">
								<div className="trial-feature-card__item-icon">
									<Gridicon icon="checkmark" size={ 18 } />
								</div>
								<div className="trial-feature-card__item-content">
									<div className="trial-feature-card__item-content-title">{ item.title }</div>
									<div className="trial-feature-card__item-content-subtitle">{ item.subtitle }</div>
								</div>
							</div>
						) ) }
					</div>
				) }
			</div>
			<div className="trial-feature-card__accordion-toggle">
				{ expanded ? (
					<Gridicon icon="chevron-down" size={ 16 } onClick={ toggle } />
				) : (
					<Gridicon icon="chevron-up" size={ 16 } onClick={ toggle } />
				) }
			</div>
		</Card>
	);
}
