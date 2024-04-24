import React from 'react';

import './style.scss';

interface StepSectionProps {
	heading: string;
	stepCount: number;
	children: React.ReactNode;
}

export default function StepSection( { stepCount, heading, children }: StepSectionProps ) {
	return (
		<div className="step-section">
			<div className="step-section__header">
				<div className="step-section__step-count">{ stepCount }</div>
				<div className="step-section__step-heading">{ heading }</div>
			</div>
			<div className="step-section__content">{ children }</div>
		</div>
	);
}
