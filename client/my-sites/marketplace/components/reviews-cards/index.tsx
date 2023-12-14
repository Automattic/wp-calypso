import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import {
	useMarketplaceReviewsQuery,
	ProductProps,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import './style.scss';
import { MarketplaceReviewCard } from './review-card';

export const MarketplaceReviewsCards = ( props: ProductProps ) => {
	const translate = useTranslate();
	const { data: reviews } = useMarketplaceReviewsQuery( { ...props, perPage: 2, page: 1 } );

	if ( ! isEnabled( 'marketplace-reviews-show' ) ) {
		return null;
	}

	// TODO: In the future there should a form of catching and displaying an error
	// But as currently we returns errors for products without reviews,
	// its better to just avoid rendering the component at all
	if ( ! Array.isArray( reviews ) && ( ! reviews || reviews.message ) ) {
		return null;
	}

	return (
		<div className="marketplace-reviews-cards__container">
			<div className="marketplace-reviews-cards__no-reviews">
				<h2 className="marketplace-reviews-cards__no-reviews-title">
					{ translate( 'Customer reviews' ) }
				</h2>
				<h3 className="marketplace-reviews-cards__no-reviews-subtitle">
					{ translate( 'What other users are saying' ) }
				</h3>
			</div>

			<div className="marketplace-reviews-cards__content">
				{ Array.isArray( reviews ) &&
					reviews.map( ( review ) => <MarketplaceReviewCard review={ review } /> ) }
			</div>
		</div>
	);
};
