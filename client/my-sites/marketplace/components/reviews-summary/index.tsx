import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { type ReactNode, useEffect, useState } from 'react';
import Rating from 'calypso/components/rating';
import {
	useMarketplaceReviewsStatsQuery,
	useIsUserAllowedToReview,
	type ProductProps,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { ReviewModal } from 'calypso/my-sites/marketplace/components/review-modal';

import './styles.scss';

type Props = ProductProps & {
	productName: string;
};

const TrackedButton = ( { onClick, children }: { onClick: () => void; children: ReactNode } ) => {
	// useEffect used to avoid calling recordTracksEvent on every render
	useEffect( () => {
		recordTracksEvent( 'calypso_marketplace_reviews_add_button_displayed' );
	}, [] );
	return <Button onClick={ onClick }>{ children }</Button>;
};

export const ReviewsSummary = ( { slug, productName, productType }: Props ) => {
	const translate = useTranslate();
	const [ isVisible, setIsVisible ] = useState( false );

	const { data: marketplaceReviewsStats } = useMarketplaceReviewsStatsQuery( {
		productType,
		slug,
	} );

	const { data: userCanPublishReviews } = useIsUserAllowedToReview( { productType, slug } );

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

	const handleAddReviewClick = () => {
		recordTracksEvent( 'calypso_marketplace_reviews_add_button_click', {
			product_type: productType,
			slug,
		} );
		setIsVisible( true );
	};

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
				{ numberOfReviews !== null && numberOfReviews >= 3 && (
					<div>
						{ averageRating !== null && <Rating rating={ averageRating } /> }
						<Button borderless className="reviews-summary__number-reviews-link is-link">
							{ translate( '%(numberOfReviews)d review', '%(numberOfReviews)d reviews', {
								count: numberOfReviews,
								args: {
									numberOfReviews,
								},
							} ) }
						</Button>
					</div>
				) }
				{ userCanPublishReviews && (
					<TrackedButton onClick={ handleAddReviewClick }>
						{ translate( 'Add Review' ) }
					</TrackedButton>
				) }
			</div>
		</>
	);
};
