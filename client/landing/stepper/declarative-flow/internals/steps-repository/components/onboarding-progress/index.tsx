import { Stepper as UIStepper } from '@automattic/ui';
import { useI18n } from '@wordpress/react-i18n';
import styles from './style.module.scss';

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
			className={ styles.root }
		>
			<UIStepper.List>
				<UIStepper.Step value="domains" status={ domainsStepStatus } className={ styles.step }>
					<UIStepper.Trigger className={ styles.trigger }>
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Select a domain' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step value="plans" status={ plansStepStatus } className={ styles.step }>
					<UIStepper.Trigger className={ styles.trigger }>
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Select a plan' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
				<UIStepper.Step value="checkout" className={ styles.step }>
					<UIStepper.Trigger className={ styles.trigger }>
						<UIStepper.Indicator />
						<UIStepper.Title>{ __( 'Complete payment' ) }</UIStepper.Title>
					</UIStepper.Trigger>
				</UIStepper.Step>
			</UIStepper.List>
		</UIStepper.Root>
	);
}
