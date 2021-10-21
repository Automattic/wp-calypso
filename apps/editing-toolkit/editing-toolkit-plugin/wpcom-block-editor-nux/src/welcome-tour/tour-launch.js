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
	useCallback,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, close } from '@wordpress/icons';
/**
 * Internal Dependencies
 */
import usePopperHandler from './hooks/use-popper-handler';
import maximize from './icons/maximize';
import KeyboardNavigation from './keyboard-navigation';
import WelcomeTourCard from './tour-card';
import getTourSteps from './tour-steps';

import './style-tour.scss';

function LaunchWpcomWelcomeTour() {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const { show, isNewPageLayoutModalOpen, isManuallyOpened } = useSelect( ( select ) => ( {
		show: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideShown(),
		// Handle the case where the new page pattern modal is initialized and open
		isNewPageLayoutModalOpen:
			select( 'automattic/starter-page-layouts' ) &&
			select( 'automattic/starter-page-layouts' ).isOpen(),
		isManuallyOpened: select( 'automattic/wpcom-welcome-guide' ).isWelcomeGuideManuallyOpened(),
	} ) );

	const localeSlug = useLocale();

	// Preload first card image (others preloaded after open state confirmed)
	new window.Image().src = getTourSteps( localeSlug )[ 0 ].meta.imgSrc;

	useEffect( () => {
		if ( ! show && ! isNewPageLayoutModalOpen ) {
			return;
		}

		portalParent.classList.add( 'wpcom-editor-welcome-tour-portal-parent' );
		document.body.appendChild( portalParent );

		// Track opening of the Welcome Guide
		recordTracksEvent( 'calypso_editor_wpcom_tour_open', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			is_manually_opened: isManuallyOpened,
		} );

		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ isNewPageLayoutModalOpen, isManuallyOpened, show, portalParent ] );

	if ( ! show || isNewPageLayoutModalOpen ) {
		return null;
	}

	return <div>{ createPortal( <WelcomeTourFrame />, portalParent ) }</div>;
}

function WelcomeTourFrame() {
	const tourContainerRef = useRef( null );
	const focusedOnLaunchRef = useRef( null );
	const popperElementRef = useRef( null );
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ focusedElementOnLaunch, setFocusedElementOnLaunch ] = useState( null );
	const [ currentStepIndex, setCurrentStepIndex ] = useState( 0 );
	const [ justMaximized, setJustMaximized ] = useState( false );
	const localeSlug = useLocale();
	const steps = getTourSteps( localeSlug );
	const lastStepIndex = steps.length - 1;
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;

	const handleDismiss = ( source ) => {
		return () => {
			recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
				is_gutenboarding: isGutenboarding,
				slide_number: currentStepIndex + 1,
				action: source,
			} );
			setShowWelcomeGuide( false, { openedManually: false } );
		};
	};

	const handleNextStepProgression = useCallback( () => {
		if ( lastStepIndex > currentStepIndex ) {
			setCurrentStepIndex( currentStepIndex + 1 );
		}
	}, [ currentStepIndex ] );

	const handlePreviousStepProgression = () => {
		currentStepIndex && setCurrentStepIndex( currentStepIndex - 1 );
	};

	const handleMinimize = () => {
		setIsMinimized( true );
		recordTracksEvent( 'calypso_editor_wpcom_tour_minimize', {
			is_gutenboarding: isGutenboarding,
			slide_number: currentStepIndex + 1,
		} );
	};

	const handleMaximize = () => {
		setIsMinimized( false );
		setJustMaximized( true );
		recordTracksEvent( 'calypso_editor_wpcom_tour_maximize', {
			is_gutenboarding: isGutenboarding,
			slide_number: currentStepIndex + 1,
		} );
	};

	useEffect( () => {
		// focus the Next/Begin button as the first interactive element when tour loads
		setTimeout( () => focusedElementOnLaunch?.focus() );
	}, [ focusedElementOnLaunch ] );

	// Preload card images
	steps.forEach( ( step ) => ( new window.Image().src = step.meta.imgSrc ) );

	const { styles, attributes } = usePopperHandler(
		steps[ currentStepIndex ].referenceElements.desktop,
		popperElementRef
	);

	const stepRepositionProps = ! isMinimized
		? {
				style: styles?.popper,
				...attributes?.popper,
		  }
		: null;

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
				{ ! isMinimized && <div className="wpcom-editor-welcome-tour__screen-overlay" /> }
				<div className="wpcom-editor-welcome-tour-frame" ref={ popperElementRef } { ...stepRepositionProps }>
					{ ! isMinimized ? (
						<>
							<WelcomeTourCard
								cardContent={ steps[ currentStepIndex ].meta }
								currentStepIndex={ currentStepIndex }
								justMaximized={ justMaximized }
								lastStepIndex={ lastStepIndex }
								onDismiss={ handleDismiss }
								onMinimize={ handleMinimize }
								setJustMaximized={ setJustMaximized }
								setCurrentStepIndex={ setCurrentStepIndex }
								onNextStepProgression={ handleNextStepProgression }
								onPreviousStepProgression={ handlePreviousStepProgression }
								isGutenboarding={ isGutenboarding }
								setFocusedElementOnLaunch={ setFocusedElementOnLaunch }
							/>
						</>
					) : (
						<WelcomeTourMinimized
							onMaximize={ handleMaximize }
							onDismiss={ handleDismiss }
							currentStepIndex={ currentStepIndex }
							lastStepIndex={ lastStepIndex }
						/>
					) }
				</div>
			</div>
		</>
	);
}

function WelcomeTourMinimized( { onMaximize, onDismiss, currentStepIndex, lastStepIndex } ) {
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

export default LaunchWpcomWelcomeTour;
