import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useLocale } from '@automattic/i18n-utils';
import { Button, Flex } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createPortal, useEffect, useState, useRef } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import useFocus from './hooks/use-focus';
import useKeyboardNavigation from './hooks/use-keyboard-navigation';
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

function KeyboardNavigation( { onMinimize, onNextCardProgression, onPreviousCardProgression } ) {
	useKeyboardNavigation( onMinimize, onNextCardProgression, onPreviousCardProgression );
	return null;
}

function WelcomeTourFrame() {
	const ref = useRef( null );
	const isTourFocused = useFocus( ref );
	const { setShowWelcomeGuide } = useDispatch( 'automattic/wpcom-welcome-guide' );
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentCardIndex, setCurrentCardIndex ] = useState( 0 );
	const [ justMaximized, setJustMaximized ] = useState( false );
	const localeSlug = useLocale();
	const cardContent = getTourContent( localeSlug );
	const lastCardIndex = cardContent.length - 1;
	const isGutenboarding = window.calypsoifyGutenberg?.isGutenboarding;

	const handleDismiss = ( source ) => {
		recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
			is_gutenboarding: isGutenboarding,
			slide_number: currentCardIndex + 1,
			action: source,
		} );
		setShowWelcomeGuide( false, { openedManually: false } );
	};

	const handleNextCardProgression = () => {
		if ( lastCardIndex > currentCardIndex ) {
			setCurrentCardIndex( currentCardIndex + 1 );
		}
	};

	const handlePreviousCardProgression = () => {
		currentCardIndex && setCurrentCardIndex( currentCardIndex - 1 );
	};

	const handleMinimize = () => {
		setIsMinimized( true );
		recordTracksEvent( 'calypso_editor_wpcom_tour_minimize', {
			is_gutenboarding: isGutenboarding,
			slide_number: currentCardIndex + 1,
		} );
	};

	const handleMaximize = () => {
		setIsMinimized( false );
		setJustMaximized( true );
		recordTracksEvent( 'calypso_editor_wpcom_tour_maximize', {
			is_gutenboarding: isGutenboarding,
			slide_number: currentCardIndex + 1,
		} );
	};

	// Preload card images
	cardContent.forEach( ( card ) => ( new window.Image().src = card.imgSrc ) );

	return (
		<div className="wpcom-editor-welcome-tour-frame" ref={ ref }>
			{ ! isMinimized ? (
				<>
					{ isTourFocused && (
						<KeyboardNavigation
							onMinimize={ handleMinimize }
							onNextCardProgression={ handleNextCardProgression }
							onPreviousCardProgression={ handlePreviousCardProgression }
						/>
					) }
					<WelcomeTourCard
						cardContent={ cardContent[ currentCardIndex ] }
						currentCardIndex={ currentCardIndex }
						justMaximized={ justMaximized }
						key={ currentCardIndex }
						lastCardIndex={ lastCardIndex }
						onDismiss={ handleDismiss }
						onMinimize={ handleMinimize }
						setJustMaximized={ setJustMaximized }
						setCurrentCardIndex={ setCurrentCardIndex }
						onNextCardProgression={ handleNextCardProgression }
						onPreviousCardProgression={ handlePreviousCardProgression }
						isGutenboarding={ isGutenboarding }
					/>
				</>
			) : (
				<WelcomeTourMinimized onMaximize={ handleMaximize } />
			) }
		</div>
	);
}

function WelcomeTourMinimized( { onMaximize } ) {
	return (
		<Button onClick={ onMaximize } className="wpcom-editor-welcome-tour__resume-btn">
			<Flex gap={ 13 }>
				<p>{ __( 'Click to resume tutorial', 'full-site-editing' ) }</p>
				<Icon icon={ maximize } size={ 24 } />
			</Flex>
		</Button>
	);
}

export default LaunchWpcomWelcomeTour;
