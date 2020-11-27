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
import { Icon } from '@wordpress/icons';
import { createPortal, useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

function LaunchWpcomNuxTour() {
	// Create parent div for welcome tour portal
	const portalParent = document.createElement( 'div' );
	portalParent.classList.add( 'wpcom-editor-welcome-tour-portal-parent' );
	useEffect( () => {
		document.body.appendChild( portalParent );
		return () => {
			// TODO: figure out how to unmount the LaunchWpcomNuxTour as this is not running when modal is closed
			document.body.removeChild( portalParent );
		};
	} );

	return <div>{ createPortal( <WelcomeTourFrame />, portalParent ) }</div>;
}

function WelcomeTourFrame() {
	const cardContent = getTourContent();
	const [ isMinimized, setIsMinimized ] = useState( false );
	const [ currentCard, setCurrentCard ] = useState( 0 );
	// TODO: replace isNuxEnabled with wp.data
	const [ isNuxEnabled, setIsNuxEnabled ] = useState( true );
	const dismissWpcomNuxTour = () => {
		// TODO recordTracksEvent
		setIsNuxEnabled( false );
	};

	if ( ! isNuxEnabled ) {
		return null;
	}

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

export default LaunchWpcomNuxTour;

registerPlugin( 'wpcom-block-editor-nux', {
	render: () => <LaunchWpcomNuxTour />,
} );
