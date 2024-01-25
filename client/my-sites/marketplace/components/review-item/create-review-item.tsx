import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isEnabled } from '@automattic/calypso-config';
import { Button, ConfettiAnimation } from '@automattic/components';
import Card from '@automattic/components/src/card';
import { CheckboxControl, TextareaControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Gravatar from 'calypso/components/gravatar';
import ReviewsRatingsStars from 'calypso/components/reviews-rating-stars/reviews-ratings-stars';
import {
	ProductDefinitionProps,
	useCreateMarketplaceReviewMutation,
	useMarketplaceReviewsQuery,
} from 'calypso/data/marketplace/use-marketplace-reviews';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import './style.scss';

type MarketplaceCreateReviewItemProps = {
	forceShowThankYou?: number;
	canPublishReview: boolean;
} & ProductDefinitionProps;

export function MarketplaceCreateReviewItem( props: MarketplaceCreateReviewItemProps ) {
	const { productType, slug, forceShowThankYou = 0, canPublishReview } = props;
	const translate = useTranslate();
	const currentUser = useSelector( getCurrentUser );
	const [ content, setContent ] = useState< string >( '' );
	const [ rating, setRating ] = useState< number >( 0 );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ showThankYouSection, setShowThankYouSection ] = useState( false );
	const [ showContentArea, setShowContentArea ] = useState( false );
	const [ contentPlaceholder, setContentPlaceholder ] = useState( '' );

	const { data: userReviews, isFetching: isFetchingUserReviews } = useMarketplaceReviewsQuery( {
		productType,
		slug,
		perPage: 1,
		author: currentUser?.ID ?? undefined,
		status: 'all',
	} );

	const resetFields = () => {
		setShowContentArea( false );
		setErrorMessage( '' );
		setContent( '' );
		setRating( 0 );
	};

	const createReviewMutation = useCreateMarketplaceReviewMutation( { productType, slug } );
	const createReview = () => {
		recordTracksEvent( 'calypso_marketplace_reviews_add_submit', {
			product_type: productType,
			slug: slug,
			rating: Number( rating ),
		} );

		createReviewMutation.mutate(
			{ productType, slug, content, rating },
			{
				onError: ( error ) => {
					setErrorMessage( error.message );
				},
				onSuccess: () => {
					resetFields();
					setShowThankYouSection( true );
				},
			}
		);
	};

	const onSelectRating = ( value: number ) => {
		setRating( value );
		setShowContentArea( true );
	};

	useEffect( () => {
		switch ( rating ) {
			case 1:
				return setContentPlaceholder(
					translate(
						"We're sorry to hear about your experience. Could you share what went wrong or how we can improve?"
					)
				);
			case 2:
				return setContentPlaceholder(
					translate(
						"It looks like things didn't go as expected. Can you tell us what could have been better?"
					)
				);
			case 3:
				return setContentPlaceholder(
					translate(
						'Thanks for your feedback! What did you like, and how can we make your experience even better?'
					)
				);
			case 4:
				return setContentPlaceholder(
					translate(
						'Great to know you had a good experience! What did you enjoy, and how can we make it excellent?'
					)
				);
			case 5:
				return setContentPlaceholder(
					translate( 'Thrilled to see you had a fantastic experience! What did you love the most?' )
				);
			// Fallback that shouldn't really be seen
			// as the field is only shown once a rating is selected
			default:
				return setContentPlaceholder(
					translate( 'Please write your review to help other users.' )
				);
		}
	}, [ rating, translate ] );

	// Hide the Thank You section if user removed their review
	if ( ! userReviews?.length && ! isFetchingUserReviews && showThankYouSection ) {
		setShowThankYouSection( false );
	}

	if ( !! userReviews?.length && ! showThankYouSection && ! forceShowThankYou ) {
		return null;
	}

	return (
		<div className="marketplace-create-review-item__container">
			{ ! showThankYouSection && ! forceShowThankYou ? (
				<>
					{ errorMessage && (
						<Card className="marketplace-review-item__error-message" highlight="error">
							{ errorMessage }
						</Card>
					) }

					<div className="marketplace-review-item__review-container-header">
						<div className="marketplace-review-item__profile-picture">
							<Gravatar user={ currentUser } size={ 36 } />
						</div>

						<div className="marketplace-review-item__rating-data">
							<div className="marketplace-review-item__author">{ currentUser?.display_name }</div>
						</div>
						<div className="marketplace-review-item__date">{ moment().format( 'll' ) }</div>
					</div>

					<div className="marketplace-review-item__review-rating">
						<h2>{ translate( 'How would you rate your overall experience?' ) }</h2>
						<ReviewsRatingsStars
							size="medium-large"
							rating={ 0 }
							onSelectRating={ onSelectRating }
						/>
					</div>
					{ showContentArea && ! canPublishReview && (
						<Card className="marketplace-review-item__error-message" highlight="error">
							{ translate(
								'Only active users can leave a review. Please purchase a new subscription of the product to leave a review.'
							) }
						</Card>
					) }
					{ showContentArea && canPublishReview && (
						<>
							<TextareaControl
								rows={ 4 }
								cols={ 40 }
								className="marketplace-review-item__editor"
								placeholder={ contentPlaceholder }
								name="content"
								value={ content }
								onChange={ setContent }
							/>

							<div className="marketplace-review-item__review-actions">
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
									<Button
										className="marketplace-review-item__review-submit"
										primary
										onClick={ createReview }
									>
										{ translate( 'Leave my review' ) }
									</Button>
								</div>
							</div>
						</>
					) }
				</>
			) : (
				<>
					<ConfettiAnimation key={ forceShowThankYou } delay={ 1000 } />
					<div className="marketplace-create-review-item__thank-you">
						<h2>{ translate( 'Thank you for your feedback!' ) }</h2>
						<div className="marketplace-create-review-item__thank-you-subtitle">
							{ translate(
								'We appreciate you sharing your experience with this plugin! Your review will help to guide other users.'
							) }
						</div>
					</div>
				</>
			) }
		</div>
	);
}
