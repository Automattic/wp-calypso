import { Stepper as UIStepper } from '@automattic/ui';
import { useI18n } from '@wordpress/react-i18n';

import './style.scss';

type Props = {
	currentStep: 'domains' | 'plans' | 'checkout';
	onStepSelect?: ( step: 'domains' | 'plans' ) => void;
};

export function OnboardingProgress( { currentStep, onStepSelect }: Props ) {
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
					className="onboarding-progress-step"
				>
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Select a domain' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step
					value="plans"
					status={ plansStepStatus }
					className="onboarding-progress-step"
				>
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Select a plan' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
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
