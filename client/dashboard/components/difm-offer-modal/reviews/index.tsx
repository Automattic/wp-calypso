import { VisuallyHidden } from '@wordpress/components';
import { useReducedMotion } from '@wordpress/compose';
import { __, sprintf } from '@wordpress/i18n';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Text } from '../../text';
import { DIFM_OFFER_REVIEW_MAX_RATING, getDifmOfferReviews } from './data';
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

function ReviewCard( {
	review,
	isActive,
	onLinkClick,
}: {
	review: DifmOfferReview;
	isActive: boolean;
	onLinkClick?: ( review: DifmOfferReview ) => void;
} ) {
	return (
		<figure
			className={ clsx( 'difm-offer-reviews__card', { 'is-active': isActive } ) }
			aria-hidden={ ! isActive }
			// The hidden cards stay in the DOM for the fade, so keep their links out of the tab order.
			inert={ ! isActive }
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
				<Text
					className="difm-offer-reviews__reviewer"
					variant="muted"
					size={ 11 }
					weight={ 400 }
					lineHeight="16px"
				>
					{ review.reviewer }
				</Text>
				{ review.url ? (
					<a
						className="difm-offer-reviews__link"
						href={ review.url }
						target="_blank"
						rel="noopener noreferrer"
						onClick={ () => onLinkClick?.( review ) }
						aria-label={ sprintf(
							/* translators: %s is the name of the person who wrote the review. */
							__( 'Read the review by %s on Trustpilot (opens in a new tab)' ),
							review.reviewer
						) }
					>
						Trustpilot
					</a>
				) : (
					<Text size={ 12 } lineHeight="16px">
						Trustpilot
					</Text>
				) }
			</figcaption>
		</figure>
	);
}

/**
 * Trustpilot reviews of the DIFM service, one card at a time. The cards fade from one to
 * the next. The rotation stops while the pointer or the focus is on the reviews. It stops
 * for good when the user picks a review with the dots, and it does not start when the user
 * prefers reduced motion. A card with a review URL links to the review on Trustpilot in a
 * new tab, so the modal stays open.
 */
export function DifmOfferReviews( {
	className,
	interval = DEFAULT_INTERVAL,
	onReviewLinkClick,
}: {
	className?: string;
	/** Milliseconds each review shows before the next one. */
	interval?: number;
	/** Called when the user opens a review on Trustpilot. */
	onReviewLinkClick?: ( review: DifmOfferReview ) => void;
} ) {
	const reviews = getDifmOfferReviews();
	const prefersReducedMotion = useReducedMotion();
	const [ activeIndex, setActiveIndex ] = useState( 0 );
	const [ isHovered, setIsHovered ] = useState( false );
	const [ hasFocus, setHasFocus ] = useState( false );
	// A user who picks a review chose what to read, so the rotation must not move it on.
	const [ hasPickedReview, setHasPickedReview ] = useState( false );

	const isRotating = ! prefersReducedMotion && ! hasPickedReview && ! isHovered && ! hasFocus;

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
			onFocus={ () => setHasFocus( true ) }
			onBlur={ ( event ) => {
				// Focus that moves from one dot to the next stays inside the reviews.
				if ( ! event.currentTarget.contains( event.relatedTarget ) ) {
					setHasFocus( false );
				}
			} }
		>
			{ /* Each change is a rotation the user did not ask for, so it is not announced. */ }
			<div
				className="difm-offer-reviews__cards"
				aria-live="off"
				onMouseEnter={ () => setIsHovered( true ) }
				onMouseLeave={ () => setIsHovered( false ) }
			>
				{ reviews.map( ( review, index ) => (
					<ReviewCard
						key={ review.id }
						review={ review }
						isActive={ index === activeIndex }
						onLinkClick={ onReviewLinkClick }
					/>
				) ) }
			</div>
			<div className="difm-offer-reviews__dots">
				{ reviews.map( ( review, index ) => (
					<button
						key={ review.id }
						type="button"
						className={ clsx( 'difm-offer-reviews__dot', {
							'is-active': index === activeIndex,
						} ) }
						aria-label={ sprintf(
							/* translators: %1$d is the number of a review, %2$d is the number of reviews. */
							__( 'Show review %1$d of %2$d' ),
							index + 1,
							reviews.length
						) }
						aria-pressed={ index === activeIndex }
						onClick={ () => {
							setActiveIndex( index );
							setHasPickedReview( true );
						} }
					/>
				) ) }
			</div>
		</section>
	);
}
