/**
 * External Dependencies
 */
import { useEffect } from '@wordpress/element';
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
	stepsViewed,
	setStepsViewed,
} ) => {
	const classNames = classnames(
		'tour-kit-step',
		`is-step-${ currentStepIndex }`,
		config.options?.className ? `${ config.options?.className }__step` : '',
		config.steps[ currentStepIndex ].options?.className
	);

	useEffect( () => {
		if ( typeof config.options?.callbacks?.onStepViewOnce !== 'function' ) {
			return;
		}

		if ( stepsViewed.includes( currentStepIndex ) ) {
			return;
		}

		config.options?.callbacks?.onStepViewOnce( currentStepIndex );
		setStepsViewed( ( prev ) => [ ...prev, currentStepIndex ] );
	}, [ config.options?.callbacks, currentStepIndex, setStepsViewed, stepsViewed ] );

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
