import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Rating from 'calypso/components/rating';
import {
	useMarketplaceReviewsStatsQuery,
	type ProductProps,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { ReviewModal } from 'calypso/my-sites/marketplace/components/review-modal';

import './styles.scss';

type Props = ProductProps & {
	productName: string;
	onReviewsClick: () => void;
};

export const ReviewsSummary = ( { slug, productName, productType, onReviewsClick }: Props ) => {
	const translate = useTranslate();
	const [ isVisible, setIsVisible ] = useState( false );

	const { data: marketplaceReviewsStats } = useMarketplaceReviewsStatsQuery( {
		productType,
		slug,
	} );

	let averageRating = null;
	let numberOfReviews = null;

	if (
		isEnabled( 'marketplace-reviews-show' ) &&
		marketplaceReviewsStats?.ratings_count !== undefined &&
		marketplaceReviewsStats?.ratings_average !== undefined
	) {
		numberOfReviews = marketplaceReviewsStats.ratings_count;
		averageRating = marketplaceReviewsStats.ratings_average;
		// Normalize to 100
		averageRating = ( averageRating * 100 ) / 5;
	}

	return (
		<>
			<ReviewModal
				isVisible={ isVisible }
				onClose={ () => setIsVisible( false ) }
				slug={ slug }
				productName={ productName }
				productType={ productType }
			/>
			<div className="reviews-summary__container">
				{ /* Only show stats if we have a minimum sample size to reduce outliers unfairly impacting the score */ }
				{ numberOfReviews !== null && numberOfReviews >= 3 && (
					<div>
						{ averageRating !== null && <Rating rating={ averageRating } /> }
						<Button
							borderless
							className="reviews-summary__number-reviews-link is-link"
							onClick={ onReviewsClick }
						>
							{ translate( '%(numberOfReviews)d review', '%(numberOfReviews)d reviews', {
								count: numberOfReviews,
								args: {
									numberOfReviews,
								},
							} ) }
						</Button>
					</div>
				) }
			</div>
		</>
	);
};
