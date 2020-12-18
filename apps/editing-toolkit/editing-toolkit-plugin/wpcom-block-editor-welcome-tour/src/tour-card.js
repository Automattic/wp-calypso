/*** THIS MUST BE THE FIRST THING EVALUATED IN THIS SCRIPT *****/
import './public-path';

/**
 * Internal dependencies
 */
import './style-tour.scss';
import PaginationControl from './pagination';
import minimize from './icons/minimize';
import thumbsUp from './icons/thumbs_up';
import thumbsDown from './icons/thumbs_down';

/**
 * External dependencies
 */
import classNames from 'classnames';
import { Button, Card, CardBody, CardFooter, CardMedia, Flex } from '@wordpress/components';
import { close } from '@wordpress/icons';
import { useEffect, useState } from '@wordpress/element';
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
	setCurrentCardIndex,
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
							onClick={ () => setCurrentCardIndex( 0 ) }
						>
							Restart tour
						</Button>
					) : null }
				</p>
			</CardBody>
			<CardFooter>
				{ isLastCard ? (
					<LastCardThumbsUpDown></LastCardThumbsUpDown>
				) : (
					<CardNavigation
						cardIndex={ cardIndex }
						lastCardIndex={ lastCardIndex }
						onDismiss={ onDismiss }
						setCurrentCardIndex={ setCurrentCardIndex }
					></CardNavigation>
				) }
			</CardFooter>
		</Card>
	);
}

function CardNavigation( { cardIndex, lastCardIndex, onDismiss, setCurrentCardIndex } ) {
	return (
		<>
			<PaginationControl
				currentPage={ cardIndex }
				numberOfPages={ lastCardIndex + 1 }
				setCurrentPage={ setCurrentCardIndex }
			/>
			<div>
				{ cardIndex === 0 ? (
					<Button isTertiary={ true } onClick={ () => onDismiss() }>
						No thanks
					</Button>
				) : (
					<Button isTertiary={ true } onClick={ () => setCurrentCardIndex( cardIndex - 1 ) }>
						Back
					</Button>
				) }
				{ cardIndex < lastCardIndex ? (
					<Button
						className="welcome-tour-card__next-btn"
						isPrimary={ true }
						onClick={ () => setCurrentCardIndex( cardIndex + 1 ) }
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

function LastCardThumbsUpDown() {
	const [ isDisabled, setIsDisabled ] = useState( false );
	const [ selected, setSelected ] = useState( 'none' );

	const rateTour = ( isThumbsUp ) => {
		if ( isDisabled ) {
			return;
		}
		setIsDisabled( true );
		setSelected( isThumbsUp === true ? 'thumbs-up' : 'thumbs-down' );
		// Currently the Welcome Tour only shows one time in editor (it is not wired in MoreMenu like NUX), we will want to adjust tracking if the Tour becomes accessible from the MoreMenu
		recordTracksEvent( 'calypso_editor_wpcom_tour_rate', {
			thumbs_up: isThumbsUp,
			is_gutenboarding: window.calypsoifyGutenberg?.isGutenboarding,
		} );
	};

	return (
		<>
			<p className="welcome-tour__end-text">Did you find this guide helpful?</p>
			<div>
				<Button
					className={ classNames( 'welcome-tour__end-icon', {
						active: selected === 'thumbs-up',
					} ) }
					disabled={ isDisabled }
					icon={ thumbsUp }
					onClick={ () => rateTour( true ) }
					iconSize={ 24 }
				/>
				<Button
					className={ classNames( 'welcome-tour__end-icon', {
						active: selected === 'thumbs-down',
					} ) }
					disabled={ isDisabled }
					icon={ thumbsDown }
					onClick={ () => rateTour( false ) }
					iconSize={ 24 }
				/>
			</div>
		</>
	);
}

export default WelcomeTourCard;
