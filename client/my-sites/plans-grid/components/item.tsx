import type { ReactNode } from 'react';

export function PlanFeaturesItem( props: { children?: ReactNode } ) {
	return (
		<div className="plan-features-2023-grid__item plan-features-2023-grid__item-available">
			<div className="plan-features-2023-grid__item-info-container">{ props.children }</div>
		</div>
	);
}
