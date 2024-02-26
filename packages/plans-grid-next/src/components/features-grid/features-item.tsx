import classNames from 'classnames';
import type { ReactNode } from 'react';
import './features-item.scss';

interface Props {
	children?: ReactNode;
	isAnnualPlanFeature?: boolean;
	isAvailable?: boolean;
}

export function FeaturesItem( {
	children,
	isAnnualPlanFeature = false,
	isAvailable = false,
}: Props ) {
	const containerClasses = classNames( 'features-grid__features-item-info', {
		'is-annual-plan-feature': isAnnualPlanFeature,
		'is-available': isAvailable,
	} );

	return (
		<span className={ containerClasses }>
			<div className="features-grid__features-item features-grid__features-item-available">
				<div className="features-grid__features-item-info-container">{ children }</div>
			</div>
		</span>
	);
}
