import page from '@automattic/calypso-router';
import { Dialog, Button } from '@automattic/components';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import Rating from 'calypso/components/rating';
import { PluginPeriodVariations } from 'calypso/data/marketplace/types';
import {
	ProductProps,
	useMarketplaceReviewsQuery,
	useMarketplaceReviewsStatsQuery,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import { MarketplaceReviewsList } from 'calypso/my-sites/marketplace/components/reviews-list';
import './styles.scss';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	canPublishProductReviews,
	hasActivePluginSubscription,
} from 'calypso/state/marketplace/selectors';
import { getProductsList, isMarketplaceProduct } from 'calypso/state/products-list/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

type Props = {
	isVisible: boolean;
	onClose: () => void;
	productName: string;
	variations?: PluginPeriodVariations;
} & ProductProps;

export const ReviewsModal = ( props: Props ) => {
	const translate = useTranslate();
	const { isVisible, onClose, productName, productType, slug, variations } = props;
	const currentUser = useSelector( getCurrentUser );
	const selectedSite = useSelector( getSelectedSite );
	const isMarketplacePlugin = useSelector(
		( state ) => productType === 'plugin' && isMarketplaceProduct( state, slug )
	);

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
		canPublishProductReviews( state, productType, slug, variations )
	);
	const hasActiveSubscription = useSelector( ( state: AppState ) =>
		hasActivePluginSubscription( state, variations )
	);
	const askForReview = canPublishReview && ! userHasReviewed;

	const { ratings_average: averageRating, ratings_count: numberOfReviews } = reviewsStats || {};
	const normalizedRating = ( ( averageRating ?? 0 ) * 100 ) / 5; // Normalize to 100

	// Purchase Marketplace Plugin
	const productsList = useSelector( getProductsList );
	const variationPeriod = 'monthly';
	const variation = variations?.[ variationPeriod ];
	const marketplaceProductSlug = getProductSlugByPeriodVariation( variation, productsList );

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
							<div className="marketplace-reviews-modal__summary-button">
								<Button primary onClick={ () => alert( 'Not implemented yet' ) }>
									{ translate( 'Leave my review' ) }
								</Button>
							</div>
						) }
						{ /* TODO: Add theme purchase */ }
						{ ! askForReview && ! hasActiveSubscription && isMarketplacePlugin && (
							<div className="marketplace-reviews-modal__summary-button">
								<Button
									primary
									onClick={ () =>
										page(
											`/checkout/${ selectedSite?.slug || '' }/${ marketplaceProductSlug }?#step2`
										)
									}
								>
									{ translate( 'Purchase and activate this plugin' ) }
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
