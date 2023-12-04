// import { __, _n, translate } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { forwardRef, useState, useEffect } from 'react';
import RatingSummary from './rating-summary';
import Star from './star';
import './reviews-ratings-stars.scss';

export const MAX_RATING = 5;

const ReviewsRatingsStars = forwardRef( ( props, ref ) => {
	const {
		rating,
		averageRating,
		numberOfReviews,
		isInteractive = false,
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

	const onStarMouseEnter = isInteractive ? ( index ) => setHoverRating( index ) : null;
	const onStarMouseLeave = isInteractive ? () => setHoverRating( ratingState ) : null;
	const onSaveRating = isInteractive
		? ( e, index ) => {
				setRatingState( index );
				if ( onSelectRating ) {
					onSelectRating( index );
				}
		  }
		: null;

	useEffect( () => {
		setRatingState( rating );
		setHoverRating( rating );
	}, [ rating ] );

	const classNames = [ 'wccom-ratings__star-bar' ];
	if ( ! isInteractive ) {
		classNames.push( 'wccom-ratings__star-bar--read-only' );
	}

	switch ( size ) {
		case 'medium-small':
			classNames.push( 'wccom-ratings__star-bar--medium-small' );
			break;
		case 'medium-large':
			classNames.push( 'wccom-ratings__star-bar--medium-large' );
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

	return (
		<div
			className={ classNames.join( ' ' ) }
			onMouseEnter={ onMouseEnter }
			onMouseLeave={ onMouseLeave }
		>
			{ simpleView ? (
				<div ref={ ref }>
					<RatingSummary rating={ rating } reviews={ numberOfReviews } shouldShowReviews />
				</div>
			) : (
				<>
					{ averageRating && (
						<div className="wccom-ratings__average">
							<span className="screen-reader-text">{ translate( 'Average rating ' ) }</span>
							{ averageRating }
						</div>
					) }
					<div className="wccom-ratings__stars" aria-hidden={ isInteractive ? 'false' : 'true' }>
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
									className: 'wccom-ratings__star',
									isInteractive,
									tabIndex: isInteractive ? 0 : -1,
									ariaLabel: ratingStarsScreenReaderText,
								};

								if ( 1 === value ) {
									starProps.ref = ref;
								}

								return <Star key={ index } { ...starProps } />;
							} ) }
					</div>
					{ numberOfReviewsText && (
						<div className="wccom-ratings__rating-count">{ numberOfReviewsText }</div>
					) }
					{ selectedRatingText && (
						<div className="wccom-ratings__selected-rating">{ selectedRatingText }</div>
					) }
				</>
			) }
			{ children && children }
		</div>
	);
} );

export default ReviewsRatingsStars;
