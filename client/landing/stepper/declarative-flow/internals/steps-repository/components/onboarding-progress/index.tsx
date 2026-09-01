import { Stepper as UIStepper } from '@automattic/ui';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

type Props = {
	currentStep: 'domains' | 'plans' | 'checkout';
	onStepSelect?: ( step: 'domains' | 'plans' ) => void;
	/**
	 * Blocks navigation to the earlier steps while the current step is not yet
	 * ready to act on a selection.
	 */
	isStepSelectDisabled?: boolean;
};

/**
 * The onboarding purchase progress rail.
 *
 * Renders as "peek dots": a compact row of indicators where only the current
 * step keeps its label on screen. The other labels are still rendered, so they
 * remain part of each step's accessible name, and they reveal visually on
 * hover and keyboard focus. See style.scss for how that is done without
 * reflowing the rail.
 */
export function OnboardingProgress( { currentStep, onStepSelect, isStepSelectDisabled }: Props ) {
	const { __, _x } = useI18n();

	const domainsStepStatus = currentStep !== 'domains' ? ( 'completed' as const ) : undefined;
	const plansStepStatus = currentStep === 'checkout' ? ( 'completed' as const ) : undefined;

	return (
		<UIStepper.Root
			orientation="horizontal"
			value={ currentStep }
			onValueChange={ ( value ) => {
				if ( value === 'domains' || value === 'plans' ) {
					onStepSelect?.( value );
				}
			} }
			aria-label={ __( 'Purchase steps' ) }
			indicatorVariant="bullet"
			linear
			className="onboarding-progress"
		>
			<UIStepper.List>
				<UIStepper.Step
					value="domains"
					status={ domainsStepStatus }
					disabled={ isStepSelectDisabled }
					className="onboarding-progress-step"
				>
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator />
						<UIStepper.Title className="onboarding-progress-title">
							{ _x( 'Domain', 'onboarding purchase step' ) }
						</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step
					value="plans"
					status={ plansStepStatus }
					disabled={ isStepSelectDisabled }
					className="onboarding-progress-step"
				>
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator />
						<UIStepper.Title className="onboarding-progress-title">
							{ _x( 'Plan', 'onboarding purchase step' ) }
						</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step value="checkout" className="onboarding-progress-step">
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator />
						<UIStepper.Title className="onboarding-progress-title">
							{ _x( 'Payment', 'onboarding purchase step' ) }
						</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
			</UIStepper.List>
		</UIStepper.Root>
	);
}
