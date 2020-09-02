/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	steps: string[];
	currentStep: number;
}

const StepProgress: FunctionComponent< Props > = ( { steps, currentStep } ) => {
	const getElementNumberClass = ( stepNumber: number ) => {
		if ( currentStep === stepNumber ) {
			return 'step-progress__element-number-current';
		}
		return stepNumber < currentStep
			? 'step-progress__element-number-complete'
			: 'step-progress__element-number';
	};

	const getStepNameClass = ( stepNumber: number ) => {
		if ( currentStep === stepNumber ) {
			return 'step-progress__element-step-name-current';
		}
		return stepNumber < currentStep
			? 'step-progress__element-step-name-complete'
			: 'step-progress__element-step-name';
	};

	return (
		<div className="step-progress">
			{ steps.map( ( stepName, index ) => (
				<div className="step-progress__element" key={ `step-${ index }` }>
					<div className="step-progress__element-visual">
						<div className={ getElementNumberClass( index ) }>{ index + 1 }</div>
					</div>
					<div className={ getStepNameClass( index ) }>{ stepName }</div>
				</div>
			) ) }
		</div>
	);
};

export default StepProgress;
