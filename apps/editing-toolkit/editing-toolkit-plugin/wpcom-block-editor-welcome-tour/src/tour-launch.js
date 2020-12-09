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

function LaunchWpcomWelcomeTour() {
	const isWpcomNuxEnabled = useSelect( ( select ) =>
		select( 'automattic/nux' ).isWpcomNuxEnabled()
	);
	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

	// Create parent div for welcome tour portal
	const portalParent = document.createElement( 'div' );
	portalParent.classList.add( 'wpcom-editor-welcome-tour-portal-parent' );

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

		document.body.appendChild( portalParent );
		return () => {
			// TODO: figure out how to unmount the LaunchWpcomWelcomeTour as this is not running when modal is closed
			document.body.removeChild( portalParent );
		};
	} );

	return <div>{ createPortal( <WelcomeTourFrame />, portalParent ) }</div>;
}

function WelcomeTourFrame() {
	const cardContent = getTourContent();
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentCard, setCurrentCard ] = useState( 0 );
	const { setWpcomNuxStatus } = useDispatch( 'automattic/nux' );

	const dismissWpcomNuxTour = () => {
		// TODO recordTracksEvent
		setWpcomNuxStatus( { isNuxEnabled: false } );
	};

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
