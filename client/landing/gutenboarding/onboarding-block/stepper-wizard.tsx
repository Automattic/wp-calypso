/**
 * External dependencies
 */
import React, { useState } from 'react';

export interface StepInputProps {
	isActive: boolean;
	onExpand: () => void;
	onSelect: () => void;
	inputClass: string;
}

interface Props {
	children: React.ReactChildren;
}

export default function StepperWizard( props: Props ) {
	const [ activeStep, setActiveStep ] = useState( 0 );

	const handleNext = () => setActiveStep( activeStep + 1 );

	return React.Children.map(
		props.children,
		( child, index ) =>
			child &&
			React.cloneElement( child, {
				isActive: index === activeStep,
				onExpand: () => setActiveStep( index ),
				onSelect: handleNext,
				inputClass: 'onboarding-block__question-input',
			} )
	);
}
