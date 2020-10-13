/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { TranslateResult } from 'i18n-calypso';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	steps: ( string | TranslateResult )[];
	currentStep: number;
	onStepClick?: ( newStep: number ) => void;
}

const StepProgress: FunctionComponent< Props > = ( { steps, currentStep, onStepClick } ) => {
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
						<button
							className={ getElementNumberClass( index ) }
							onClick={
								onStepClick
									? () => {
											onStepClick( index );
									  }
									: undefined
							}
						>
							<span>{ index + 1 }</span>
						</button>
					</div>
					<div className={ getStepNameClass( index ) }>{ stepName }</div>
				</div>
			) ) }
		</div>
	);
};

export default StepProgress;
