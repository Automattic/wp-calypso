import page from '@automattic/calypso-router';
import { Dialog, Button } from '@automattic/components';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Rating from 'calypso/components/rating';
import { PluginPeriodVariations } from 'calypso/data/marketplace/types';
import {
	ProductProps,
	useMarketplaceReviewsQuery,
	useMarketplaceReviewsStatsQuery,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
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
import { MarketplaceCreateReviewItem } from '../review-item/create-review-item';

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
	const [ editCompletedTimes, setEditCompletedTimes ] = useState( 0 );

	useEffect( () => {
		isVisible &&
			recordTracksEvent( 'calypso_marketplace_reviews_modal_open', {
				product_type: productType,
				slug: slug,
			} );
	}, [ isVisible, productType, slug ] );

	const { data: userReviews, isFetching: isFetchingUserReviews } = useMarketplaceReviewsQuery( {
		productType,
		slug,
		perPage: 1,
		author: currentUser?.ID ?? undefined,
		status: 'all',
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

	// Hide the Thank You section if user removed their review
	if ( ! userReviews?.length && ! isFetchingUserReviews && editCompletedTimes ) {
		setEditCompletedTimes( 0 );
	}

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
			onClose={ () => {
				recordTracksEvent( 'calypso_marketplace_reviews_modal_close', {
					product_type: productType,
					slug: slug,
				} );
				onClose();
				setEditCompletedTimes( 0 );
			} }
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
								{ numberOfReviews > 0 &&
									averageRating.toLocaleString( getLocaleSlug() ?? 'default', {
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

						{ /* TODO: Add theme purchase */ }
						{ ! canPublishReview &&
							! userHasReviewed &&
							! hasActiveSubscription &&
							isMarketplacePlugin &&
							selectedSite?.slug && (
								<div className="marketplace-reviews-modal__summary-button">
									<Button
										primary
										onClick={ () =>
											page(
												`/checkout/${ selectedSite.slug || '' }/${ marketplaceProductSlug }?#step2`
											)
										}
									>
										{ translate( 'Purchase and activate this plugin' ) }
									</Button>
								</div>
							) }
					</div>
				) }

				<MarketplaceCreateReviewItem
					productType={ productType }
					slug={ slug }
					forceShowThankYou={ editCompletedTimes }
					canPublishReview={ canPublishReview }
				/>

				<div className="marketplace-reviews-modal__reviews-list">
					<MarketplaceReviewsList
						productType={ productType }
						slug={ slug }
						onEditCompleted={ () => setEditCompletedTimes( editCompletedTimes + 1 ) }
					/>
				</div>
			</div>
		</Dialog>
	);
};
