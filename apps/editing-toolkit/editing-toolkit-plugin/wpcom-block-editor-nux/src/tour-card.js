/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * Internal dependencies
 */
import './style-tour.scss';
import PaginationControl from './pagination';
import minimize from './icons/minimize';

/**
 * External dependencies
 */
import { Button, Card, CardBody, CardFooter, CardMedia, Flex } from '@wordpress/components';
import { close } from '@wordpress/icons';

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
		<Card className="welcome-tour-card" isElevated>
			<CardOverlayControls onDismiss={ onDismiss } onMinimize={ onMinimize } />
			<CardMedia>
				<img alt="Editor Welcome Tour" src={ imgSrc } />
			</CardMedia>
			<CardBody>
				<h2 className="welcome-tour-card__heading">{ heading }</h2>
				<p className="welcome-tour-card__description">{ description }</p>
				{ /* TODO: add conditional "Restart tour" functionality for last slide" */ }
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
						<Button isTertiary={ true } onClick={ () => setCurrentCard( cardIndex - 1 ) }>
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
						<Button
							className="welcome-tour-card__next-btn"
							isPrimary={ true }
							onClick={ () => onDismiss() }
						>
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
				<Button
					isPrimary
					icon={ minimize }
					iconSize={ 24 }
					onClick={ () => onMinimize( true ) }
				></Button>
				<Button isPrimary icon={ close } iconSize={ 24 } onClick={ () => onDismiss() }></Button>
			</Flex>
		</div>
	);
}

export default WelcomeTourCard;
