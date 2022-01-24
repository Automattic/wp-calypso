/**
 * External Dependencies
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { PaginationControl } from '@automattic/components';
import { getMediaQueryList, isMobile, MOBILE_BREAKPOINT } from '@automattic/viewport';
import { Button, Card, CardBody, CardFooter, CardMedia, Flex } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import classNames from 'classnames';
/**
 * Internal Dependencies
 */
import minimize from './icons/minimize';
import thumbsDown from './icons/thumbs_down';
import thumbsUp from './icons/thumbs_up';

import './style-tour.scss';

function WelcomeTourCard( {
	cardContent,
	currentStepIndex,
	lastStepIndex,
	onMinimize,
	onDismiss,
	setCurrentStepIndex,
	onNextStepProgression,
	onPreviousStepProgression,
	isGutenboarding,
	setInitialFocusedElement,
} ) {
	const { descriptions, heading, imgSrc } = cardContent;
	const isLastStep = currentStepIndex === lastStepIndex;

	const description = descriptions[ isMobile() ? 'mobile' : 'desktop' ] ?? descriptions.desktop;

	return (
		<Card className="welcome-tour-card" isElevated>
			<CardOverlayControls onDismiss={ onDismiss } onMinimize={ onMinimize } />
			{ /* TODO: Update selector for images in @wordpress/components/src/card/styles/card-styles.js */ }
			<CardMedia className={ 'welcome-tour-card__media' }>
				<picture>
					{ imgSrc.mobile && (
						<source
							srcSet={ imgSrc.mobile.src }
							type={ imgSrc.mobile.type }
							media={ getMediaQueryList( MOBILE_BREAKPOINT )?.media }
						/>
					) }
					<img
						alt={ __( 'Editor Welcome Tour', 'full-site-editing' ) }
						src={ imgSrc.desktop?.src }
					/>
				</picture>
			</CardMedia>
			<CardBody>
				<h2 className="welcome-tour-card__heading">{ heading }</h2>
				<p className="welcome-tour-card__description">
					{ description }
					{ isLastStep ? (
						<Button
							className="welcome-tour-card__description"
							isTertiary
							onClick={ () => setCurrentStepIndex( 0 ) }
							ref={ setInitialFocusedElement }
						>
							{ __( 'Restart tour', 'full-site-editing' ) }
						</Button>
					) : null }
				</p>
			</CardBody>
			<CardFooter>
				{ isLastStep ? (
					<TourRating isGutenboarding={ isGutenboarding }></TourRating>
				) : (
					<CardNavigation
						currentStepIndex={ currentStepIndex }
						lastStepIndex={ lastStepIndex }
						onDismiss={ onDismiss }
						setCurrentStepIndex={ setCurrentStepIndex }
						onNextStepProgression={ onNextStepProgression }
						onPreviousStepProgression={ onPreviousStepProgression }
						setInitialFocusedElement={ setInitialFocusedElement }
					></CardNavigation>
				) }
			</CardFooter>
		</Card>
	);
}

function CardNavigation( {
	currentStepIndex,
	lastStepIndex,
	onDismiss,
	setCurrentStepIndex,
	onNextStepProgression,
	onPreviousStepProgression,
	setInitialFocusedElement,
} ) {
	// These are defined on their own lines because of a minification issue.
	// __('translations') do not always work correctly when used inside of ternary statements.
	const startTourLabel = __( 'Try it out!', 'full-site-editing' );
	const nextLabel = __( 'Next', 'full-site-editing' );

	return (
		<>
			<PaginationControl
				currentPage={ currentStepIndex }
				numberOfPages={ lastStepIndex + 1 }
				setCurrentPage={ setCurrentStepIndex }
				classes={ [ 'my-custom', 'pagination-classes' ] }
			/>
			<div>
				{ currentStepIndex === 0 ? (
					<Button isTertiary={ true } onClick={ onDismiss( 'no-thanks-btn' ) }>
						{ __( 'Skip', 'full-site-editing' ) }
					</Button>
				) : (
					<Button isTertiary={ true } onClick={ onPreviousStepProgression }>
						{ __( 'Back', 'full-site-editing' ) }
					</Button>
				) }

				<Button
					className="welcome-tour-card__next-btn"
					isPrimary={ true }
					onClick={ onNextStepProgression }
					ref={ setInitialFocusedElement }
				>
					{ currentStepIndex === 0 ? startTourLabel : nextLabel }
				</Button>
			</div>
		</>
	);
}

function CardOverlayControls( { onMinimize, onDismiss } ) {
	return (
		<div className="welcome-tour-card__overlay-controls">
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
