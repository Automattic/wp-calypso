/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * Internal dependencies
 */
import './style-tour.scss';
import PaginationControl from './pagination';

/**
 * External dependencies
 */
import { Button, Card, CardBody, CardFooter, CardMedia, Flex } from '@wordpress/components';

// import { useEffect, useState } from '@wordpress/element';

function WelcomeTourCard( {
	cardContent,
	cardIndex,
	lastCardIndex,
	onMinimize,
	onDismiss,
	setCurrentCard,
} ) {
	const { description, heading, imgSrc } = cardContent;

	return (
		<Card className="welcome-tour-card">
			<CardOverlayControls onDismiss={ onDismiss } onMinimize={ onMinimize } />
			<CardMedia>
				<img alt="Editor Welcome Tour" src={ imgSrc } />
			</CardMedia>
			<CardBody>
				<h2 className="welcome-tour-card__card-heading">{ heading }</h2>
				<p>{ description }</p>
			</CardBody>
			<CardFooter>
				<PaginationControl
					className=""
					currentPage={ cardIndex }
					numberOfPages={ lastCardIndex + 1 }
					setCurrentPage={ setCurrentCard }
				/>
				<div>
					{ cardIndex === 0 ? (
						<Button isTertiary={ true } onClick={ () => onDismiss() }>
							No thanks
						</Button>
					) : (
						<Button
							className="welcome-tour-card__next-btn"
							isTertiary={ true }
							onClick={ () => setCurrentCard( cardIndex - 1 ) }
						>
							Back
						</Button>
					) }
					{ cardIndex < lastCardIndex ? (
						<Button
							className="welcome-tour-card__next-btn"
							isPrimary={ true }
							onClick={ () => setCurrentCard( cardIndex + 1 ) }
						>
							{ cardIndex === 0 ? "Let's start" : 'Next' }
						</Button>
					) : (
						<Button isPrimary={ true } onClick={ () => onDismiss() }>
							Done
						</Button>
					) }
				</div>
			</CardFooter>
		</Card>
	);
}

function CardOverlayControls( { onMinimize, onDismiss } ) {
	return (
		<div className="welcome-tour-card__overlay-controls">
			<Flex>
				<Button isPrimary icon="pets" iconSize={ 14 } onClick={ () => onMinimize( true ) }></Button>
				<Button isPrimary icon="no-alt" iconSize={ 14 } onClick={ () => onDismiss() }></Button>
			</Flex>
		</div>
	);
}

export default WelcomeTourCard;
