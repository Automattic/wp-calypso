import { useTranslate } from 'i18n-calypso';
import Rating from 'calypso/components/rating';
import { MarketplaceReviewResponse } from 'calypso/data/marketplace/use-marketplace-reviews';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';

type MarketplaceReviewCardProps = {
	review?: MarketplaceReviewResponse;
	leaveAReview?: boolean;
};

export const MarketplaceReviewCard = ( props: MarketplaceReviewCardProps ) => {
	const translate = useTranslate();
	const { review, leaveAReview } = props;

	if ( leaveAReview || ! review ) {
		return (
			<div className="marketplace-reviews-card__leave-a-review">
				<div className="marketplace-reviews-card__leave-a-review-message">
					{ translate( 'How would you rate your overall experience?' ) }
				</div>
				<div className="marketplace-reviews-card__leave-a-review-rating">
					<Rating rating={ 0 } size={ 32 } />
				</div>
			</div>
		);
	}

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
