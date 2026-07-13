import clsx from 'clsx';
import React from 'react';

import './style.scss';

interface StepSectionProps {
	heading: string;
	stepCount?: number;
	children: React.ReactNode;
	className?: string;
}

export default function StepSection( {
	stepCount,
	heading,
	children,
	className,
}: StepSectionProps ) {
	return (
		<div className={ clsx( 'commissions-step-section', className ) }>
			<div className="commissions-step-section-header">
				{ !! stepCount && <div className="commissions-step-section-step-count">{ stepCount }</div> }
				<div className="commissions-step-section-heading">{ heading }</div>
			</div>
			<div className="commissions-step-section-content">{ children }</div>
		</div>
	);
}
