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
	isMinimized: boolean;
	onMinimize: () => void;
	onMaximize: () => void;
	onDismiss: ( target: string ) => () => void;
	onNextStepProgression: () => void;
	onPreviousStepProgression: () => void;
	setInitialFocusedElement: React.Dispatch< React.SetStateAction< HTMLElement | null > >;
	onGoToStep: ( stepIndex: number ) => void;
}

const TourKitStep: React.FunctionComponent< Props > = ( {
	config,
	currentStepIndex,
	isMinimized,
	onMinimize,
	onMaximize,
	onDismiss,
	onNextStepProgression,
	onPreviousStepProgression,
	setInitialFocusedElement,
	onGoToStep,
} ) => {
	const getStepCssClassFromId = () => {
		const sanitizedId = config.steps[ currentStepIndex ].id
			?.trim()
			.toLowerCase()
			.replace( /[^a-z0-9]/gi, '-' );

		return sanitizedId ? `tour-kit-step__${ sanitizedId }` : '';
	};

	const classNames = classnames(
		'tour-kit-step',
		`is-step-${ currentStepIndex }`,
		getStepCssClassFromId()
	);

	return (
		<div className={ classNames }>
			{ ! isMinimized ? (
				<>
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
				</>
			) : (
				<>
					{ config.renderers.tourMinimized( {
						steps: config.steps,
						currentStepIndex,
						onMaximize,
						onDismiss,
					} ) }
				</>
			) }
		</div>
	);
};

export default TourKitStep;
