/**
 * Internal dependencies
 */
import WelcomeTourCard from './tour-card';
import getTourContent from './tour-content';
import maximize from './icons/maximize';
import './style-tour.scss';

/**
 * External dependencies
 */
import { Button, Flex } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { createPortal, useEffect, useState, useRef } from '@wordpress/element';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { __ } from '@wordpress/i18n';

function LaunchWpcomWelcomeTour() {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const { isWpcomNuxEnabled, isSPTOpen, isGuideManuallyOpened } = useSelect( ( select ) => ( {
		isWpcomNuxEnabled: select( 'automattic/nux' ).isWpcomNuxEnabled(),
		// Handle the case where SPT is initialized and open
		isSPTOpen:
			select( 'automattic/starter-page-layouts' ) &&
			select( 'automattic/starter-page-layouts' ).isOpen(),
		isGuideManuallyOpened: select( 'automattic/nux' ).isGuideManuallyOpened(),
	} ) );

	const { closeGeneralSidebar } = useDispatch( 'core/edit-post' );

	// Preload first card image (others preloaded after NUX status confirmed)
	new window.Image().src = getTourContent()[ 0 ].imgSrc;

	// Hide editor sidebar first time user sees the editor
	useEffect( () => {
		isWpcomNuxEnabled && closeGeneralSidebar();
	}, [ closeGeneralSidebar, isWpcomNuxEnabled ] );

	useEffect( () => {
		if ( ! isWpcomNuxEnabled && ! isSPTOpen ) {
			return;
		}
		portalParent.classList.add( 'wpcom-editor-welcome-tour-portal-parent' );
		document.body.appendChild( portalParent );

		// Track opening of the Welcome Guide
		recordTracksEvent( 'calypso_editor_wpcom_tour_open', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			is_manually_opened: isGuideManuallyOpened,
		} );
		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ isSPTOpen, isGuideManuallyOpened, isWpcomNuxEnabled, portalParent ] );

	if ( ! isWpcomNuxEnabled || isSPTOpen ) {
		return null;
	}

	return <div>{ createPortal( <WelcomeTourFrame />, portalParent ) }</div>;
}

function WelcomeTourFrame() {
	const cardContent = getTourContent();
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentCardIndex, setCurrentCardIndex ] = useState( 0 );
	const [ justMaximized, setJustMaximized ] = useState( false );

	const { setWpcomNuxStatus, setGuideOpenStatus } = useDispatch( 'automattic/nux' );

	const dismissWpcomNuxTour = ( source ) => {
		recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: currentCardIndex + 1,
			action: source,
		} );
		setWpcomNuxStatus( { isNuxEnabled: false } );
		setGuideOpenStatus( { isGuideManuallyOpened: false } );
	};

	// Preload card images
	cardContent.forEach( ( card ) => ( new window.Image().src = card.imgSrc ) );

	return (
		<div className="wpcom-editor-welcome-tour-frame">
			{ ! isMinimized ? (
				<WelcomeTourCard
					cardContent={ cardContent[ currentCardIndex ] }
					cardIndex={ currentCardIndex }
					justMaximized={ justMaximized }
					key={ currentCardIndex }
					lastCardIndex={ cardContent.length - 1 }
					onDismiss={ dismissWpcomNuxTour }
					onMinimize={ setIsMinimized }
					setJustMaximized={ setJustMaximized }
					setCurrentCardIndex={ setCurrentCardIndex }
				/>
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
