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
import { createPortal, useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';
import { recordTracksEvent } from '@automattic/calypso-analytics';

function LaunchWpcomWelcomeTour() {
	const [ portalParent ] = useState( () => document.createElement( 'div' ) );
	const isWpcomNuxEnabled = useSelect( ( select ) =>
		select( 'automattic/nux' ).isWpcomNuxEnabled()
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

	useEffect( () => {
		if ( ! isWpcomNuxEnabled ) {
			return;
		}
		portalParent.classList.add( 'wpcom-editor-welcome-tour-portal-parent' );
		document.body.appendChild( portalParent );

		recordTracksEvent( 'calypso_editor_wpcom_tour_open', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
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
	const [ currentCard, setCurrentCard ] = useState( 0 );
	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

	const dismissWpcomNuxTour = () => {
		recordTracksEvent( 'calypso_editor_wpcom_tour_dismiss', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: currentCard + 1,
		} );

		setWpcomNuxStatus( { isNuxEnabled: false } );
	};

	// Preload card images
	cardContent.forEach( ( card ) => ( new window.Image().src = card.imgSrc ) );

	return (
		<div className="wpcom-editor-welcome-tour-frame">
			{ ! isMinimized ? (
				<WelcomeTourCard
					cardContent={ cardContent[ currentCard ] }
					cardIndex={ currentCard }
					key={ currentCard }
					lastCardIndex={ cardContent.length - 1 }
					onDismiss={ dismissWpcomNuxTour }
					onMinimize={ setIsMinimized }
					setCurrentCard={ setCurrentCard }
				/>
			) : (
				<WelcomeTourMinimized onMaximize={ setIsMinimized } />
			) }
		</div>
	);
}

function WelcomeTourMinimized( { onMaximize } ) {
	return (
		<Button onClick={ () => onMaximize( false ) } className="wpcom-editor-welcome-tour__resume-btn">
			<Flex gap={ 13 }>
				<p>Click to resume tutorial</p>
				<Icon icon={ maximize } size={ 24 } />
			</Flex>
		</Button>
	);
}

export default LaunchWpcomWelcomeTour;

registerPlugin( 'wpcom-block-editor-welcome-tour', {
	render: () => <LaunchWpcomWelcomeTour />,
} );
