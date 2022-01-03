/**
 * External Dependencies
 */
import classnames from 'classnames';
/**
 * Internal Dependencies
 */
import type { Config } from '../types';

interface Props {
	config: Config;
	currentStepIndex: number;
	onMinimize: () => void;
	onDismiss: ( target: string ) => () => void;
	onNextStepProgression: () => void;
	onPreviousStepProgression: () => void;
	onGoToStep: ( stepIndex: number ) => void;
	setInitialFocusedElement: React.Dispatch< React.SetStateAction< HTMLElement | null > >;
}

const TourKitStep: React.FunctionComponent< Props > = ( {
	config,
	currentStepIndex,
	onMinimize,
	onDismiss,
	onNextStepProgression,
	onPreviousStepProgression,
	setInitialFocusedElement,
	onGoToStep,
} ) => {
	const classNames = classnames(
		'tour-kit-step',
		`is-step-${ currentStepIndex }`,
		config.options?.className ? `${ config.options?.className }__step` : '',
		config.steps[ currentStepIndex ].className
	);

	return (
		<div className={ classNames }>
			{ config.renderers.tourStep( {
				steps: config.steps,
				currentStepIndex,
				onDismiss,
				onNext: onNextStepProgression,
				onPrevious: onPreviousStepProgression,
				onMinimize,
				setInitialFocusedElement,
				onGoToStep,
			} ) }
		</div>
	);
};

export default TourKitStep;
