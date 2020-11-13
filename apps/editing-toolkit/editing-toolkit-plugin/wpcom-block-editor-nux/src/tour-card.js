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

// import { useEffect, useState } from '@wordpress/element';

function WelcomeTourCard( { onMinimize, onDismiss } ) {
	console.log( 'WelcomeTourCard' );
	return (
		<Card className="welcome-tour-card">
			<div className="welcome-tour-card__overlay-controls">
				<Flex>
					<Button
						isPrimary
						icon="pets"
						iconSize={ 14 }
						onClick={ () => onMinimize( true ) }
					></Button>
					<Button isPrimary icon="no-alt" iconSize={ 14 } onClick={ () => onDismiss() }></Button>
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
	);
}

export default WelcomeTourCard;
