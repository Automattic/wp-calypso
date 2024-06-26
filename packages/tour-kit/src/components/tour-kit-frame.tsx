/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useEffect, useState, useCallback, useMemo, useRef } from '@wordpress/element';
import clsx from 'clsx';
import { usePopper } from 'react-popper';
/**
 * Internal Dependencies
 */
import useStepTracking from '../hooks/use-step-tracking';
import { classParser } from '../utils';
import { liveResizeModifier } from '../utils/live-resize-modifier';
import KeyboardNavigation from './keyboard-navigation';
import TourKitMinimized from './tour-kit-minimized';
import Overlay from './tour-kit-overlay';
import Spotlight from './tour-kit-spotlight';
import TourKitStep from './tour-kit-step';
import type { Callback, Config } from '../types';

const handleCallback = ( currentStepIndex: number, callback?: Callback ) => {
	typeof callback === 'function' && callback( currentStepIndex );
};

interface Props {
	config: Config;
}

const TourKitFrame: React.FunctionComponent< Props > = ( { config } ) => {
	const [ currentStepIndex, setCurrentStepIndex ] = useState( 0 );
	const [ initialFocusedElement, setInitialFocusedElement ] = useState< HTMLElement | null >(
		null
	);
	const [ isMinimized, setIsMinimized ] = useState( config.isMinimized ?? false );

	const [ popperElement, setPopperElement ] = useState< HTMLElement | null >( null );
	const [ tourReady, setTourReady ] = useState( false );
	const tourContainerRef = useRef( null );
	const isMobile = useMobileBreakpoint();
	const lastStepIndex = config.steps.length - 1;
	const referenceElements = config.steps[ currentStepIndex ].referenceElements;
	const referenceElementSelector =
		referenceElements?.[ isMobile ? 'mobile' : 'desktop' ] || referenceElements?.desktop;
	const referenceElement = referenceElementSelector
		? document.querySelector< HTMLElement >( referenceElementSelector )
		: null;

	useEffect( () => {
		if ( config.isMinimized ) {
			setIsMinimized( true );
		}
	}, [ config.isMinimized ] );

	const showArrowIndicator = useCallback( () => {
		if ( config.options?.effects?.arrowIndicator === false ) {
			return false;
		}

		return !! ( referenceElement && ! isMinimized && tourReady );
	}, [ config.options?.effects?.arrowIndicator, isMinimized, referenceElement, tourReady ] );

	const showSpotlight = useCallback( () => {
		if ( ! config.options?.effects?.spotlight ) {
			return false;
		}

		return ! isMinimized;
	}, [ config.options?.effects?.spotlight, isMinimized ] );

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
		let newStepIndex = currentStepIndex;
		if ( lastStepIndex > currentStepIndex ) {
			newStepIndex = currentStepIndex + 1;
			setCurrentStepIndex( newStepIndex );
		}
		handleCallback( newStepIndex, config.options?.callbacks?.onNextStep );
	}, [ config.options?.callbacks?.onNextStep, currentStepIndex, lastStepIndex ] );

	const handlePreviousStepProgression = useCallback( () => {
		let newStepIndex = currentStepIndex;
		if ( currentStepIndex > 0 ) {
			newStepIndex = currentStepIndex - 1;
			setCurrentStepIndex( newStepIndex );
		}
		handleCallback( newStepIndex, config.options?.callbacks?.onPreviousStep );
	}, [ config.options?.callbacks?.onPreviousStep, currentStepIndex ] );

	const handleGoToStep = useCallback(
		( stepIndex: number ) => {
			setCurrentStepIndex( stepIndex );
			handleCallback( stepIndex, config.options?.callbacks?.onGoToStep );
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

	const {
		styles: popperStyles,
		attributes: popperAttributes,
		update: popperUpdate,
	} = usePopper( referenceElement, popperElement, {
		strategy: 'fixed',
		placement: config?.placement ?? 'bottom',
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
			{
				name: 'flip',
				options: {
					fallbackPlacements: [ 'top', 'left', 'right' ],
				},
			},
			useMemo(
				() => liveResizeModifier( config.options?.effects?.liveResize ),
				[ config.options?.effects?.liveResize ]
			),
			...( config.options?.popperModifiers || [] ),
		],
	} );

	const stepRepositionProps =
		! isMinimized && referenceElement && tourReady
			? {
					style: popperStyles?.popper,
					...popperAttributes?.popper,
			  }
			: null;

	const arrowPositionProps =
		! isMinimized && referenceElement && tourReady
			? {
					style: popperStyles?.arrow,
					...popperAttributes?.arrow,
			  }
			: null;

	/*
	 * Focus first interactive element when step renders.
	 */
	useEffect( () => {
		setTimeout( () => initialFocusedElement?.focus() );
	}, [ initialFocusedElement ] );

	/*
	 * Fixes issue with Popper misplacing the instance on mount
	 * See: https://stackoverflow.com/questions/65585859/react-popper-incorrect-position-on-mount
	 */
	useEffect( () => {
		// If no reference element to position step near
		if ( ! referenceElement ) {
			setTourReady( true );
			return;
		}

		setTourReady( false );

		if ( popperUpdate ) {
			popperUpdate()
				.then( () => setTourReady( true ) )
				.catch( () => setTourReady( true ) );
		}
	}, [ popperUpdate, referenceElement ] );

	useEffect( () => {
		if ( referenceElement && config.options?.effects?.autoScroll ) {
			referenceElement.scrollIntoView( config.options.effects.autoScroll );
		}
	}, [ config.options?.effects?.autoScroll, referenceElement ] );

	const classes = clsx(
		'tour-kit-frame',
		isMobile ? 'is-mobile' : 'is-desktop',
		{ 'is-visible': tourReady },
		classParser( config.options?.classNames )
	);

	useStepTracking( currentStepIndex, config.options?.callbacks?.onStepViewOnce );

	useEffect( () => {
		if ( config.options?.callbacks?.onStepView ) {
			handleCallback( currentStepIndex, config.options?.callbacks?.onStepView );
		}
	}, [ config.options?.callbacks?.onStepView, currentStepIndex ] );

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
			<div className={ classes } ref={ tourContainerRef }>
				{ showOverlay() && <Overlay visible /> }
				{ showSpotlight() && (
					<Spotlight
						referenceElement={ referenceElement }
						liveResize={ config.options?.effects?.liveResize || {} }
						{ ...( config.options?.effects?.spotlight || {} ) }
					/>
				) }
				<div
					className="tour-kit-frame__container"
					ref={ setPopperElement }
					{ ...( stepRepositionProps as React.HTMLAttributes< HTMLDivElement > ) }
				>
					{ showArrowIndicator() && (
						<div
							className="tour-kit-frame__arrow"
							data-popper-arrow
							{ ...( arrowPositionProps as React.HTMLAttributes< HTMLDivElement > ) }
						/>
					) }
					{ ! isMinimized ? (
						<TourKitStep
							config={ config }
							steps={ config.steps }
							currentStepIndex={ currentStepIndex }
							onMinimize={ handleMinimize }
							onDismiss={ handleDismiss }
							onNextStep={ handleNextStepProgression }
							onPreviousStep={ handlePreviousStepProgression }
							onGoToStep={ handleGoToStep }
							setInitialFocusedElement={ setInitialFocusedElement }
						/>
					) : (
						<TourKitMinimized
							config={ config }
							steps={ config.steps }
							currentStepIndex={ currentStepIndex }
							onMaximize={ handleMaximize }
							onDismiss={ handleDismiss }
						/>
					) }
				</div>
			</div>
		</>
	);
};

export default TourKitFrame;
