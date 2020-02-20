/**
 * External dependencies
 */
import React, { FunctionComponent, useState, ComponentType } from 'react';
import { Falsy } from 'utility-types';

export interface StepProps {
	isActive: boolean;
	onExpand: () => void;
	onSelect: () => void;
	inputClass: string;
}

interface Props {
	stepComponents: Array< ComponentType< StepProps > | Falsy >;
	children?: never;
}

const StepperWizard: FunctionComponent< Props > = ( { stepComponents } ) => {
	const [ activeStep, setActiveStep ] = useState( 0 );

	const handleNext = () => setActiveStep( activeStep + 1 );

	return (
		<>
			{ stepComponents.map( ( Komponent, index ) => {
				return Komponent ? (
					<Komponent
						inputClass="onboarding-block__question-input"
						isActive={ index === activeStep }
						key={ index }
						onExpand={ () => setActiveStep( index ) }
						onSelect={ handleNext }
					/>
				) : null;
			} ) }
		</>
	);
};

export default StepperWizard;
