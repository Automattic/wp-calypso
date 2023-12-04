// import { sprintf, __ } from '@wordpress/i18n';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import Star from './star';

const RatingSummary = ( { className, onClick, href, rating, reviews } ) => {
	const translate = useTranslate();
	const Tag = href ? 'a' : 'div';
	// normally <Star /> component assumes there are 5 stars
	// here we have just one star so we need to divide rating by 5
	const starRating = ( rating || 0 ) / 5;
	const ratingToShow = Number( ( rating || 0 ).toFixed( 1 ) );
	return (
		<Tag
			className={ classnames( 'wccom-rating-summary', className ) }
			href={ href }
			onClick={ onClick }
		>
			<span className="screen-reader-text">
				{ translate( 'Rated %(ratingToShow) out of 5 stars', { args: { ratingToShow } } ) }
			</span>
			<Star
				className="wccom-rating-summary__star"
				rating={ starRating }
				hoverRating={ starRating }
				index={ 1 }
				ariaHidden="true"
			/>
			<span className="wccom-rating-summary__rating" aria-hidden="true">
				{ ratingToShow }
			</span>
			<span className="wccom-rating-summary__review-count" aria-hidden="true">
				({ reviews })
			</span>
		</Tag>
	);
};

export default RatingSummary;
