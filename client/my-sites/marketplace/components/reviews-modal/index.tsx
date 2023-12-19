import { Dialog, Button } from '@automattic/components';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Rating from 'calypso/components/rating';
import {
	ProductProps,
	useMarketplaceReviewsQuery,
	useMarketplaceReviewsStatsQuery,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { MarketplaceReviewsList } from 'calypso/my-sites/marketplace/components/reviews-list';
import './styles.scss';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { canPublishProductReviews } from 'calypso/state/marketplace/selectors';
import { AppState } from 'calypso/types';

type Props = {
	isVisible: boolean;
	onClose: () => void;
	productName: string;
	variations?: [];
} & ProductProps;

export const ReviewsModal = ( props: Props ) => {
	const translate = useTranslate();
	const { isVisible, onClose, productName, productType, slug } = props;
	const currentUser = useSelector( getCurrentUser );

	const { data: userReviews } = useMarketplaceReviewsQuery( {
		productType,
		slug,
		perPage: 1,
		author: currentUser?.ID ?? undefined,
	} );
	const { data: reviewsStats } = useMarketplaceReviewsStatsQuery( {
		productType,
		slug,
	} );

	const userHasReviewed = !! userReviews?.length;
	const canPublishReview = useSelector( ( state: AppState ) =>
		canPublishProductReviews( state, productType, slug, props.variations )
	);
	const askForReview = canPublishReview && ! userHasReviewed;

	const { ratings_average: averageRating, ratings_count: numberOfReviews } = reviewsStats || {};
	const normalizedRating = ( ( averageRating ?? 0 ) * 100 ) / 5; // Normalize to 100

	return (
		<Dialog
			className="marketplace-reviews-modal"
			isVisible={ isVisible }
			onClose={ onClose }
			showCloseIcon
		>
			<div className="marketplace-reviews-modal__header">
				<div className="marketplace-reviews-modal__title">{ productName }</div>
			</div>

			<div className="marketplace-reviews-modal__content">
				{ averageRating !== undefined && numberOfReviews !== undefined && (
					<div className="marketplace-reviews-modal__summary">
						<div className="marketplace-reviews-modal__stats">
							<div className="marketplace-reviews-modal__ratings-average">
								{ averageRating.toLocaleString( getLocaleSlug() ?? 'default', {
									minimumFractionDigits: 1,
									maximumFractionDigits: 1,
								} ) }
							</div>
							<div className="marketplace-reviews-modal__ratings">
								<Rating rating={ normalizedRating } />
								<div className="marketplace-reviews-modal__ratings-count">
									{ numberOfReviews > 0 &&
										translate( '%(numberOfReviews)d review', '%(numberOfReviews)d reviews', {
											count: numberOfReviews,
											args: {
												numberOfReviews,
											},
										} ) }
									{ numberOfReviews === 0 && translate( 'No reviews' ) }
								</div>
							</div>
						</div>
						{ askForReview && (
							<div className="marketplace-reviews-modal__leave-review">
								<Button primary onClick={ () => alert( 'Not implemented yet' ) }>
									{ translate( 'Leave my review' ) }
								</Button>
							</div>
						) }
					</div>
				) }

				{ /* TODO: Add the review creation section */ }

				<div className="marketplace-reviews-modal__reviews-list">
					<MarketplaceReviewsList productType={ productType } slug={ slug } />
				</div>
			</div>
		</Dialog>
	);
};
