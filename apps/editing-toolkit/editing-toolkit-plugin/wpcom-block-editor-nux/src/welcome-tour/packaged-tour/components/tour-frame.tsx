/**
 * External Dependencies
 */
import { useEffect, useRef, useState } from '@wordpress/element';
import classnames from 'classnames';
import { usePopper } from 'react-popper';
/**
 * Internal Dependencies
 */
import KeyboardNavigation from './keyboard-navigation';
import Overlay from './overlay';
import Spotlight from './spotlight';
import type { Config, Callback } from '../types';

interface Props {
	config: Config;
}

const TourFrame: React.FunctionComponent< Props > = ( { config } ) => {
	const tourContainerRef = useRef( null );
	const popperElementRef = useRef( null );
	const [ initialFocusedElement, setInitialFocusedElement ] = useState< HTMLElement | null >(
		null
	);
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentStepIndex, setCurrentStepIndex ] = useState( 0 );
	const lastStepIndex = config.steps.length - 1;
	const referenceElementSelector = config.steps[ currentStepIndex ].referenceElements?.desktop;
	const referenceElement = document.querySelector( referenceElementSelector );

	const showArrowIndicator = () => {
		if ( config.options?.effects?.arrowIndicator === false ) {
			return false;
		}

		return !! ( referenceElement && ! isMinimized );
	};

	const { styles: popperStyles, attributes: popperAttributes } = usePopper(
		referenceElement,
		popperElementRef?.current,
		{
			strategy: 'fixed',
			modifiers: [
				{
					name: 'preventOverflow',
					options: {
						rootBoundary: 'document',
						padding: 16, // same as the left/margin of the tour frame
					},
				},
				{
					name: 'arrow',
					options: {
						padding: 12,
					},
				},
				{
					name: 'offset',
					options: {
						offset: [ 0, showArrowIndicator() ? 12 : 10 ],
					},
				},
				...( config.options?.popperModifiers || [] ),
			],
		}
	);

	const stepRepositionProps =
		! isMinimized && referenceElement
			? {
					style: popperStyles?.popper,
					...popperAttributes?.popper,
			  }
			: null;

	const arrowPositionProps = {
		style: popperStyles?.arrow,
		...popperAttributes?.arrow,
	};

	const showSpotlight = () => {
		if ( ! config.options?.effects?.__experimental__spotlight ) {
			return false;
		}

		return referenceElement && ! isMinimized;
	};

	const showOverlay = () => {
		if ( showSpotlight() ) {
			return false;
		}

		// rendered for the spotlight, but hidden
		if ( config.options?.effects?.__experimental__spotlight ) {
			return ! referenceElement && ! isMinimized;
		}

		return !! ( config.options?.effects?.overlay && ! isMinimized );
	};

	const handleCallback = ( callback?: Callback ) => {
		typeof callback === 'function' && callback( currentStepIndex );
	};

	const handleDismiss = ( source: string ) => {
		return () => {
			config.closeHandler( config.steps, currentStepIndex, source );
		};
	};

	const handleNextStepProgression = () => {
		if ( lastStepIndex > currentStepIndex ) {
			setCurrentStepIndex( currentStepIndex + 1 );
		}
		handleCallback( config.options?.callbacks?.onNextStep );
	};

	const handlePreviousStepProgression = () => {
		currentStepIndex && setCurrentStepIndex( currentStepIndex - 1 );
		handleCallback( config.options?.callbacks?.onPreviousStep );
	};

	const handleGoToStep = ( stepIndex: number ) => {
		setCurrentStepIndex( stepIndex );
		handleCallback( config.options?.callbacks?.onGoToStep );
	};

	const handleMinimize = () => {
		setIsMinimized( true );
		handleCallback( config.options?.callbacks?.onMinimize );
	};

	const handleMaximize = () => {
		setIsMinimized( false );
		handleCallback( config.options?.callbacks?.onMaximize );
	};

	useEffect( () => {
		// focus the Next/Begin button as the first interactive element when tour loads
		setTimeout( () => initialFocusedElement?.focus() );
	}, [ initialFocusedElement ] );

	const classNames = classnames( 'packaged-tour', config.options?.className );

	return (
		<>
			<KeyboardNavigation
				onMinimize={ handleMinimize }
				onDismiss={ handleDismiss }
				onNextStepProgression={ handleNextStepProgression }
				onPreviousStepProgression={ handlePreviousStepProgression }
				tourContainerRef={ tourContainerRef } // @todo clk rename: tourFrameRef
				isMinimized={ isMinimized }
			/>
			<div className={ classNames } ref={ tourContainerRef }>
				<Overlay visible={ showOverlay() } />
				<Spotlight
					referenceElementSelector={ referenceElementSelector }
					visible={ showSpotlight() }
				/>
				<div className="packaged-tour__frame" ref={ popperElementRef } { ...stepRepositionProps }>
					{ showArrowIndicator() && (
						<div className="packaged-tour__arrow" data-popper-arrow { ...arrowPositionProps } />
					) }
					{ ! isMinimized ? (
						<>
							{ config.renderers.tourStep( {
								steps: config.steps,
								currentStepIndex,
								onDismiss: handleDismiss,
								onNext: handleNextStepProgression,
								onPrevious: handlePreviousStepProgression,
								onMinimize: handleMinimize,
								setInitialFocusedElement,
								onGoToStep: handleGoToStep,
							} ) }
						</>
					) : (
						<>
							{ config.renderers.tourMinimized( {
								steps: config.steps,
								currentStepIndex,
								onMaximize: handleMaximize,
								onDismiss: handleDismiss,
							} ) }
						</>
					) }
				</div>
			</div>
		</>
	);
};

export default TourFrame;
