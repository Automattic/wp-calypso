import { useTranslate } from 'i18n-calypso';
import { forwardRef, useState, useEffect } from 'react';
import Rating from 'calypso/components/rating';
import Star from './star';
import './reviews-ratings-stars.scss';

export const MAX_RATING = 5;

const ReviewsRatingsStars = forwardRef( ( props, ref ) => {
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

	const [ ratingState, setRatingState ] = useState( rating );
	const [ hoverRating, setHoverRating ] = useState( rating );

	const onStarMouseEnter = ( index ) => setHoverRating( index );
	const onStarMouseLeave = () => setHoverRating( ratingState );
	const onSaveRating = ( e, index ) => {
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
		numberOfReviewsText = translate( '%(numberOfReviews) review', '%(numberOfReviews) reviews', {
			count: numberOfReviews,
			args: { numberOfReviews },
		} );
	}

	function getStarsNumberSign( numberOfStars ) {
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
				<div ref={ ref }>
					<Rating rating={ ratingNormalized } />
				</div>
			) : (
				<>
					{ averageRating && (
						<div className="reviews-ratings-stars__average">
							<span className="screen-reader-text">{ translate( 'Average rating ' ) }</span>
							{ averageRating }
						</div>
					) }
					<div className="reviews-ratings-stars__stars" aria-hidden="false">
						{ Array( MAX_RATING )
							.fill( null )
							.map( ( _, index ) => {
								const value = index + 1;
								const ratingStarsScreenReaderText = translate(
									'Rate product %(value) star',
									'Rate product %(value) stars',
									{ value, args: { value } }
								);

								const starProps = {
									rating: ratingState,
									index: value,
									key: value,
									hoverRating,
									onMouseEnter: onStarMouseEnter,
									onMouseLeave: onStarMouseLeave,
									onClick: onSaveRating,
									className: 'reviews-ratings-stars__star',
									isInteractive: true,
									tabIndex: 0,
									ariaLabel: ratingStarsScreenReaderText,
								};

								if ( 1 === value ) {
									starProps.ref = ref;
								}

								return <Star key={ index } { ...starProps } />;
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
			{ children && children }
		</div>
	);
} );

export default ReviewsRatingsStars;
