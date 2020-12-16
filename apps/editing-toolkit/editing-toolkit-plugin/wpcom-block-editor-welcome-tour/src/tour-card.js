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
import { useEffect } from '@wordpress/element';
import { recordTracksEvent } from '@automattic/calypso-analytics';

// eslint-disable-next-line react-hooks/exhaustive-deps
const useEffectOnlyOnce = ( func ) => useEffect( func, [] );

function WelcomeTourCard( {
	cardContent,
	cardIndex,
	justMaximized,
	lastCardIndex,
	onMinimize,
	onDismiss,
	setJustMaximized,
	setCurrentCard,
} ) {
	const { description, heading, imgSrc } = cardContent;
	const isLastCard = cardIndex === lastCardIndex;

	// Ensure tracking is recorded once per slide view
	useEffectOnlyOnce( () => {
		// Don't track slide view if returning from minimized state
		if ( justMaximized ) {
			setJustMaximized( false );
			return;
		}
		recordTracksEvent( 'calypso_editor_wpcom_tour_slide_view', {
			slide_number: cardIndex + 1,
			is_last_slide: isLastCard,
			slide_heading: heading,
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
		} );
	} );

	return (
		<Card className="welcome-tour-card" isElevated>
			<CardOverlayControls
				setJustMaximized={ setJustMaximized }
				onDismiss={ onDismiss }
				onMinimize={ onMinimize }
				slideNumber={ cardIndex + 1 }
			/>
			<CardMedia>
				<img alt="Editor Welcome Tour" src={ imgSrc } />
			</CardMedia>
			<CardBody>
				<h2 className="welcome-tour-card__heading">{ heading }</h2>
				<p className="welcome-tour-card__description">
					{ description }
					{ isLastCard ? (
						<Button
							className="welcome-tour-card__description"
							isTertiary
							onClick={ () => setCurrentCard( 0 ) }
						>
							Restart tour
						</Button>
					) : null }
				</p>
			</CardBody>
			<CardFooter>
				<CardNavigation
					cardIndex={ cardIndex }
					lastCardIndex={ lastCardIndex }
					onDismiss={ onDismiss }
					setCurrentCard={ setCurrentCard }
				></CardNavigation>
			</CardFooter>
		</Card>
	);
}

function CardNavigation( { cardIndex, lastCardIndex, onDismiss, setCurrentCard } ) {
	return (
		<>
			<PaginationControl
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
		</>
	);
}

function CardOverlayControls( { onMinimize, onDismiss, slideNumber } ) {
	const handleOnMinimize = () => {
		onMinimize( true );
		recordTracksEvent( 'calypso_editor_wpcom_tour_minimize', {
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
			slide_number: slideNumber,
		} );
	};

	return (
		<div className="welcome-tour-card__overlay-controls">
			<Flex>
				<Button
					isPrimary
					className="welcome-tour-card__minimize-icon"
					icon={ minimize }
					iconSize={ 24 }
					onClick={ handleOnMinimize }
				></Button>
				<Button isPrimary icon={ close } iconSize={ 24 } onClick={ () => onDismiss() }></Button>
			</Flex>
		</div>
	);
}

export default WelcomeTourCard;
