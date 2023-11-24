import { Dialog, Button, Card } from '@automattic/components';
import { TextControl, TextareaControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import CardHeading from 'calypso/components/card-heading';
import {
	ProductType,
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

export const AddReviewsModal = ( { isVisible, buttons, onClose, themeName }: Props ) => {
	const [ content, setContent ] = useState< string >( '' );
	const [ rating, setRating ] = useState< string >( '5' );

	const createReview = useCreateMarketplaceReviewMutation();

	return (
		<Card>
			<Dialog
				className="marketplace-reviews-modal"
				isVisible={ isVisible }
				buttons={ buttons }
				onClose={ onClose }
				showCloseIcon
			>
				<CardHeading tagName="h1" size={ 21 }>
					{ translate( 'Reviews for ' ) }
					{ themeName }
				</CardHeading>
				<CardHeading tagName="h2">{ translate( 'Add new review' ) }</CardHeading>
				<form
					onSubmit={ ( e ) => {
						e.preventDefault();
						const requestData = {
							productType: 'plugin' as ProductType,
							productSlug: 'woocommerce-bookings',
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
						value={ rating }
						onChange={ setRating }
					/>
					<Button type="submit">Add new review</Button>
				</form>
			</Dialog>
		</Card>
	);
};
