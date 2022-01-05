/**
 * External Dependencies
 */
import classnames from 'classnames';
/**
 * Internal Dependencies
 */
import type { Config, TourStepRendererProps } from '../types';

interface Props extends TourStepRendererProps {
	config: Config;
}

const TourKitStep: React.FunctionComponent< Props > = ( {
	config,
	steps,
	currentStepIndex,
	onMinimize,
	onDismiss,
	onNext,
	onPrevious,
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
				steps,
				currentStepIndex,
				onDismiss,
				onNext,
				onPrevious,
				onMinimize,
				setInitialFocusedElement,
				onGoToStep,
			} ) }
		</div>
	);
};

export default TourKitStep;
