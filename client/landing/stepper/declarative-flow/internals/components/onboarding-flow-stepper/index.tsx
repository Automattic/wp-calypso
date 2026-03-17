import { Icon } from '@wordpress/components';
import { check } from '@wordpress/icons';
import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { Fragment } from 'react';

import './style.scss';

export type OnboardingFlowStep = 'select-domain' | 'select-plan' | 'payment';

interface OnboardingFlowStepperProps {
	currentStep: OnboardingFlowStep;
	/**
	 * URLs for completed steps that should be navigable.
	 * Only completed steps with a URL will be rendered as clickable buttons.
	 */
	stepUrls?: Partial< Record< OnboardingFlowStep, string > >;
}

const STEPS: OnboardingFlowStep[] = [ 'select-domain', 'select-plan', 'payment' ];

export const OnboardingFlowStepper = ( { currentStep, stepUrls }: OnboardingFlowStepperProps ) => {
	const { __ } = useI18n();
	const currentIndex = STEPS.indexOf( currentStep );

	const getStepLabel = ( id: OnboardingFlowStep ) => {
		switch ( id ) {
			case 'select-domain':
				return __( 'Select a domain' );
			case 'select-plan':
				return __( 'Select a plan' );
			case 'payment':
				return __( 'Complete payment' );
		}
	};

	return (
		<nav className="onboarding-flow-stepper" aria-label={ __( 'Onboarding steps' ) }>
			{ STEPS.map( ( id, index ) => {
				const isCompleted = index < currentIndex;
				const isActive = index === currentIndex;
				const url = isCompleted ? stepUrls?.[ id ] : undefined;
				const isClickable = Boolean( url );
				const label = getStepLabel( id );

				const stepContent = (
					<>
						<div className="onboarding-flow-stepper__circle">
							<span className="onboarding-flow-stepper__number">{ index + 1 }</span>
							{ isCompleted && (
								<Icon className="onboarding-flow-stepper__check" icon={ check } size={ 10 } />
							) }
						</div>
						<span className="onboarding-flow-stepper__label">{ label }</span>
					</>
				);

				return (
					<Fragment key={ id }>
						{ index > 0 && (
							<div className="onboarding-flow-stepper__connector" aria-hidden="true" />
						) }
						{ isClickable ? (
							<button
								type="button"
								className={ clsx(
									'onboarding-flow-stepper__step',
									'is-completed',
									'is-clickable'
								) }
								onClick={ () => window.location.assign( url! ) }
								aria-label={ label }
							>
								{ stepContent }
							</button>
						) : (
							<div
								className={ clsx( 'onboarding-flow-stepper__step', {
									'is-active': isActive,
									'is-completed': isCompleted,
								} ) }
								aria-current={ isActive ? 'step' : undefined }
							>
								{ stepContent }
							</div>
						) }
					</Fragment>
				);
			} ) }
		</nav>
	);
};
