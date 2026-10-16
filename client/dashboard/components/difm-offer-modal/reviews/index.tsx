import { Button, VisuallyHidden } from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Text } from '../../text';
import { DIFM_OFFER_REVIEW_MAX_RATING, getDifmOfferReviews } from './data';
import { pauseIcon, playIcon } from './icons';
import type { DifmOfferReview } from './data';

import './style.scss';

// Long enough to read the longest review before the next one fades in.
const DEFAULT_INTERVAL = 8000;

function TrustpilotStar() {
	return (
		<svg
			className="difm-offer-reviews__star"
			viewBox="0 0 36 36"
			aria-hidden="true"
			focusable="false"
		>
			<rect width="36" height="36" rx="1.8" fill="#04da8d" />
			<g transform="translate(5.73 6.61)">
				<path
					d="M26.0597 9.55179H16.1084L13.0347 0L9.95129 9.55179L0 9.5421L8.05901 15.4514L4.97564 24.9935L13.0347 19.0939L21.0841 24.9935L18.0103 15.4514L26.0597 9.55179Z"
					fill="#fff"
				/>
				<path
					d="M18.7004 17.6115L18.0088 15.4512L13.0332 19.0936L18.7004 17.6115Z"
					fill="#04da8d"
				/>
			</g>
		</svg>
	);
}

function ReviewCard( { review, isActive }: { review: DifmOfferReview; isActive: boolean } ) {
	return (
		<figure
			className={ clsx( 'difm-offer-reviews__card', { 'is-active': isActive } ) }
			aria-hidden={ ! isActive }
		>
			<div className="difm-offer-reviews__stars">
				{ Array.from( { length: review.rating }, ( _, index ) => (
					<TrustpilotStar key={ index } />
				) ) }
				<VisuallyHidden>
					{ sprintf(
						/* translators: %1$d is the rating of a review, %2$d is the highest possible rating. */
						__( 'Rated %1$d out of %2$d' ),
						review.rating,
						DIFM_OFFER_REVIEW_MAX_RATING
					) }
				</VisuallyHidden>
			</div>
			<Text
				as="p"
				className="difm-offer-reviews__title"
				size={ 15 }
				weight={ 600 }
				lineHeight="20px"
			>
				{ review.title }
			</Text>
			<blockquote className="difm-offer-reviews__quote">
				<Text as="p" size={ 13 } weight={ 500 } lineHeight="20px">
					{ review.quote }
				</Text>
			</blockquote>
			<figcaption className="difm-offer-reviews__source">
				<Text className="difm-offer-reviews__reviewer" size={ 11 } weight={ 500 }>
					{ review.reviewer }
				</Text>
				<Text size={ 12 }>Trustpilot</Text>
			</figcaption>
		</figure>
	);
}

/**
 * Trustpilot reviews of the DIFM service, one card at a time. The cards fade from one to
 * the next. The rotation stops while the pointer is on the cards and while the user has
 * paused it. It starts paused when the user prefers reduced motion. The cards do not link
 * to Trustpilot, to keep the user in the modal.
 */
export function DifmOfferReviews( {
	className,
	interval = DEFAULT_INTERVAL,
}: {
	className?: string;
	/** Milliseconds each review shows before the next one. */
	interval?: number;
} ) {
	const reviews = getDifmOfferReviews();
	const prefersReducedMotion = useReducedMotion();
	const [ activeIndex, setActiveIndex ] = useState( 0 );
	const [ isHovered, setIsHovered ] = useState( false );
	const [ isPaused, setIsPaused ] = useState( prefersReducedMotion );

	useEffect( () => {
		if ( prefersReducedMotion ) {
			setIsPaused( true );
		}
	}, [ prefersReducedMotion ] );

	const isRotating = ! isPaused && ! isHovered;

	useEffect( () => {
		if ( ! isRotating ) {
			return;
		}
		const timer = window.setInterval( () => {
			setActiveIndex( ( index ) => ( index + 1 ) % reviews.length );
		}, interval );
		return () => window.clearInterval( timer );
	}, [ isRotating, interval, reviews.length ] );

	return (
		<section
			className={ clsx( 'difm-offer-reviews', className ) }
			aria-label={ __( 'Customer reviews' ) }
		>
			{ /* Each change is a rotation the user did not ask for, so it is not announced. */ }
			<div
				className="difm-offer-reviews__cards"
				aria-live="off"
				onMouseEnter={ () => setIsHovered( true ) }
				onMouseLeave={ () => setIsHovered( false ) }
			>
				{ reviews.map( ( review, index ) => (
					<ReviewCard key={ review.id } review={ review } isActive={ index === activeIndex } />
				) ) }
			</div>
			<div className="difm-offer-reviews__controls">
				<Button
					className="difm-offer-reviews__toggle"
					icon={ isPaused ? playIcon : pauseIcon }
					label={ isPaused ? __( 'Play reviews' ) : __( 'Pause reviews' ) }
					size="small"
					onClick={ () => setIsPaused( ! isPaused ) }
				/>
			</div>
		</section>
	);
}
