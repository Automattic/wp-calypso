/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Button, Flex } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import {
	createPortal,
	useEffect,
	useState,
	useRef,
	createInterpolateElement,
	useMemo,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
import { usePopper } from 'react-popper';
/**
 * Internal Dependencies
 */
import Spotlight from './components/spotlight';
import maximize from './icons/maximize';
import KeyboardNavigation from './keyboard-navigation';
import WelcomeTourCard from './tour-card';
import getTourSteps from './tour-steps';

import './style-tour.scss';

function LaunchWpcomWelcomeTour() {
	const { show, isNewPageLayoutModalOpen, isManuallyOpened } = useSelect( ( select ) => ( {
		show: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideShown(),
		// Handle the case where the new page pattern modal is initialized and open
		isNewPageLayoutModalOpen:
			select( 'automattic/starter-page-layouts' ) &&
			select( 'automattic/starter-page-layouts' ).isOpen(),
		isManuallyOpened: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideManuallyOpened(),
	} ) );

	useEffect( () => {
		if ( ! show && ! isNewPageLayoutModalOpen ) {
			return;
		}

		// Track opening of the Welcome Guide
		recordTracksEvent( 'calypso_editor_wpcom_tour_open', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			is_manually_opened: isManuallyOpened,
		} );
	}, [ isNewPageLayoutModalOpen, isManuallyOpened, show ] );

	if ( ! show || isNewPageLayoutModalOpen ) {
		return null;
	}

	return <WelcomeTour />;
}

function WelcomeTour() {
	const localeSlug = useLocale();
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const [ justMaximized, setJustMaximized ] = useState( false );
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;

	function WelcomeTourStep( {
		steps,
		currentStepIndex,
		onDismiss,
		onNext,
		onPrevious,
		onMinimize,
		setInitialFocusedElement,
		onGoToStep,
	} ) {
		const lastStepIndex = steps.length - 1;

		return (
			<WelcomeTourCard
				cardContent={ steps[ currentStepIndex ].meta }
				currentStepIndex={ currentStepIndex }
				justMaximized={ justMaximized }
				lastStepIndex={ lastStepIndex }
				onDismiss={ onDismiss }
				onMinimize={ onMinimize }
				setJustMaximized={ setJustMaximized }
				setCurrentStepIndex={ onGoToStep }
				onNextStepProgression={ onNext }
				onPreviousStepProgression={ onPrevious }
				isGutenboarding={ isGutenboarding }
				setInitialFocusedElement={ setInitialFocusedElement }
			/>
		);
	}

	function WelcomeTourMinimized( { steps, onMaximize, onDismiss, currentStepIndex } ) {
		const lastStepIndex = steps.length - 1;
		const page = currentStepIndex + 1;
		const numberOfPages = lastStepIndex + 1;

		return (
			<Flex gap={ 0 } className="wpcom-editor-welcome-tour__minimized">
				<Button onClick={ onMaximize } aria-label={ __( 'Resume Tour', 'full-site-editing' ) }>
					<Flex gap={ 13 }>
						<p>
							{ createInterpolateElement(
								sprintf(
									/* translators: 1: current page number, 2: total number of pages */
									__( 'Resume welcome tour <span>(%1$d/%2$d)</span>', 'full-site-editing' ),
									page,
									numberOfPages
								),
								{
									span: <span className="wpcom-editor-welcome-tour__minimized-tour-index" />,
								}
							) }
						</p>
						<Icon icon={ maximize } size={ 24 } />
					</Flex>
				</Button>
				<Button
					onClick={ onDismiss( 'close-btn-minimized' ) }
					aria-label={ __( 'Close Tour', 'full-site-editing' ) }
				>
					<Icon icon={ close } size={ 24 } />
				</Button>
			</Flex>
		);
	}

	const tourConfig = {
		steps: getTourSteps( localeSlug ),
		options: {
			/* optional [ onMinimize, onMaximize, onGoToStep, onNextStep, onPreviousStep ] */
			callbacks: {
				onMinimize: ( currentStepIndex ) => {
					recordTracksEvent( 'calypso_editor_wpcom_tour_minimize', {
						is_gutenboarding: isGutenboarding,
						slide_number: currentStepIndex + 1,
					} );
				},
				onMaximize: ( currentStepIndex ) => {
					setJustMaximized( true );
					recordTracksEvent( 'calypso_editor_wpcom_tour_maximize', {
						is_gutenboarding: isGutenboarding,
						slide_number: currentStepIndex + 1,
					} );
				},
			},
			/* required */
			closeHandler: ( steps, currentStepIndex, source ) => {
				recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
					is_gutenboarding: isGutenboarding,
					slide_number: currentStepIndex + 1,
					action: source,
				} );
				setShowWelcomeGuide( false, { openedManually: false } );
			},
			/* required */
			mainRender: WelcomeTourStep,
			/* required / can be `() => null` */
			miniRender: WelcomeTourMinimized,
		},
	};

	// @todo clk
	// Preload first card image (others preloaded after open state confirmed)
	new window.Image().src = getTourSteps( localeSlug )[ 0 ].meta.imgSrc;

	return <PackagedTour config={ tourConfig } />;
}

function PackagedTour( { config } ) {
	const portalParent = useRef( document.createElement( 'div' ) ).current;

	useEffect( () => {
		// @todo clk
		portalParent.classList.add( 'wpcom-editor-welcome-tour-portal-parent' );
		document.body.appendChild( portalParent );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ portalParent ] );

	return <div>{ createPortal( <TourFrame config={ config } />, portalParent ) }</div>;
}

function TourFrame( { config } ) {
	const tourContainerRef = useRef( null );
	const popperElementRef = useRef( null );
	const [ initialFocusedElement, setInitialFocusedElement ] = useState( null );
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentStepIndex, setCurrentStepIndex ] = useState( 0 );
	const steps = config.steps;
	const lastStepIndex = steps.length - 1;

	const handleCallback = ( callback ) => {
		typeof callback === 'function' && callback( currentStepIndex );
	};

	const handleDismiss = ( source ) => {
		return () => {
			config.options.closeHandler( steps, currentStepIndex, source );
		};
	};

	const handleNextStepProgression = () => {
		if ( lastStepIndex > currentStepIndex ) {
			setCurrentStepIndex( currentStepIndex + 1 );
		}
		handleCallback( config.options.callbacks?.onNextStep );
	};

	const handlePreviousStepProgression = () => {
		currentStepIndex && setCurrentStepIndex( currentStepIndex - 1 );
		handleCallback( config.options.callbacks?.onPreviousStep );
	};

	const handleGoToStep = ( stepIndex ) => {
		setCurrentStepIndex( stepIndex );
		handleCallback( config.options.callbacks?.onGoToStep );
	};

	const handleMinimize = () => {
		setIsMinimized( true );
		handleCallback( config.options.callbacks?.onMinimize );
	};

	const handleMaximize = () => {
		setIsMinimized( false );
		handleCallback( config.options.callbacks?.onMiximize );
	};

	const isWelcomeTourNext = () => {
		return new URLSearchParams( document.location.search ).has( 'welcome-tour-next' );
	};

	useEffect( () => {
		// focus the Next/Begin button as the first interactive element when tour loads
		setTimeout( () => initialFocusedElement?.focus() );
	}, [ initialFocusedElement ] );

	const referenceElementSelector = steps[ currentStepIndex ].referenceElements.desktop;
	const referenceElement = document.querySelector( referenceElementSelector );
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
				useMemo(
					() => ( {
						name: 'offset',
						options: {
							offset: ( { placement, reference } ) => {
								if ( placement === 'bottom' ) {
									const boundary = document.querySelector( '.edit-post-header' );
									const boundaryRect = boundary.getBoundingClientRect();
									const boundaryBottomY = boundaryRect.height + boundaryRect.y;
									const referenceBottomY = reference.height + reference.y;

									return [ 0, boundaryBottomY - referenceBottomY + 16 ];
								}
								return [ 0, 0 ];
							},
						},
					} ),
					[]
				),
			],
		}
	);

	const stepRepositionProps =
		! isMinimized && referenceElement && isWelcomeTourNext()
			? {
					style: popperStyles?.popper,
					...popperAttributes?.popper,
			  }
			: null;

	// Preload card images
	steps.forEach( ( step ) => ( new window.Image().src = step.meta.imgSrc ) );

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
			<div className="wpcom-editor-welcome-tour__container" ref={ tourContainerRef }>
				{ /* @todo: Rethink the design here a bit - idealy split between minimized and step-tour components */ }
				{ ! isMinimized && isWelcomeTourNext() && (
					<Spotlight referenceElementSelector={ referenceElementSelector } />
				) }
				<div
					className="wpcom-editor-welcome-tour-frame"
					ref={ popperElementRef }
					{ ...stepRepositionProps }
				>
					{ ! isMinimized ? (
						<>
							{ config.options.mainRender( {
								steps,
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
							{ config.options.miniRender( {
								steps,
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
}

export default LaunchWpcomWelcomeTour;
