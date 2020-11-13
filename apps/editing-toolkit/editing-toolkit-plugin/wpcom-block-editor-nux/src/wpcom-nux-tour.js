/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * Internal dependencies
 */
import './style-tour.scss';

/**
 * External dependencies
 */
import { Button, Card, CardBody, CardFooter, CardMedia, Flex } from '@wordpress/components';
// import styled from '@emotion/styled';
import { Icon, expand, chevronUp } from '@wordpress/icons';

import { createPortal, useEffect, useState } from '@wordpress/element';
import { registerPlugin } from '@wordpress/plugins';

function LaunchWpcomNuxTour() {
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
	// TODO: replace with wp.data
	const [ isNuxEnabled, setIsNuxEnabled ] = useState( true );

	const dismissWpcomNuxTour = () => {
		// TODO recordTracksEvent
		// setWpcomNuxStatus( { isNuxEnabled: false } );
		setIsNuxEnabled( false );
	};

	if ( ! isNuxEnabled ) {
		return null;
	}

	// const containerClass = isMinimized ? 'minimized';
	return (
		<div className="wpcom-editor-welcome-tour-container">
			{ ! isMinimized ? (
				<Card className="welcome-tour-card">
					<div className="welcome-tour-card__overlay-controls">
						<Flex>
							<Button
								isPrimary
								icon="pets"
								iconSize={ 14 }
								onClick={ () => setIsMinimized( true ) }
							></Button>
							<Button
								isPrimary
								icon="no-alt"
								iconSize={ 14 }
								onClick={ dismissWpcomNuxTour }
							></Button>
						</Flex>
					</div>
					<CardMedia>
						<img
							alt="Editor Welcome Tour"
							src="https://nuxtourtest.files.wordpress.com/2020/11/mock-slide-1.jpg?resize=400px"
						/>
					</CardMedia>
					<CardBody>
						<h2 className="welcome-tour-card__card-heading">Welcome to WordPress</h2>
						<p>Learn the basic editor tools so you can edit and build your dream website.</p>
					</CardBody>
					<CardFooter>
						<div>• • • • • •</div>
						<div>
							<Button isTertiary={ true }>No thanks</Button>
							<Button isPrimary={ true } className="welcome-tour-card__next-btn">
								Let's start
							</Button>
						</div>
					</CardFooter>
				</Card>
			) : (
				<div className="wpcom-editor-welcome-tour__minimized-container">
					<Button
						onClick={ () => setIsMinimized( false ) }
						className="wpcom-editor-welcome-tour__resume-btn"
					>
						<p className="wpcom-editor-welcome-tour__resume-btn-text"> Click to resume tutorial</p>
						<Icon icon={ chevronUp } size={ 16 } />
						{ /* expand icon is throwing an error <Icon icon={ expand } size={ 16 } /> */ }
					</Button>
				</div>
			) }
		</div>
	);
}

export default LaunchWpcomNuxTour;

// TODO rename to nuxtour?
registerPlugin( 'wpcom-block-editor-nux', {
	render: () => <LaunchWpcomNuxTour />,
} );
