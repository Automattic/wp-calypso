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
 * The onboarding purchase progress rail, as a segmented bar in the top bar.
 *
 * Renders beside the WordPress logo rather than above the page content, so it
 * costs no vertical space in the content column. Nothing is drawn but three
 * pills: the steps reached so far are filled, the rest are not.
 *
 * Both the indicator and the title are still rendered even though neither is
 * drawn as such. `Stepper.Indicator` becomes the pill and carries the
 * "Step 2 of 3, completed" text; `Stepper.Title` supplies the step name. Both
 * are what give each segment an accessible name, so the title is clipped in
 * style.scss rather than dropped from the tree.
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
			<UIStepper.List className="onboarding-progress-list">
				<UIStepper.Step
					value="domains"
					status={ domainsStepStatus }
					disabled={ isStepSelectDisabled }
					className="onboarding-progress-step"
				>
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator className="onboarding-progress-indicator" />
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
						<UIStepper.Indicator className="onboarding-progress-indicator" />
						<UIStepper.Title className="onboarding-progress-title">
							{ _x( 'Plan', 'onboarding purchase step' ) }
						</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step value="checkout" className="onboarding-progress-step">
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<UIStepper.Indicator className="onboarding-progress-indicator" />
						<UIStepper.Title className="onboarding-progress-title">
							{ _x( 'Payment', 'onboarding purchase step' ) }
						</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
			</UIStepper.List>
		</UIStepper.Root>
	);
}
