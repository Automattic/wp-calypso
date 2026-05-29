import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';

import './style.scss';

type StepIndicatorProps = {
	totalSteps: number;
	currentStep: number;
};

export const StepIndicator = ( { totalSteps, currentStep }: StepIndicatorProps ) => {
	return (
		<div
			className="reader-onboarding-step-indicator"
			aria-label={ sprintf(
				/* translators: %1$d is the current onboarding step and %2$d is the total number of steps. */
				__( 'Step %1$d of %2$d' ),
				currentStep,
				totalSteps
			) }
		>
			{ Array.from( { length: totalSteps } ).map( ( _, index ) => {
				const stepNumber = index + 1;

				return (
					<span
						key={ stepNumber }
						className={ clsx( 'reader-onboarding-step-indicator__dot', {
							'is-active': stepNumber === currentStep,
						} ) }
						aria-hidden
					/>
				);
			} ) }
		</div>
	);
};
