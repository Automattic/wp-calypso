/**
 * External dependencies
 */
import React, { FunctionComponent, useState } from 'react';

export interface InjectedStepProps {
	isActive: boolean;
	onExpand: () => void;
	onSelect: () => void;
	inputClass: string;
}

const StepperWizard: FunctionComponent = ( { children } ) => {
	const [ activeStep, setActiveStep ] = useState( 0 );

	const handleNext = () => setActiveStep( activeStep + 1 );

	return (
		<>
			{ React.Children.map(
				children,
				( child, index ) =>
					React.isValidElement( child ) &&
					React.cloneElement< InjectedStepProps >( child, {
						isActive: index === activeStep,
						onExpand: () => setActiveStep( index ),
						onSelect: handleNext,
						inputClass: 'onboarding-block__question-input',
					} )
			) }
		</>
	);
};
export default StepperWizard;
