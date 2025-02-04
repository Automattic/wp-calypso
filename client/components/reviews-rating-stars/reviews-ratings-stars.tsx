import { useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import Rating from 'calypso/components/rating';
import Star, { type StarProps } from './star';
import './reviews-ratings-stars.scss';

export const MAX_RATING = 5;

type ReviewsRatingsStarsProps = {
	rating: number;
	averageRating?: number;
	numberOfReviews?: number;
	size?: 'medium' | 'medium-small' | 'medium-large';
	showSelectedRating?: boolean;
	children?: React.ReactNode;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
	onSelectRating?: ( index: number ) => void;
	simpleView?: boolean;
};

const ReviewsRatingsStars = ( props: ReviewsRatingsStarsProps ) => {
	const {
		rating,
		averageRating,
		numberOfReviews,
		size = 'medium',
		showSelectedRating = false,
		children,
		onMouseEnter,
		onMouseLeave,
		onSelectRating,
		simpleView,
	} = props;

	const translate = useTranslate();

	const [ ratingState, setRatingState ] = useState< number >( rating );
	const [ hoverRating, setHoverRating ] = useState( rating );

	const onStarMouseEnter = ( index: number ) => setHoverRating( index );
	const onStarMouseLeave = () => setHoverRating( ratingState );
	const onSaveRating = ( _: unknown, index: number ) => {
		setRatingState( index );
		if ( onSelectRating ) {
			onSelectRating( index );
		}
	};

	useEffect( () => {
		setRatingState( rating );
		setHoverRating( rating );
	}, [ rating ] );

	const classNames = [ 'reviews-ratings-stars__star-bar' ];

	switch ( size ) {
		case 'medium-small':
			classNames.push( 'reviews-ratings-stars__star-bar--medium-small' );
			break;
		case 'medium-large':
			classNames.push( 'reviews-ratings-stars__star-bar--medium-large' );
			break;
	}

	// Show numberOfReviews if the prop was passed
	let numberOfReviewsText;
	if ( numberOfReviews ) {
		numberOfReviewsText = translate( '%(numberOfReviews)d review', '%(numberOfReviews)d reviews', {
			count: numberOfReviews,
			args: { numberOfReviews },
		} );
	}

	function getStarsNumberSign( numberOfStars: number ) {
		return translate( '%(numberToAdd)d star', '%(numberToAdd)d stars', {
			count: numberOfStars,
			args: { numberToAdd: numberOfStars },
		} );
	}

	// Show currently selected rating if we're not showing rating count
	let selectedRatingText;
	if ( ratingState && ! numberOfReviews && showSelectedRating ) {
		selectedRatingText = getStarsNumberSign( ratingState );
	}

	const ratingNormalized = ( rating * 100 ) / 20;

	return (
		<div
			className={ classNames.join( ' ' ) }
			onMouseEnter={ onMouseEnter }
			onMouseLeave={ onMouseLeave }
		>
			{ simpleView ? (
				<Rating rating={ ratingNormalized } />
			) : (
				<>
					{ averageRating && (
						<div className="reviews-ratings-stars__average">
							<span className="screen-reader-text">{ translate( 'Average rating' ) }</span>
							{ averageRating }
						</div>
					) }
					<div className="reviews-ratings-stars__stars" aria-hidden="false">
						{ Array( MAX_RATING )
							.fill( null )
							.map( ( _, index ) => {
								const starValue = index + 1;
								const ratingStarsScreenReaderText = translate(
									'Rate product %(value)d star',
									'Rate product %(value)d stars',
									{ count: starValue, args: { value: starValue } }
								);

								const starProps: StarProps = {
									rating: ratingState,
									index: starValue,
									hoverRating,
									onMouseEnter: onStarMouseEnter,
									onMouseLeave: onStarMouseLeave,
									onClick: onSaveRating,
									className: 'reviews-ratings-stars__star',
									isInteractive: true,
									tabIndex: 0,
									ariaLabel: ratingStarsScreenReaderText as string,
								};

								return <Star { ...starProps } key={ starValue } />;
							} ) }
					</div>
					{ numberOfReviewsText && (
						<div className="reviews-ratings-stars__rating-count">{ numberOfReviewsText }</div>
					) }
					{ selectedRatingText && (
						<div className="reviews-ratings-stars__selected-rating">{ selectedRatingText }</div>
					) }
				</>
			) }
			{ children }
		</div>
	);
};

export default ReviewsRatingsStars;
