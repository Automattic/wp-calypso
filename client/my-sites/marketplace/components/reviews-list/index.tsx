import { isEnabled } from '@automattic/calypso-config';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { LegacyRef, forwardRef, useState } from 'react';
import { useSelector } from 'react-redux';
import Rating from 'calypso/components/rating';
import {
	useMarketplaceReviewsQuery,
	MarketplaceReviewResponse,
	MarketplaceReviewsQueryProps,
	useDeleteMarketplaceReviewMutation,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import './style.scss';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { IAppState } from 'calypso/state/types';

export const MarketplaceReviewsList = forwardRef<
	HTMLDivElement,
	MarketplaceReviewsQueryProps & { innerRef: LegacyRef< HTMLDivElement > }
>( ( props, ref ) => {
	const translate = useTranslate();
	const { data: reviews, refetch: reviewsRefetch, error } = useMarketplaceReviewsQuery( props );

	// ...
	const currentUserId = useSelector( ( state: IAppState ) => getCurrentUserId( state ) );
	const deleteReviewMutation = useDeleteMarketplaceReviewMutation();
	const deleteReview = ( reviewId: number ) => {
		if ( confirm( translate( 'Are you sure you want to delete your review?' ) ) ) {
			deleteReviewMutation.mutate( {
				reviewId: reviewId,
			} );
			deleteReviewMutation?.isSuccess && reviewsRefetch();
			deleteReviewMutation?.isError && alert( ( deleteReviewMutation.error as Error ).message );
		}
	};

	const [ isEditing, setIsEditing ] = useState( false );

	// TODO: Get the proper value as a URL to the profile picture
	const authorProfilePic = null;

	if ( ! isEnabled( 'marketplace-reviews-show' ) ) {
		return null;
	}

	// TODO: In the future there should a form of catching and displaying an error
	// But as currently we returns errors for products without reviews,
	// its better to just avoid rendering the component at all
	if ( ! Array.isArray( reviews ) || error ) {
		return null;
	}

	if ( Array.isArray( reviews ) && reviews?.length === 0 ) {
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
		<div className="marketplace-reviews-list__container" ref={ ref }>
			<div className="marketplace-reviews-list__customer-reviews">
				{ Array.isArray( reviews ) &&
					reviews.map( ( review: MarketplaceReviewResponse ) => (
						<div
							className="marketplace-reviews-list__review-container"
							key={ `review-${ review.id }` }
						>
							<div className="marketplace-reviews-list__review-container-header">
								<div className="marketplace-reviews-list__profile-picture">
									{ authorProfilePic ? (
										<img
											className="marketplace-reviews-list__profile-picture-img"
											src={ authorProfilePic }
											alt={ translate( "%(reviewer)s's profile picture", {
												comment: 'Alt description for the profile picture of a reviewer',
												args: { reviewer: review.author_name },
											} ).toString() }
										/>
									) : (
										<div className="marketplace-reviews-list__profile-picture-placeholder" />
									) }
								</div>

								<div className="marketplace-reviews-list__rating-data">
									<div className="marketplace-reviews-list__author">{ review.author_name }</div>

									<Rating rating={ review.meta.wpcom_marketplace_rating * 20 } />
								</div>
								<div className="marketplace-reviews-list__date">
									{ moment( review.date ).format( 'll' ) }
								</div>
							</div>

							{ isEditing && review.author === currentUserId ? (
								<div className="marketplace-reviews-list__editor">Editing...</div>
							) : (
								<div
									// sanitized with sanitizeSectionContent
									// eslint-disable-next-line react/no-danger
									dangerouslySetInnerHTML={ {
										__html: sanitizeSectionContent( review.content.rendered ),
									} }
									className="marketplace-reviews-list__content"
								></div>
							) }

							<div className="marketplace-reviews-list__review-actions">
								{ review.author === currentUserId && (
									<div className="marketplace-reviews-list__review-actions-editable">
										<button
											className="marketplace-reviews-list__review-actions-editable-button"
											onClick={ () => setIsEditing( ! isEditing ) }
										>
											{ translate( 'Update my review' ) }
										</button>
										<button
											className="marketplace-reviews-list__review-actions-editable-button"
											onClick={ () => deleteReview( review.id ) }
										>
											{ translate( 'Delete my review' ) }
										</button>
									</div>
								) }
							</div>
						</div>
					) ) }
			</div>
		</div>
	);
} );
