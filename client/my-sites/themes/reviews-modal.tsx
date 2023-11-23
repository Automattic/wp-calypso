import { Dialog, Button, Card } from '@automattic/components';
// import { translate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import {
	ProductType,
	useCreateMarketplaceReviewMutation,
} from 'calypso/data/marketplace/use-marketplace-reviews';

type Props = {
	isVisible: boolean;
	buttons: React.ReactElement[];
	onClose: () => void;
	themeSlug: string;
};

export const AddReviewsModal = ( { isVisible, buttons, onClose }: Props ) => {
	const createReview = useCreateMarketplaceReviewMutation();
	return (
		<Dialog isVisible={ isVisible } buttons={ buttons } onClose={ onClose }>
			<Card key="marketplace-reviews">
				<CardHeading tagName="h1" size={ 21 }>
					Reviews for WooCommerce Bookings
				</CardHeading>
				<CardHeading tagName="h1">Add new review</CardHeading>
				<form
					onSubmit={ ( e ) => {
						e.preventDefault();
						const data = new FormData( e.currentTarget );
						const requestData = {
							productType: 'plugin' as ProductType,
							pluginSlug: 'woocommerce-bookings',
							content: data.get( 'review' ) as string,
							rating: Number( data.get( 'rating' ) ),
						};
						createReview.mutate( requestData );
					} }
				>
					<label>
						Review title
						<input name="title" type="text" value="Good theme" />
					</label>
					<br />
					<label>
						Your review
						<input name="review" type="text" value="I like it" />
					</label>
					<br />
					<label>
						Rating
						<input name="rating" type="text" value="5" />
					</label>
					<br />
					<Button type="submit">Add new review</Button>
				</form>
			</Card>
		</Dialog>
	);
};
