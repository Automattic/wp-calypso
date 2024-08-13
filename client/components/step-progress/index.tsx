import { TranslateResult } from 'i18n-calypso';
import { FunctionComponent, ReactNode } from 'react';

import './style.scss';

export interface ClickHandler {
	onClick: () => void;
	message: TranslateResult;
	indicator?: ReactNode;
	show?: 'always' | 'onComplete' | 'beforeComplete';
}

interface Props {
	currentStep: number;
	steps: ( TranslateResult | ClickHandler )[];
}

const isClickHandler = ( item: TranslateResult | ClickHandler ): item is ClickHandler =>
	'object' === typeof item && item.hasOwnProperty( 'onClick' );

const StepProgress: FunctionComponent< Props > = ( { currentStep, steps } ) => {
	const getElementClass = ( stepNumber: number ) => {
		if ( currentStep === stepNumber ) {
			return 'step-progress__element-current';
		}
		return stepNumber < currentStep
			? 'step-progress__element-complete'
			: 'step-progress__element-future';
	};

	const getClickHandler = ( step: TranslateResult | ClickHandler, stepNumber: number ) => {
		if ( isClickHandler( step ) ) {
			if ( undefined === step?.show || 'always' === step.show ) {
				return step.onClick;
			}
			if ( stepNumber < currentStep && 'onComplete' === step.show ) {
				return step.onClick;
			}
			if ( stepNumber > currentStep && 'beforeComplete' === step.show ) {
				return step.onClick;
			}
		}
		return undefined;
	};

	return (
		<div className="step-progress">
			{ steps.map( ( step, index ) => {
				const clickHandler = getClickHandler( step, index );
				return (
					<div className={ getElementClass( index ) } key={ `step-${ index }` }>
						<button
							className="step-progress__element-button"
							disabled={ undefined === clickHandler }
							onClick={ clickHandler }
						>
							{ isClickHandler( step ) && !! step.indicator ? (
								step.indicator
							) : (
								<span>{ index + 1 }</span>
							) }
						</button>
						<span className="step-progress__element-step-name">
							{ isClickHandler( step ) ? step.message : step }
						</span>
					</div>
				);
			} ) }
		</div>
	);
};

export default StepProgress;
