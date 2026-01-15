import type { CSSProperties, ReactNode } from 'react';

export function PlanFeaturesItem( props: { children?: ReactNode; style?: CSSProperties } ) {
	return (
		<div
			className="plan-features-2023-grid__item plan-features-2023-grid__item-available"
			style={ props.style }
		>
			<div className="plan-features-2023-grid__item-info-container">{ props.children }</div>
		</div>
	);
}
