import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Button, Flex } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createPortal, useEffect, useState, useRef, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import maximize from './icons/maximize';
import WelcomeTourCard from './tour-card';
import getTourContent from './tour-content';

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
	new window.Image().src = getTourContent( localeSlug )[ 0 ].imgSrc;

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

const useKeyboardNavigation = (
	ref,
	{ onMinimize, onNextCardProgression, onPreviousCardProgression }
) => {
	const handleKeydown = useCallback(
		( event ) => {
			switch ( event.keyCode ) {
				case 27: // Escape key
					onMinimize( true );
					break;
				case 37: // left arrow
					onPreviousCardProgression();
					break;
				case 39: // right arrow
					onNextCardProgression();
					break;
				default:
					break;
			}
		},
		[ onMinimize, onNextCardProgression, onPreviousCardProgression ]
	);

	useEffect( () => {
		const element = ref?.current || document;

		// console.log( ref, 234 );
		element.addEventListener( 'keydown', handleKeydown );

		return () => {
			// console.log( ref, 345 );
			element.removeEventListener( 'keydown', handleKeydown );
		};
	}, [ ref, handleKeydown ] );
};

function KeyboardNavigation( { onMinimize, onNextCardProgression, onPreviousCardProgression } ) {
	const ref = useRef();
	useKeyboardNavigation( ref, { onMinimize, onNextCardProgression, onPreviousCardProgression } );
	return null;
}

function WelcomeTourFrame() {
	const localeSlug = useLocale();
	const cardContent = getTourContent( localeSlug );
	const lastCardIndex = cardContent.length - 1;
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentCardIndex, setCurrentCardIndex ] = useState( 0 );
	const [ justMaximized, setJustMaximized ] = useState( false );

	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );

	const handleDismiss = ( source ) => {
		recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: currentCardIndex + 1,
			action: source,
		} );
		setShowWelcomeGuide( false, { openedManually: false } );
	};

	// Preload card images
	cardContent.forEach( ( card ) => ( new window.Image().src = card.imgSrc ) );

	// Some editor menus close when they lose focus (onblur), but when the tour is open or minimized the user should
	// be able to interact with menus (ex: the Block Inserter). To make that happen we capture the onMouseDown event
	const captureWelcomeTourFrameClick = ( e ) => {
		e.preventDefault();
	};

	const handleNextCardProgression = () => {
		if ( lastCardIndex > currentCardIndex ) {
			setCurrentCardIndex( currentCardIndex + 1 );
		}
	};

	const handlePreviousCardProgression = () => {
		currentCardIndex && setCurrentCardIndex( currentCardIndex - 1 );
	};

	return (
		<div
			className="wpcom-editor-welcome-tour-frame"
			onMouseDownCapture={ captureWelcomeTourFrameClick }
		>
			{ ! isMinimized ? (
				<>
					<KeyboardNavigation
						onMinimize={ setIsMinimized }
						onNextCardProgression={ handleNextCardProgression }
						onPreviousCardProgression={ handlePreviousCardProgression }
					/>
					<WelcomeTourCard
						cardContent={ cardContent[ currentCardIndex ] }
						cardIndex={ currentCardIndex }
						justMaximized={ justMaximized }
						key={ currentCardIndex }
						lastCardIndex={ lastCardIndex }
						onDismiss={ handleDismiss }
						onMinimize={ setIsMinimized }
						setJustMaximized={ setJustMaximized }
						setCurrentCardIndex={ setCurrentCardIndex }
						onNextCardProgression={ handleNextCardProgression }
						onPreviousCardProgression={ handlePreviousCardProgression }
					/>
				</>
			) : (
				<WelcomeTourMinimized
					onMaximize={ setIsMinimized }
					setJustMaximized={ setJustMaximized }
					slideNumber={ currentCardIndex + 1 }
				/>
			) }
		</div>
	);
}

function WelcomeTourMinimized( { onMaximize, setJustMaximized, slideNumber } ) {
	const handleOnMaximize = () => {
		onMaximize( false );
		setJustMaximized( true );
		recordTracksEvent( 'calypso_editor_wpcom_tour_maximize', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: slideNumber,
		} );
	};

	return (
		<Button onClick={ handleOnMaximize } className="wpcom-editor-welcome-tour__resume-btn">
			<Flex gap={ 13 }>
				<p>{ __( 'Click to resume tutorial', 'full-site-editing' ) }</p>
				<Icon icon={ maximize } size={ 24 } />
			</Flex>
		</Button>
	);
}

export default LaunchWpcomWelcomeTour;
