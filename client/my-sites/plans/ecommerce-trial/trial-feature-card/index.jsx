import { Card } from '@automattic/components';

import './style.scss';

export default function TrialFeatureCard( props ) {
	const { illustration, title, subtitle, items } = props;

	return (
		<Card className="trial-feature-card__card">
			<img className="trial-feature-card__illustration" alt={ title } src={ illustration } />
			<div className="trial-feature-card__text">
				<div className="trial-feature-card__title">{ title }</div>
				<div className="trial-feature-card__subtitle">{ subtitle }</div>
				<div className="trial-feature-card__items-wrapper">
					{ items.map( ( item ) => (
						<div key={ item.title } className="trial-feature-card__item">
							<div className="trial-feature-card__item-icon">X</div>
							<div className="trial-feature-card__item-icontent">
								<div className="trial-feature-card__item-icontent-title">{ item.title }</div>
								<div className="trial-feature-card__item-icontent-subtitle">{ item.subtitle }</div>
							</div>
						</div>
					) ) }
				</div>
			</div>
			<div className="trial-feature-card__accordion-toggle">V</div>
		</Card>
	);
}
