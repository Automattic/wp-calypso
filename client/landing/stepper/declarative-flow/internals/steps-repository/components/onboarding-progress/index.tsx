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
	/** A plan chosen before the flow started leaves the grid nothing to ask. */
	hidePlansStep?: boolean;
};

export function OnboardingProgress( {
	currentStep,
	onStepSelect,
	isStepSelectDisabled,
	hidePlansStep,
}: Props ) {
	const { __ } = useI18n();

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
			indicatorVariant="number"
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
						<UIStepper.Title>{ __( 'Select a domain' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				{ ! hidePlansStep && (
					<UIStepper.Step
						value="plans"
						status={ plansStepStatus }
						disabled={ isStepSelectDisabled }
						className="onboarding-progress-step"
					>
						<UIStepper.Trigger className="onboarding-progress-trigger">
							<UIStepper.Indicator />
							<UIStepper.Title>{ __( 'Select a plan' ) }</UIStepper.Title>
						</UIStepper.Trigger>
					</UIStepper.Step>
				) }
				<UIStepper.Step value="checkout" className="onboarding-progress-step">
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Complete payment' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
			</UIStepper.List>
		</UIStepper.Root>
	);
}
