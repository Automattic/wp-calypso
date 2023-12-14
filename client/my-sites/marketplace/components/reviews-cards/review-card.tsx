import { useTranslate } from 'i18n-calypso';
import Rating from 'calypso/components/rating';
import { MarketplaceReviewResponse } from 'calypso/data/marketplace/use-marketplace-reviews';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';

export const MarketplaceReviewCard = ( props: { review: MarketplaceReviewResponse } ) => {
	const translate = useTranslate();
	const { review } = props;

	return (
		<div className="marketplace-reviews-card__container">
			<div className="marketplace-reviews-card__rating">
				<Rating rating={ review.meta.wpcom_marketplace_rating * 20 } />
			</div>

			<div className="marketplace-reviews-card__review-data">
				<div
					// sanitized with sanitizeSectionContent
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ {
						__html: sanitizeSectionContent( review.content.rendered ),
					} }
					className="marketplace-reviews-list__review-data-content"
				></div>
			</div>

			<div className="marketplace-reviews-card__author">
				{ translate( 'By {{span}}%(author)s{{/span}}', {
					comment: 'Show "By *Author Name*" in the review card',
					args: { author: review.author_name },
					components: {
						span: <span className="marketplace-reviews-card__author-name" />,
					},
				} ) }
			</div>
		</div>
	);
};
