/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button, Card, CardBody, CardFooter, CardMedia, Flex } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import classNames from 'classnames';
/**
 * Internal Dependencies
 */
import minimize from './icons/minimize';
import thumbsDown from './icons/thumbs_down';
import thumbsUp from './icons/thumbs_up';
import PaginationControl from './pagination';

import './style-tour.scss';

// eslint-disable-next-line react-hooks/exhaustive-deps
const useEffectOnlyOnce = ( func ) => useEffect( func, [] );

function WelcomeTourCard( {
	cardContent,
	currentCardIndex,
	justMaximized,
	lastCardIndex,
	onMinimize,
	onDismiss,
	setJustMaximized,
	setCurrentCardIndex,
	onNextCardProgression,
	onPreviousCardProgression,
	isGutenboarding,
	focusedOnLaunchRef,
} ) {
	const { description, heading, imgSrc } = cardContent;
	const isLastCard = currentCardIndex === lastCardIndex;

	// Ensure tracking is recorded once per slide view
	useEffectOnlyOnce( () => {
		// Don't track slide view if returning from minimized state
		if ( justMaximized ) {
			setJustMaximized( false );
			return;
		}

		recordTracksEvent( 'calypso_editor_wpcom_tour_slide_view', {
			slide_number: currentCardIndex + 1,
			is_last_slide: isLastCard,
			slide_heading: heading,
			is_gutenboarding: isGutenboarding,
		} );
	} );

	return (
		<Card className="welcome-tour-card" isElevated>
			<CardMedia>
				<img alt={ __( 'Editor Welcome Tour', 'full-site-editing' ) } src={ imgSrc } />
				<CardOverlayControls onDismiss={ onDismiss } onMinimize={ onMinimize } />
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
							{ __( 'Restart tour', 'full-site-editing' ) }
						</Button>
					) : null }
				</p>
			</CardBody>
			<CardFooter>
				{ isLastCard ? (
					<TourRating isGutenboarding={ isGutenboarding }></TourRating>
				) : (
					<CardNavigation
						currentCardIndex={ currentCardIndex }
						lastCardIndex={ lastCardIndex }
						onDismiss={ onDismiss }
						setCurrentCardIndex={ setCurrentCardIndex }
						onNextCardProgression={ onNextCardProgression }
						onPreviousCardProgression={ onPreviousCardProgression }
						focusedOnLaunchRef={ focusedOnLaunchRef }
					></CardNavigation>
				) }
			</CardFooter>
		</Card>
	);
}

function CardNavigation( {
	currentCardIndex,
	lastCardIndex,
	onDismiss,
	setCurrentCardIndex,
	onNextCardProgression,
	onPreviousCardProgression,
	focusedOnLaunchRef,
} ) {
	// These are defined on their own lines because of a minification issue.
	// __('translations') do not always work correctly when used inside of ternary statements.
	const startTourLabel = __( 'Try it out!', 'full-site-editing' );
	const nextLabel = __( 'Next', 'full-site-editing' );

	return (
		<>
			<PaginationControl
				currentPage={ currentCardIndex }
				numberOfPages={ lastCardIndex + 1 }
				setCurrentPage={ setCurrentCardIndex }
			/>
			<div>
				{ currentCardIndex === 0 ? (
					<Button isTertiary={ true } onClick={ onDismiss( 'no-thanks-btn' ) }>
						{ __( 'Skip', 'full-site-editing' ) }
					</Button>
				) : (
					<Button isTertiary={ true } onClick={ onPreviousCardProgression }>
						{ __( 'Back', 'full-site-editing' ) }
					</Button>
				) }

				<Button
					className="welcome-tour-card__next-btn"
					isPrimary={ true }
					onClick={ onNextCardProgression }
					ref={ focusedOnLaunchRef }
				>
					{ currentCardIndex === 0 ? startTourLabel : nextLabel }
				</Button>
			</div>
		</>
	);
}

function CardOverlayControls( { onMinimize, onDismiss } ) {
	const buttonClasses = classNames( 'welcome-tour-card__overlay-controls' );

	return (
		<div className={ buttonClasses }>
			<Flex>
				<Button
					label={ __( 'Minimize Tour', 'full-site-editing' ) }
					isPrimary
					className="welcome-tour-card__minimize-icon"
					icon={ minimize }
					iconSize={ 24 }
					onClick={ onMinimize }
				></Button>
				<Button
					label={ __( 'Close Tour', 'full-site-editing' ) }
					isPrimary
					icon={ close }
					iconSize={ 24 }
					onClick={ onDismiss( 'close-btn' ) }
				></Button>
			</Flex>
		</div>
	);
}

function TourRating( { isGutenboarding } ) {
	let isDisabled = false;
	const tourRating = useSelect( ( select ) =>
		select( 'automattic/wpcom-welcome-guide' ).getTourRating()
	);
	const { setTourRating } = useDispatch( 'automattic/wpcom-welcome-guide' );

	if ( ! isDisabled && tourRating ) {
		isDisabled = true;
	}
	const rateTour = ( isThumbsUp ) => {
		if ( isDisabled ) {
			return;
		}
		isDisabled = true;
		setTourRating( isThumbsUp ? 'thumbs-up' : 'thumbs-down' );
		recordTracksEvent( 'calypso_editor_wpcom_tour_rate', {
			thumbs_up: isThumbsUp,
			is_gutenboarding: isGutenboarding,
		} );
	};

	return (
		<>
			<p className="welcome-tour__end-text">
				{ __( 'Did you find this guide helpful?', 'full-site-editing' ) }
			</p>
			<div>
				<Button
					aria-label={ __( 'Rate thumbs up', 'full-site-editing' ) }
					className={ classNames( 'welcome-tour__end-icon', {
						active: tourRating === 'thumbs-up',
					} ) }
					disabled={ isDisabled }
					icon={ thumbsUp }
					onClick={ () => rateTour( true ) }
					iconSize={ 24 }
				/>
				<Button
					aria-label={ __( 'Rate thumbs down', 'full-site-editing' ) }
					className={ classNames( 'welcome-tour__end-icon', {
						active: tourRating === 'thumbs-down',
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
