import { isEnabled } from '@automattic/calypso-config';
import { Gridicon, Button } from '@automattic/components';
import Card from '@automattic/components/src/card';
import { CheckboxControl, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import ConfirmModal from 'calypso/components/confirm-modal';
import Rating from 'calypso/components/rating';
import ReviewsRatingsStars from 'calypso/components/reviews-rating-stars/reviews-ratings-stars';
import {
	MarketplaceReviewResponse,
	MarketplaceReviewsQueryProps,
	useDeleteMarketplaceReviewMutation,
	useUpdateMarketplaceReviewMutation,
	EMPTY_PLACEHOLDER,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { getAvatarURL } from 'calypso/data/marketplace/utils';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { sanitizeSectionContent } from 'calypso/lib/plugins/sanitize-section-content';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import './style.scss';

type MarketplaceReviewItemProps = {
	review: MarketplaceReviewResponse;
	onEditCompleted?: () => void;
} & MarketplaceReviewsQueryProps;

export const MarketplaceReviewItem = ( props: MarketplaceReviewItemProps ) => {
	const { review } = props;
	const translate = useTranslate();
	const [ isConfirmModalVisible, setIsConfirmModalVisible ] = useState( false );
	const currentUserId = useSelector( getCurrentUserId );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const [ isEditing, setIsEditing ] = useState< boolean >( false );
	const [ editorContent, setEditorContent ] = useState< string >( '' );
	const [ editorRating, setEditorRating ] = useState< number >( 0 );

	const isEmptyContent = review.content.raw === EMPTY_PLACEHOLDER;

	const setEditing = ( review: MarketplaceReviewResponse ) => {
		setIsEditing( true );
		setEditorContent( isEmptyContent ? '' : review.content.raw );
		setEditorRating( review.meta.wpcom_marketplace_rating );
	};

	const clearEditing = () => {
		setIsEditing( false );
		setEditorContent( '' );
		setEditorRating( 0 );
	};

	const deleteReviewMutation = useDeleteMarketplaceReviewMutation( {
		...props,
	} );
	const deleteReview = ( reviewId: number ) => {
		setIsConfirmModalVisible( false );
		deleteReviewMutation.mutate(
			{ reviewId: reviewId },
			{
				onError: ( error ) => {
					setErrorMessage( error.message );
				},
				onSuccess: () => {
					setErrorMessage( '' );
				},
			}
		);
	};

	const updateReviewMutation = useUpdateMarketplaceReviewMutation( { ...props } );
	const updateReview = ( reviewId: number ) => {
		recordTracksEvent( 'calypso_marketplace_reviews_update_submit', {
			product_type: props.productType,
			slug: props.slug,
			rating: Number( editorRating ),
		} );

		updateReviewMutation.mutate(
			{
				reviewId: reviewId,
				productType: props.productType,
				slug: props.slug,
				content: editorContent,
				rating: editorRating,
			},
			{
				onError: ( error ) => {
					setErrorMessage( error.message );
				},
				onSuccess: () => {
					props.onEditCompleted?.();
					setErrorMessage( '' );
				},
			}
		);
		clearEditing();
	};

	const maybeRenderContent = () => {
		if ( isEmptyContent ) {
			return null;
		}

		return (
			<div
				// sanitized with sanitizeSectionContent
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ {
					__html: sanitizeSectionContent( review.content.rendered ),
				} }
				className="marketplace-review-item__content"
			></div>
		);
	};

	return (
		<div className="marketplace-review-item__review-container" key={ `review-${ review.id }` }>
			{ review.author === currentUserId && errorMessage && (
				<Card className="marketplace-review-item__error-message" highlight="error">
					{ errorMessage }
				</Card>
			) }
			{ review.author === currentUserId && review.status === 'hold' && (
				<Card className="marketplace-review-item__pending-review" highlight="warning">
					<Gridicon className="marketplace-review-item__card-icon" icon="info" size={ 18 } />
					<div className="marketplace-review-item__card-text">
						<span>{ translate( 'Your review is pending approval.' ) }</span>
						{ isEnabled( 'marketplace-reviews-notification' ) && (
							<span>{ translate( ' You will be notified once it is published.' ) }</span>
						) }
					</div>
				</Card>
			) }
			<div className="marketplace-review-item__review-container-header">
				<div className="marketplace-review-item__profile-picture">
					{ getAvatarURL( review ) ? (
						<img
							className="marketplace-review-item__profile-picture-img"
							src={ getAvatarURL( review ) }
							alt={ translate( "%(reviewer)s's profile picture", {
								comment: 'Alt description for the profile picture of a reviewer',
								args: { reviewer: review.author_name },
							} ).toString() }
						/>
					) : (
						<div className="marketplace-review-item__profile-picture-placeholder" />
					) }
				</div>

				<div className="marketplace-review-item__rating-data">
					<div className="marketplace-review-item__author">{ review.author_name }</div>

					<Rating rating={ review.meta.wpcom_marketplace_rating * 20 } />
				</div>
				<div className="marketplace-review-item__date">
					{ moment( review.date ).format( 'll' ) }
				</div>
			</div>
			{ isEditing && review.author === currentUserId ? (
				<>
					<div className="marketplace-review-item__review-rating">
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
						className="marketplace-review-item__editor"
						value={ editorContent }
						onChange={ setEditorContent }
					/>
				</>
			) : (
				maybeRenderContent()
			) }
			{ review.author === currentUserId && (
				<div className="marketplace-review-item__review-actions">
					{ isEditing && (
						<>
							<div>
								{ isEnabled( 'marketplace-reviews-notification' ) && (
									<CheckboxControl
										className="marketplace-review-item__checkbox"
										label={ translate( 'Notify me when my review is approved and published.' ) }
										checked={ false }
										onChange={ () => alert( 'Not implemented yet' ) }
									/>
								) }
							</div>
							<div className="marketplace-review-item__review-actions-editable">
								<Button className="is-link" onClick={ clearEditing }>
									{ translate( 'Cancel' ) }
								</Button>
								<Button
									className="marketplace-review-item__review-submit"
									primary
									onClick={ () => updateReview( review.id ) }
								>
									{ translate( 'Save my review' ) }
								</Button>
							</div>
						</>
					) }
					{ ! isEditing && (
						<div className="marketplace-review-item__review-actions-editable">
							<button
								className="marketplace-review-item__review-actions-editable-button"
								onClick={ () => setEditing( review ) }
							>
								<Gridicon icon="pencil" size={ 18 } />
								{ translate( 'Edit my review' ) }
							</button>
							<button
								className="marketplace-review-item__review-actions-editable-button"
								onClick={ () => setIsConfirmModalVisible( true ) }
							>
								<Gridicon icon="trash" size={ 18 } />
								{ translate( 'Delete my review' ) }
							</button>
							<div className="marketplace-review-item__review-actions-editable-confirm-modal">
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
			) }
		</div>
	);
};
