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
	currentStep: number;
	onStepClick?: ( newStep: number ) => void;
	steps: ( string | TranslateResult )[];
}

const StepProgress: FunctionComponent< Props > = ( { currentStep, onStepClick, steps } ) => {
	const getElementClass = ( stepNumber: number ) => {
		if ( currentStep === stepNumber ) {
			return 'step-progress__element-current';
		}
		return stepNumber < currentStep
			? 'step-progress__element-complete'
			: 'step-progress__element-future';
	};

	return (
		<div className="step-progress">
			{ steps.map( ( stepName, index ) => (
				<div className={ getElementClass( index ) } key={ `step-${ index }` }>
					<button
						className="step-progress__element-button"
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
					<span className="step-progress__element-step-name">{ stepName }</span>
				</div>
			) ) }
		</div>
	);
};

export default StepProgress;
