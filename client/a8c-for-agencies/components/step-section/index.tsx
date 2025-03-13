import clsx from 'clsx';
import React from 'react';

import './style.scss';

interface StepSectionProps {
	heading: string;
	stepCount?: number;
	children: React.ReactNode;
	className?: string;
	applyCoreStyles?: boolean;
}

export default function StepSection( {
	stepCount,
	heading,
	children,
	className,
	applyCoreStyles = false,
}: StepSectionProps ) {
	return (
		<div className={ clsx( 'step-section', className, { 'is-core-styles': applyCoreStyles } ) }>
			<div className="step-section__header">
				{ !! stepCount && <div className="step-section__step-count">{ stepCount }</div> }
				<div className="step-section__step-heading">{ heading }</div>
			</div>
			<div className="step-section__content">{ children }</div>
		</div>
	);
}
