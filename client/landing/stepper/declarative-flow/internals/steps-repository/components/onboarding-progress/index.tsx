import { Stepper as UIStepper } from '@automattic/ui';
import { useI18n } from '@wordpress/react-i18n';
import { VisuallyHidden } from '@wordpress/ui';

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
	shouldHidePlansStep?: boolean;
};

/**
 * The onboarding purchase progress rail, as a text rail in the top bar.
 *
 * Sits in the top bar's right slot, in the position the "1 of 3" counter takes
 * at narrower widths, so the indicator stays put across the breakpoint. It
 * costs no vertical space in the content column at all. There are no
 * indicators drawn: the steps are one word each, separated by a middot, and
 * status is carried by colour.
 *
 * `Stepper.Indicator` is still rendered even though no dot is drawn. It is
 * what supplies the "Step 2 of 3, completed" text for screen readers, so it is
 * wrapped in `VisuallyHidden` rather than dropped from the tree.
 */
export function OnboardingProgress( {
	currentStep,
	onStepSelect,
	isStepSelectDisabled,
	shouldHidePlansStep,
}: Props ) {
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
						<VisuallyHidden render={ <UIStepper.Indicator /> } />
						<UIStepper.Title className="onboarding-progress-title">
							{ _x( 'Domain', 'onboarding purchase step' ) }
						</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				{ ! shouldHidePlansStep && (
					<UIStepper.Step
						value="plans"
						status={ plansStepStatus }
						disabled={ isStepSelectDisabled }
						className="onboarding-progress-step"
					>
						<UIStepper.Trigger className="onboarding-progress-trigger">
							<VisuallyHidden render={ <UIStepper.Indicator /> } />
							<UIStepper.Title className="onboarding-progress-title">
								{ _x( 'Plan', 'onboarding purchase step' ) }
							</UIStepper.Title>
						</UIStepper.Trigger>
					</UIStepper.Step>
				) }
				<UIStepper.Step value="checkout" className="onboarding-progress-step">
					<UIStepper.Trigger className="onboarding-progress-trigger">
						<VisuallyHidden render={ <UIStepper.Indicator /> } />
						<UIStepper.Title className="onboarding-progress-title">
							{ _x( 'Payment', 'onboarding purchase step' ) }
						</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
			</UIStepper.List>
		</UIStepper.Root>
	);
}
