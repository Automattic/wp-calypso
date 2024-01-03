import { isEnabled } from '@automattic/calypso-config';
import { Gridicon, Button } from '@automattic/components';
import { CheckboxControl, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ConfirmModal from 'calypso/components/confirm-modal';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import Rating from 'calypso/components/rating';
import ReviewsRatingsStars from 'calypso/components/reviews-rating-stars/reviews-ratings-stars';
import {
	useMarketplaceReviewsQuery,
	MarketplaceReviewResponse,
	MarketplaceReviewsQueryProps,
	useDeleteMarketplaceReviewMutation,
	useUpdateMarketplaceReviewMutation,
	useInfiniteMarketplaceReviewsQuery,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import './style.scss';
import { getAvatarURL } from 'calypso/data/marketplace/utils';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

export const MarketplaceReviewsList = ( props: MarketplaceReviewsQueryProps ) => {
	const translate = useTranslate();
	const [ isConfirmModalVisible, setIsConfirmModalVisible ] = useState( false );
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
	} );

	const deleteReviewMutation = useDeleteMarketplaceReviewMutation( {
		...props,
		perPage: 1,
		author: currentUserId ?? undefined,
	} );
	const deleteReview = ( reviewId: number ) => {
		setIsConfirmModalVisible( false );
		deleteReviewMutation.mutate( { reviewId: reviewId } );
	};

	const updateReviewMutation = useUpdateMarketplaceReviewMutation( {
		...props,
		perPage: 1,
		author: currentUserId ?? undefined,
	} );

	const [ isEditing, setIsEditing ] = useState< boolean >( false );
	const [ editorContent, setEditorContent ] = useState< string >( '' );
	const [ editorRating, setEditorRating ] = useState< number >( 0 );

	const setEditing = ( review: MarketplaceReviewResponse ) => {
		setIsEditing( true );
		setEditorContent( review.content.rendered );
		setEditorRating( review.meta.wpcom_marketplace_rating );
	};

	const clearEditing = () => {
		setIsEditing( false );
		setEditorContent( '' );
		setEditorRating( 0 );
	};

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
		<div className="marketplace-reviews-list__container">
			<div className="marketplace-reviews-list__customer-reviews">
				{ [ ...userReviews, ...reviews ].map( ( review: MarketplaceReviewResponse ) => (
					<div
						className="marketplace-reviews-list__review-container"
						key={ `review-${ review.id }` }
					>
						<div className="marketplace-reviews-list__review-container-header">
							<div className="marketplace-reviews-list__profile-picture">
								{ getAvatarURL( review ) ? (
									<img
										className="marketplace-reviews-list__profile-picture-img"
										src={ getAvatarURL( review ) }
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
							<>
								<div className="marketplace-reviews-list__review-rating">
									<h2>{ translate( 'Let us know how your experience has changed' ) }</h2>
									<ReviewsRatingsStars
										size="medium-large"
										rating={ editorRating }
										onSelectRating={ setEditorRating }
									/>
								</div>
								<TextareaControl
									rows={ 4 }
									cols={ 40 }
									name="content"
									value={ editorContent }
									onChange={ setEditorContent }
								/>
							</>
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
							{ isEditing && review.author === currentUserId && (
								<>
									<div>
										{ isEnabled( 'marketplace-reviews-notifications' ) && (
											<CheckboxControl
												className="marketplace-reviews-list__checkbox"
												label={ translate( 'Notify me when my review is approved and published.' ) }
												checked={ false }
												onChange={ () => alert( 'Not implemented yet' ) }
											/>
										) }
									</div>
									<div className="marketplace-reviews-list__review-actions-editable">
										<Button className="is-link" onClick={ clearEditing }>
											{ translate( 'Cancel' ) }
										</Button>
										<Button
											className="marketplace-reviews-list__review-submit"
											primary
											onClick={ () => {
												updateReviewMutation.mutate( {
													reviewId: review.id,
													productType: props.productType,
													slug: props.slug,
													content: editorContent,
													rating: editorRating,
												} );
												clearEditing();
											} }
										>
											{ translate( 'Save my review' ) }
										</Button>
									</div>
								</>
							) }
							{ ! isEditing && review.author === currentUserId && (
								<div className="marketplace-reviews-list__review-actions-editable">
									<button
										className="marketplace-reviews-list__review-actions-editable-button"
										onClick={ () => setEditing( review ) }
									>
										<Gridicon icon="pencil" size={ 18 } />
										{ translate( 'Edit my review' ) }
									</button>
									<button
										className="marketplace-reviews-list__review-actions-editable-button"
										onClick={ () => setIsConfirmModalVisible( true ) }
									>
										<Gridicon icon="trash" size={ 18 } />
										{ translate( 'Delete my review' ) }
									</button>
									<div className="marketplace-reviews-list__review-actions-editable-confirm-modal">
										<ConfirmModal
											isVisible={ isConfirmModalVisible }
											confirmButtonLabel={ translate( 'Yes' ) }
											text={ translate( 'Do you really want to delete your review?' ) }
											title={ translate( 'Delete my review' ) }
											onCancel={ () => setIsConfirmModalVisible( false ) }
											onConfirm={ () => deleteReview( review.id ) }
										/>
									</div>
								</div>
							) }
						</div>
					</div>
				) ) }
				<InfiniteScroll nextPageMethod={ fetchNextPage } />
			</div>
		</div>
	);
};
