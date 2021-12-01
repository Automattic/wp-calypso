/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useEffect, useState, useCallback, useRef } from '@wordpress/element';
import classnames from 'classnames';
/**
 * Internal Dependencies
 */
import usePopperHandler from '../hooks/use-popper-handler';
import KeyboardNavigation from './keyboard-navigation';
import Overlay from './overlay';
import Spotlight from './spotlight';
import type { Config, Callback } from '../types';

interface Props {
	config: Config;
}

const handleCallback = ( currentStepIndex: number, callback?: Callback ) => {
	typeof callback === 'function' && callback( currentStepIndex );
};

const TourKitFrame: React.FunctionComponent< Props > = ( { config } ) => {
	const tourContainerRef = useRef( null );
	const popperElementRef = useRef( null );
	const [ initialFocusedElement, setInitialFocusedElement ] = useState< HTMLElement | null >(
		null
	);
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentStepIndex, setCurrentStepIndex ] = useState( 0 );
	const lastStepIndex = config.steps.length - 1;
	const isMobile = useMobileBreakpoint();
	const referenceElementSelector =
		config.steps[ currentStepIndex ].referenceElements?.[ isMobile ? 'mobile' : 'desktop' ] || null;
	const referenceElement = referenceElementSelector
		? document.querySelector< HTMLElement >( referenceElementSelector )
		: null;

	const showArrowIndicator = () => {
		if ( config.options?.effects?.arrowIndicator === false ) {
			return false;
		}

		return !! ( referenceElement && ! isMinimized );
	};

	const { styles: popperStyles, attributes: popperAttributes } = usePopperHandler(
		referenceElement,
		popperElementRef.current,
		[
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
		]
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

	const showSpotlight = useCallback( () => {
		if ( ! config.options?.effects?.__experimental__spotlight ) {
			return false;
		}

		return ! isMinimized;
	}, [ config.options?.effects?.__experimental__spotlight, isMinimized ] );

	const showOverlay = useCallback( () => {
		if ( showSpotlight() || ! config.options?.effects?.overlay ) {
			return false;
		}

		return ! isMinimized;
	}, [ config.options?.effects?.overlay, isMinimized, showSpotlight ] );

	const handleDismiss = useCallback(
		( source: string ) => {
			return () => {
				config.closeHandler( config.steps, currentStepIndex, source );
			};
		},
		[ config, currentStepIndex ]
	);

	const handleNextStepProgression = useCallback( () => {
		if ( lastStepIndex > currentStepIndex ) {
			setCurrentStepIndex( currentStepIndex + 1 );
		}
		handleCallback( currentStepIndex, config.options?.callbacks?.onNextStep );
	}, [ config.options?.callbacks?.onNextStep, currentStepIndex, lastStepIndex ] );

	const handlePreviousStepProgression = useCallback( () => {
		currentStepIndex && setCurrentStepIndex( currentStepIndex - 1 );
		handleCallback( currentStepIndex, config.options?.callbacks?.onPreviousStep );
	}, [ config.options?.callbacks?.onPreviousStep, currentStepIndex ] );

	const handleGoToStep = useCallback(
		( stepIndex: number ) => {
			setCurrentStepIndex( stepIndex );
			handleCallback( currentStepIndex, config.options?.callbacks?.onGoToStep );
		},
		[ config.options?.callbacks?.onGoToStep, currentStepIndex ]
	);

	const handleMinimize = useCallback( () => {
		setIsMinimized( true );
		handleCallback( currentStepIndex, config.options?.callbacks?.onMinimize );
	}, [ config.options?.callbacks?.onMinimize, currentStepIndex ] );

	const handleMaximize = useCallback( () => {
		setIsMinimized( false );
		handleCallback( currentStepIndex, config.options?.callbacks?.onMaximize );
	}, [ config.options?.callbacks?.onMaximize, currentStepIndex ] );

	useEffect( () => {
		// first interactive element when step renders
		setTimeout( () => initialFocusedElement?.focus() );
	}, [ initialFocusedElement ] );

	const classNames = classnames( 'tour-kit-frame', config.options?.className );

	return (
		<>
			<KeyboardNavigation
				onMinimize={ handleMinimize }
				onDismiss={ handleDismiss }
				onNextStepProgression={ handleNextStepProgression }
				onPreviousStepProgression={ handlePreviousStepProgression }
				tourContainerRef={ tourContainerRef }
				isMinimized={ isMinimized }
			/>
			<div className={ classNames } ref={ tourContainerRef }>
				{ showOverlay() && <Overlay visible={ true } /> }
				{ showSpotlight() && <Spotlight referenceElement={ referenceElement } /> }
				<div
					className="tour-kit-frame__container"
					ref={ popperElementRef }
					{ ...stepRepositionProps }
				>
					{ showArrowIndicator() && (
						<div className="tour-kit-frame__arrow" data-popper-arrow { ...arrowPositionProps } />
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

export default TourKitFrame;
