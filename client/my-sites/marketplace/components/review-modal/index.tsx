import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Dialog, Button, Card, Spinner } from '@automattic/components';
import { TextareaControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { type FormEvent, useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import ReviewsRatingsStars from 'calypso/components/reviews-rating-stars/reviews-ratings-stars';
import {
	ProductType,
	useCreateMarketplaceReviewMutation,
} from 'calypso/data/marketplace/use-marketplace-reviews';

import './styles.scss';

type Props = {
	isVisible: boolean;
	onClose: () => void;
	slug: string;
	productName: string;
	productType: ProductType;
};

export const ReviewModal = ( { isVisible, onClose, slug, productName, productType }: Props ) => {
	const [ content, setContent ] = useState< string >( '' );
	const [ rating, setRating ] = useState< number >( 5 );

	const createReview = useCreateMarketplaceReviewMutation( { productType, slug } );

	const handleSubmit = ( e: FormEvent ) => {
		e.preventDefault();
		createReview.mutate( {
			productType,
			slug: slug,
			content: content,
			rating: Number( rating ),
		} );

		recordTracksEvent( 'calypso_marketplace_reviews_add_submit', {
			product_type: productType,
			slug: slug,
			rating: Number( rating ),
		} );
	};

	const handleClose = () => {
		recordTracksEvent( 'calypso_marketplace_reviews_add_dismiss', {
			is_success: createReview.isSuccess,
			is_error: createReview.isError,
		} );

		onClose();
	};

	if ( createReview.isSuccess ) {
		return (
			<Dialog
				className="marketplace-review-modal"
				isVisible={ isVisible }
				onClose={ handleClose }
				showCloseIcon
			>
				<Card className="marketplace-review-modal__card-success">
					<CardHeading className="marketplace-review-modal__card-success-title" tagName="h1">
						{ translate( 'Thank you for your feedback!' ) }
					</CardHeading>
					<CardHeading className="marketplace-review-modal__card-success-body" tagName="p">
						{ translate(
							'Your review it‘s currently under moderation for adherence to our guidelines and will be published soon.'
						) }
					</CardHeading>
				</Card>
			</Dialog>
		);
	}

	return (
		<Dialog
			className="marketplace-review-modal"
			isVisible={ isVisible }
			onClose={ handleClose }
			showCloseIcon
		>
			<Card className="marketplace-review-modal__card">
				<CardHeading tagName="h1" size={ 21 }>
					{ translate( 'Add New Review for %(productName)s', { args: { productName } } ) }
				</CardHeading>
				<form onSubmit={ handleSubmit }>
					<TextareaControl
						rows={ 12 }
						cols={ 40 }
						label="Your review"
						name="content"
						value={ content }
						onChange={ setContent }
					/>
					<ReviewsRatingsStars onSelectRating={ setRating } showSelectedRating rating={ rating } />
					<div className="marketplace-review-modal__buttons-container">
						<Button
							className="marketplace-review-modal__button-submit"
							primary
							type="submit"
							disabled={ createReview.isPending }
						>
							{ createReview.isPending && <Spinner className="card__icon" /> }
							<span>{ translate( 'Submit' ) }</span>
						</Button>
						<Button onClick={ handleClose }>{ translate( 'Cancel' ) }</Button>
					</div>
				</form>
				{ createReview.isError && (
					<span className="marketplace-review-modal__error">{ createReview.error.message }</span>
				) }
			</Card>
		</Dialog>
	);
};
