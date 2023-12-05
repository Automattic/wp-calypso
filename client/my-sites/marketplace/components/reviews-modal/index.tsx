import { Dialog, Button, Card, Spinner, ReviewsRatingsStars } from '@automattic/components';
import { TextareaControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import {
	ProductType,
	ErrorResponse,
	useCreateMarketplaceReviewMutation,
} from 'calypso/data/marketplace/use-marketplace-reviews';

import './styles.scss';

type Props = {
	isVisible: boolean;
	buttons: React.ReactElement[];
	onClose: () => void;
	slug: string;
	productName: string;
	productType: ProductType;
};

export const ReviewsModal = ( {
	isVisible,
	buttons,
	onClose,
	slug,
	productName,
	productType,
}: Props ) => {
	const [ content, setContent ] = useState< string >( '' );
	const [ rating, setRating ] = useState< string >( '5' );

	const createReview = useCreateMarketplaceReviewMutation();

	if ( createReview.isSuccess ) {
		return (
			<Dialog
				className="marketplace-reviews-modal"
				isVisible={ isVisible }
				buttons={ buttons }
				onClose={ onClose }
				showCloseIcon
			>
				<Card className="marketplace-reviews-modal__card">
					<CardHeading tagName="h1" size={ 21 }>
						{ translate( 'Review submitted for %(productName)s', { args: { productName } } ) }
					</CardHeading>
					<CardHeading tagName="h2">
						{ translate(
							'Thank you for your contribution. It will be published following a review from our team.'
						) }
					</CardHeading>
				</Card>
			</Dialog>
		);
	}

	return (
		<Dialog
			className="marketplace-reviews-modal"
			isVisible={ isVisible }
			buttons={ buttons }
			onClose={ onClose }
			showCloseIcon
		>
			<Card className="marketplace-reviews-modal__card">
				<CardHeading tagName="h1" size={ 21 }>
					{ translate( 'Reviews for %(productName)s', { args: { productName } } ) }
				</CardHeading>
				<CardHeading tagName="h2">{ translate( 'Add new review' ) }</CardHeading>
				<form
					onSubmit={ ( e ) => {
						e.preventDefault();
						const requestData = {
							productType: productType,
							slug: slug,
							content: content,
							rating: Number( rating ),
						};
						createReview.mutate( requestData );
					} }
				>
					<TextareaControl
						rows={ 12 }
						cols={ 40 }
						label="Your review"
						name="content"
						value={ content }
						onChange={ setContent }
					/>
					<ReviewsRatingsStars
						onSelectRating={ ( rating: string ) => setRating( rating ) }
						rating={ 4 }
						averageRating={ 4.1 }
						ratingCount={ 567 }
						size="small"
					/>
					<div className="marketplace-reviews-modal__buttons-container">
						<Button
							className="marketplace-reviews-modal__button-submit"
							primary
							type="submit"
							disabled={ createReview.isLoading }
						>
							{ createReview.isLoading && <Spinner className="card__icon" /> }
							<span>{ translate( 'Submit' ) }</span>
						</Button>
						<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
					</div>
				</form>
				{ createReview.isError && (
					<span className="marketplace-reviews-modal__error">
						{ ( createReview.error as ErrorResponse ).message }
					</span>
				) }
			</Card>
		</Dialog>
	);
};
