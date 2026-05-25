// packages/ui/src/stepper/indicator.tsx
import { check, error as errorIcon } from '@wordpress/icons';
import clsx from 'clsx';
import { Icon } from '../icon';
import { useStepContext, useStepperContext } from './context';
import styles from './style.module.scss';

type StepperIndicatorProps = {
	children?: React.ReactNode;
	className?: string;
};

export function StepperIndicator( { children, className }: StepperIndicatorProps ) {
	const { index, totalSteps, isCurrent, status, isDisabled } = useStepContext();
	const { formatStepLabel } = useStepperContext();

	const stepNumber = index + 1;
	const accessibleLabel = formatStepLabel( stepNumber, totalSteps, status );

	const defaultContent = () => {
		if ( status === 'completed' ) {
			return <Icon icon={ check } size={ 16 } fill="currentColor" />;
		}
		if ( status === 'error' ) {
			return <Icon icon={ errorIcon } size={ 16 } fill="currentColor" />;
		}
		return <span aria-hidden="true">{ stepNumber }</span>;
	};

	return (
		<span
			className={ clsx( styles.indicator, className, {
				[ styles[ 'is-current' ] ]: isCurrent,
				[ styles[ 'is-completed' ] ]: status === 'completed',
				[ styles[ 'is-error' ] ]: status === 'error',
				[ styles[ 'is-disabled' ] ]: isDisabled,
			} ) }
		>
			{ /* Visually hidden accessible label — always present */ }
			<span className={ styles[ 'visually-hidden' ] }>{ accessibleLabel }</span>

			{ /* Visual content */ }
			{ children ? <span aria-hidden="true">{ children }</span> : defaultContent() }
		</span>
	);
}
