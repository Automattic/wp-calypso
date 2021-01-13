/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

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
import apiFetch from '@wordpress/api-fetch';
import { Icon } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { createPortal, useEffect, useState, useRef } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { __ } from '@wordpress/i18n';

function LaunchWpcomWelcomeTour() {
	const portalParent = useRef( document.createElement( 'div' ) ).current;
	const isWpcomNuxEnabled = useSelect( ( select ) =>
		select( 'automattic/nux' ).isWpcomNuxEnabled()
	);
	const { closeGeneralSidebar } = useDispatch( 'core/edit-post' );
	const isTourManuallyOpened = useSelect( ( select ) =>
		select( 'automattic/nux' ).isTourManuallyOpened()
	);
	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

	// Preload first card image (others preloaded after NUX status confirmed)
	new window.Image().src = getTourContent()[ 0 ].imgSrc;

	// On mount check if the WPCOM NUX status exists in state, otherwise fetch it from the API.
	useEffect( () => {
		if ( typeof isWpcomNuxEnabled !== 'undefined' ) {
			return;
		}

		const fetchWpcomNuxStatus = async () => {
			const response = await apiFetch( { path: '/wpcom/v2/block-editor/nux' } );
			setWpcomNuxStatus( { isNuxEnabled: response.is_nux_enabled, bypassApi: true } );
		};
		fetchWpcomNuxStatus();
	}, [ isWpcomNuxEnabled, setWpcomNuxStatus ] );

	// Hide editor sidebar first time user sees the editor
	useEffect( () => {
		isWpcomNuxEnabled && closeGeneralSidebar();
	}, [ closeGeneralSidebar, isWpcomNuxEnabled ] );

	useEffect( () => {
		if ( ! isWpcomNuxEnabled ) {
			return;
		}
		portalParent.classList.add( 'wpcom-editor-welcome-tour-portal-parent' );
		document.body.appendChild( portalParent );

		recordTracksEvent( 'calypso_editor_wpcom_tour_open', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			is_manually_opened: isTourManuallyOpened,
		} );
		return () => {
			document.body.removeChild( portalParent );
		};
	}, [ isWpcomNuxEnabled, portalParent ] );

	if ( ! isWpcomNuxEnabled ) {
		return null;
	}

	return <div>{ createPortal( <WelcomeTourFrame />, portalParent ) }</div>;
}

function WelcomeTourFrame() {
	const cardContent = getTourContent();
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentCardIndex, setCurrentCardIndex ] = useState( 0 );
	const [ justMaximized, setJustMaximized ] = useState( false );
	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

	const dismissWpcomNuxTour = ( source ) => {
		recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: currentCardIndex + 1,
			action: source,
		} );

		setWpcomNuxStatus( { isNuxEnabled: false } );
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

registerPlugin( 'wpcom-block-editor-welcome-tour', {
	render: () => <LaunchWpcomWelcomeTour />,
} );
