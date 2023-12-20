import { isEnabled } from '@automattic/calypso-config';
import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import {
	useMarketplaceReviewsQuery,
	ProductProps,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { IAppState } from 'calypso/state/types';
import { MarketplaceReviewCard } from './review-card';
import './style.scss';

export const MarketplaceReviewsCards = ( props: ProductProps ) => {
	const translate = useTranslate();
	const currentUserId = useSelector( ( state: IAppState ) => getCurrentUserId( state ) );
	const { data: reviews, error } = useMarketplaceReviewsQuery( { ...props, perPage: 2, page: 1 } );

	if ( ! isEnabled( 'marketplace-reviews-show' ) ) {
		return null;
	}

	if ( ! Array.isArray( reviews ) || error ) {
		return null;
	}

	// TODO: Double check this verification according what's being sent from the server
	// Add a review card if the user has not left a review yet
	const hasReview = reviews?.some( ( review ) => review.author === currentUserId );
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
						borderless
						primary
						onClick={ () => alert( 'Not implemented yet!' ) }
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
				{ addEmptyCard && <MarketplaceReviewCard empty={ true } key="empty-card" /> }
				{ addLeaveAReviewCard && (
					<MarketplaceReviewCard leaveAReview={ true } key="leave-a-review-card" />
				) }
			</div>
		</div>
	);
};
