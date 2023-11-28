import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import Rating from 'calypso/components/rating';
import {
	ProductProps,
	useMarketplaceReviewsQuery,
	MarketplaceReviewResponse,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import './style.scss';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';

export const MarketplaceReviewsList = ( props: ProductProps ) => {
	const translate = useTranslate();
	const { data: reviews } = useMarketplaceReviewsQuery( props );

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
		<div className="marketplace-reviews-list__container">
			<h2 className="marketplace-reviews-list__title">{ translate( 'Customer reviews' ) }</h2>

			<div className="marketplace-reviews-list__customer-reviews">
				{ Array.isArray( reviews ) &&
					reviews.map( ( review: MarketplaceReviewResponse ) => (
						<div
							className="marketplace-reviews-list__review-container"
							key={ `review-${ review.id }` }
						>
							<div className="marketplace-reviews-list__author">{ review.author_name }</div>
							<div className="marketplace-reviews-list__rating-data">
								<Rating rating={ review.meta.wpcom_marketplace_rating * 20 } />

								<div
									// sanitized with sanitizeSectionContent
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={ {
										__html: sanitizeSectionContent( review.content.rendered ),
									} }
									className="marketplace-reviews-list__content"
								></div>
							</div>
							<div className="marketplace-reviews-list__date">
								{ moment( review.date ).format( 'll' ) }
							</div>
						</div>
					) ) }
			</div>
		</div>
	);
};
