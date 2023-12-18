import { Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import Rating from 'calypso/components/rating';
import {
	ProductProps,
	useMarketplaceReviewsStatsQuery,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { MarketplaceReviewsList } from 'calypso/my-sites/marketplace/components/reviews-list';
import './styles.scss';

type Props = {
	isVisible: boolean;
	onClose: () => void;
	productName: string;
} & ProductProps;

export const ReviewsModal = ( props: Props ) => {
	const translate = useTranslate();
	const { isVisible, onClose, productName, productType, slug } = props;

	const { data: reviewsStats } = useMarketplaceReviewsStatsQuery( {
		productType,
		slug,
	} );
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
				{ averageRating && numberOfReviews && (
					<div className="marketplace-reviews-modal__stats">
						<div className="marketplace-reviews-modal__ratings-average"> { averageRating }</div>
						<div className="marketplace-reviews-modal__ratings">
							<Rating rating={ normalizedRating } />
							<div className="marketplace-reviews-modal__ratings-count">
								{ translate( '%(numberOfReviews)d review', '%(numberOfReviews)d reviews', {
									count: numberOfReviews,
									args: {
										numberOfReviews,
									},
								} ) }
							</div>
						</div>
					</div>
				) }

				<div className="marketplace-reviews-modal__reviews-list">
					<MarketplaceReviewsList productType={ productType } slug={ slug } />
				</div>
			</div>
		</Dialog>
	);
};
