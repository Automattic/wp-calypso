import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import Rating from 'calypso/components/rating';
import {
	useMarketplaceReviewsQuery,
	type ProductProps,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { ReviewsModal } from 'calypso/my-sites/marketplace/components/reviews-modal';
import './styles.scss';

type Props = ProductProps & {
	productName: string;
};

export const ReviewsSummary = ( { slug, productName, productType }: Props ) => {
	const translate = useTranslate();
	const [ isVisible, setIsVisible ] = useState( false );

	const { data: marketplaceReviews } = useMarketplaceReviewsQuery( {
		productType,
		slug,
	} );
	// TODO: The averageRating will come from the server. Calculating it here temporarily.
	let averageRating = null;
	let numberOfReviews = null;
	if (
		isEnabled( 'marketplace-reviews-show' ) &&
		marketplaceReviews &&
		! ( 'message' in marketplaceReviews ) &&
		marketplaceReviews.length > 0
	) {
		const totalReviews = marketplaceReviews.reduce(
			( acc, review ) => acc + review.meta.wpcom_marketplace_rating,
			0
		);

		numberOfReviews = marketplaceReviews.length;

		averageRating = totalReviews / numberOfReviews;
		averageRating = ( averageRating * 100 ) / 5; // Normalize to 100
	}

	return (
		<>
			<ReviewsModal
				isVisible={ isVisible }
				onClose={ () => setIsVisible( false ) }
				slug={ slug }
				productName={ productName }
				productType={ productType }
				buttons={ [] }
			/>
			<div className="reviews-summary__container">
				<div>
					{ averageRating && <Rating rating={ averageRating } /> }
					{ numberOfReviews && (
						<Button borderless className="reviews-summary__number-reviews-link is-link">
							{ translate( '%(numberOfReviews)d review', '%(numberOfReviews)d reviews', {
								count: numberOfReviews,
								args: {
									numberOfReviews,
								},
							} ) }
						</Button>
					) }
				</div>
				<Button onClick={ () => setIsVisible( true ) }>{ translate( 'Add Review' ) }</Button>
			</div>
		</>
	);
};
