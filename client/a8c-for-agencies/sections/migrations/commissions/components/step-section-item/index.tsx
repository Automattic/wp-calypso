import clsx from 'clsx';
import React from 'react';

import './style.scss';

interface StepSectionItemProps {
	heading: string;
	description: React.ReactNode;
	className?: string;
	children?: React.ReactNode;
}

export default function StepSectionItem( {
	heading,
	description,
	className,
	children,
}: StepSectionItemProps ) {
	return (
		<div className={ clsx( 'commissions-step-section-item', className ) }>
			<div className="commissions-step-section-item-content">
				<div className="commissions-step-section-item-heading">{ heading }</div>
				<div className="commissions-step-section-item-description">{ description }</div>
			</div>
			{ children }
		</div>
	);
}
