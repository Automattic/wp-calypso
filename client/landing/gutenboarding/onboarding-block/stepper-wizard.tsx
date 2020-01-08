/**
 * External dependencies
 */
import React, { FunctionComponent, useState, ComponentType } from 'react';
import { useSpring, animated } from 'react-spring';
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

	const visibleStepCount = stepComponents.filter( step => !! step ).length;
	const translatePercent =
		( 100 / visibleStepCount ) * Math.min( activeStep, visibleStepCount - 1 ); // sometimes activeStep is invisible because of current Next handling
	const springProps = useSpring( {
		transform: `translate(0, -${ translatePercent }%)`,
	} );

	return (
		<animated.div style={ springProps }>
			{ stepComponents.map(
				( Komponent, index ) =>
					Komponent && (
						<Komponent
							inputClass="onboarding-block__question-input"
							isActive={ index === activeStep }
							key={ index }
							onExpand={ () => setActiveStep( index ) }
							onSelect={ handleNext }
						/>
					)
			) }
		</animated.div>
	);
};

export default StepperWizard;
