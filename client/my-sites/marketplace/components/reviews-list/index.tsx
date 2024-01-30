import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import {
	useMarketplaceReviewsQuery,
	MarketplaceReviewResponse,
	MarketplaceReviewsQueryProps,
	useInfiniteMarketplaceReviewsQuery,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { MarketplaceReviewItem } from 'calypso/my-sites/marketplace/components/review-item';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import './style.scss';

export const MarketplaceReviewsList = (
	props: { onEditCompleted?: () => void } & MarketplaceReviewsQueryProps
) => {
	const translate = useTranslate();
	const currentUserId = useSelector( getCurrentUserId );
	const { data, fetchNextPage, error } = useInfiniteMarketplaceReviewsQuery( {
		...props,
		author_exclude: currentUserId ?? undefined,
	} );
	const reviews = data?.pages.flatMap( ( page ) => page.data );

	const { data: userReviews = [] } = useMarketplaceReviewsQuery( {
		...props,
		perPage: 1,
		author: currentUserId ?? undefined,
		status: 'all',
	} );

	// TODO: In the future there should a form of catching and displaying an error
	// But as currently we returns errors for products without reviews,
	// its better to just avoid rendering the component at all
	if ( ! Array.isArray( reviews ) || error ) {
		return null;
	}

	const allReviews = [ ...userReviews, ...reviews ];

	if ( Array.isArray( allReviews ) && allReviews?.length === 0 ) {
		return (
			<div className="marketplace-reviews-list__no-reviews">
				<h2 className="marketplace-reviews-list__no-reviews-title">
					{ translate( 'No reviews yet' ) }
				</h2>
				<h3 className="marketplace-reviews-list__no-reviews-subtitle">
					{ translate(
						'There are no reviews for this plugin at the moment. Your feedback could be the first to guide others.'
					) }
				</h3>
			</div>
		);
	}

	return (
		<div className="marketplace-reviews-list__container">
			<div className="marketplace-reviews-list__customer-reviews">
				<div className="marketplace-reviews-list__items">
					{ allReviews.map( ( review: MarketplaceReviewResponse ) => (
						<MarketplaceReviewItem key={ review.id } review={ review } { ...props } />
					) ) }
				</div>
				<InfiniteScroll nextPageMethod={ fetchNextPage } />
			</div>
		</div>
	);
};
