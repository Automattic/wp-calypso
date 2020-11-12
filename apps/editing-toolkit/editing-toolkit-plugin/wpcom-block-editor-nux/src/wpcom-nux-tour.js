/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * Internal dependencies
 */
import './style-tour.scss';
import editorImage from './images/editor.svg';

/**
 * External dependencies
 */
import { Button, Card, CardBody, CardFooter, Text } from '@wordpress/components';
import { Icon, expand } from '@wordpress/icons';

import { createPortal, useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

function LaunchWpcomNuxTour() {
	console.log( 'LaunchWpcomNuxTour' );

	// Create parent for welcome tour portal
	const portalParent = document.createElement( 'div' );
	useEffect( () => {
		document.body.appendChild( portalParent );
		return () => {
			document.body.removeChild( portalParent );
		};
	} );

	return <div>{ createPortal( <WelcomeTour />, portalParent ) }</div>;
}

function WelcomeTour() {
	const [ isMinimized, setIsMinimized ] = useState( false );
	// const containerClass = isMinimized ? 'minimized';
	return (
		<div className="wpcom-editor-welcome-tour-container">
			{ ! isMinimized ? (
				<Card>
					<CardBody>
						<h2 className="wpcom-editor-welcome-tour__card-heading">
							Let's learn the basics of Block Editing
						</h2>
					</CardBody>
					<CardFooter>
						<Button isPrimary={ true } onClick={ () => setIsMinimized( true ) }>
							Minimize Me
						</Button>
					</CardFooter>
				</Card>
			) : (
				<div className="wpcom-editor-welcome-tour__minimized-container">
					<Button icon="expand" onClick={ () => setIsMinimized( false ) }>
						Expand to resume
						{ /* <Icon icon={ expand } size={ 16 } /> */ }
						{ /* // Hm, Icon not working */ }
					</Button>
				</div>
			) }
		</div>
	);
}

// export default LaunchWpcomNuxTour;

// For deving
// registerPlugin( 'wpcom-block-editor-nux', {
// 	render: () => <LaunchWpcomNuxTour />,
// } );
