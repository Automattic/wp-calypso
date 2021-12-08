/**
 * External Dependencies
 */
import { useMobileBreakpoint } from '@automattic/viewport-react';
import { useEffect, useState, useCallback, useRef } from '@wordpress/element';
import classnames from 'classnames';
import { usePopper } from 'react-popper';
/**
 * Internal Dependencies
 */
import KeyboardNavigation from './keyboard-navigation';
import TourKitMinimized from './tour-kit-minimized';
import Overlay from './tour-kit-overlay';
import Spotlight from './tour-kit-spotlight';
import TourKitStep from './tour-kit-step';
import type { Config, Callback } from '../types';

interface Props {
	config: Config;
}

const handleCallback = ( currentStepIndex: number, callback?: Callback ) => {
	typeof callback === 'function' && callback( currentStepIndex );
};

const TourKitFrame: React.FunctionComponent< Props > = ( { config } ) => {
	const [ popperReady, setPopperReady ] = useState( true );
	const tourContainerRef = useRef( null );
	const [ popperElement, sePopperElement ] = useState< HTMLElement | null >( null );
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

	const showArrowIndicator = useCallback( () => {
		if ( config.options?.effects?.arrowIndicator === false ) {
			return false;
		}

		return !! ( referenceElement && ! isMinimized );
	}, [ config.options?.effects?.arrowIndicator, isMinimized, referenceElement ] );

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

	const { styles: popperStyles, attributes: popperAttributes, update } = usePopper(
		referenceElement,
		popperElement,
		{
			strategy: 'fixed',
			placement: 'bottom',
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
				...( config.options?.popperModifiers || [] ),
			],
		}
	);

	const stepRepositionProps =
		! isMinimized && referenceElement && popperReady
			? {
					style: popperStyles?.popper,
					...popperAttributes?.popper,
			  }
			: null;

	const arrowPositionProps =
		! isMinimized && referenceElement && popperReady
			? {
					style: popperStyles?.arrow,
					...popperAttributes?.arrow,
			  }
			: null;

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
		/*
		 * First interactive element when step renders
		 */
		setTimeout( () => initialFocusedElement?.focus() );
	}, [ initialFocusedElement ] );

	useEffect( () => {
		/*
		 * Fixes issue with Popper misplacing the instance on mount
		 * See: https://stackoverflow.com/questions/65585859/react-popper-incorrect-position-on-mount
		 */
		if ( update ) {
			setPopperReady( false );
			update()
				.then( () => setPopperReady( true ) )
				.catch( () => setPopperReady( true ) );
		}
	}, [ currentStepIndex, update ] );

	const classNames = classnames(
		'tour-kit-frame',
		config.options?.className,
		isMobile ? 'is-mobile' : 'is-desktop',
		{ '--visible': tourReady }
	);

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
				{ showSpotlight() && (
					<Spotlight
						referenceElement={ referenceElement }
						styles={ config.options?.effects?.spotlight?.styles }
					/>
				) }
				<div
					className="tour-kit-frame__container"
					ref={ sePopperElement }
					{ ...stepRepositionProps }
				>
					{ showArrowIndicator() && (
						<div className="tour-kit-frame__arrow" data-popper-arrow { ...arrowPositionProps } />
					) }
					{ ! isMinimized ? (
						<TourKitStep
							config={ config }
							steps={ config.steps }
							currentStepIndex={ currentStepIndex }
							onMinimize={ handleMinimize }
							onDismiss={ handleDismiss }
							onNext={ handleNextStepProgression }
							onPrevious={ handlePreviousStepProgression }
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
