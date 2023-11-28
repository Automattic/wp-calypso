import { Dialog, Button, Card, Spinner } from '@automattic/components';
import { TextControl, TextareaControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import {
	ProductType,
	ErrorResponse,
	useCreateMarketplaceReviewMutation,
} from 'calypso/data/marketplace/use-marketplace-reviews';

import './marketplace-reviews-modal.scss';

type Props = {
	isVisible: boolean;
	buttons: React.ReactElement[];
	onClose: () => void;
	themeSlug: string;
	themeName: string;
};

export const ReviewsModal = ( { isVisible, buttons, onClose, themeSlug, themeName }: Props ) => {
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
						{ translate( 'Review submitted for %(themeName)s', { args: { themeName } } ) }
					</CardHeading>
					<CardHeading tagName="h2">
						{ translate( 'Thank you for your contribution.' ) }
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
					{ translate( 'Reviews for %(themeName)s', { args: { themeName } } ) }
				</CardHeading>
				<CardHeading tagName="h2">{ translate( 'Add new review' ) }</CardHeading>
				<form
					onSubmit={ ( e ) => {
						e.preventDefault();
						const requestData = {
							productType: 'theme' as ProductType,
							slug: themeSlug,
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
					<TextControl
						label="Rating"
						name="rating"
						type="number"
						min={ 1 }
						max={ 5 }
						value={ rating }
						onChange={ setRating }
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
