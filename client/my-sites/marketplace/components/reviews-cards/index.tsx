import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	useMarketplaceReviewsQuery,
	ProductProps,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { MarketplaceReviewCard } from './review-card';
import './style.scss';

type MarketplaceReviewsCardsProps = { showMarketplaceReviews?: () => void } & ProductProps;

export const MarketplaceReviewsCards = ( props: MarketplaceReviewsCardsProps ) => {
	const translate = useTranslate();
	const currentUserId = useSelector( getCurrentUserId );
	const { data: userReviews = [] } = useMarketplaceReviewsQuery( {
		...props,
		perPage: 1,
		author: currentUserId ?? undefined,
		status: 'all',
	} );
	const { data: reviews, error } = useMarketplaceReviewsQuery( {
		...props,
		perPage: 2,
		page: 1,
	} );

	if ( ! Array.isArray( reviews ) || error ) {
		return null;
	}

	const hasReview = userReviews.length > 0;
	const addLeaveAReviewCard = ! hasReview && reviews.length < 2;

	const addEmptyCard = reviews.length === 0;

	return (
		<div className="marketplace-reviews-cards__container">
			<div className="marketplace-reviews-cards__reviews">
				<h2 className="marketplace-reviews-cards__reviews-title">
					{ translate( 'Customer reviews' ) }
				</h2>
				<h3 className="marketplace-reviews-cards__reviews-subtitle">
					{ translate( 'What other users are saying' ) }
				</h3>

				<div className="marketplace-reviews-cards__read-all">
					<Button
						className="is-link"
						onClick={ () => props.showMarketplaceReviews && props.showMarketplaceReviews() }
						href=""
					>
						{ translate( 'Read all reviews' ) }
					</Button>
				</div>
			</div>

			<div className="marketplace-reviews-cards__content">
				{ reviews.map( ( review ) => (
					<MarketplaceReviewCard review={ review } key={ review.id } />
				) ) }
				{ addEmptyCard && <MarketplaceReviewCard empty key="empty-card" /> }
				{ addLeaveAReviewCard && (
					<MarketplaceReviewCard
						leaveAReview
						key="leave-a-review-card"
						showMarketplaceReviews={ props.showMarketplaceReviews }
					/>
				) }
			</div>
		</div>
	);
};
