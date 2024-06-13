import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { Subscription } from '../../types';

type Props = {
	subscription: Subscription;
};

export default function CancelSubscriptionAction( { subscription }: Props ) {
	const translate = useTranslate();
	const [ isVisible, setIsVisible ] = useState( false );

	const { data, isFetching } = useProductsQuery( true );

	const onConfirm = () => {
		// TODO: Implement the cancel subscription logic
		setIsVisible( false );
	};

	const productName =
		data?.find( ( product ) => product.product_id === subscription.product_id )?.name ?? '';

	return (
		<>
			<Button compact onClick={ () => setIsVisible( true ) }>
				{ translate( 'Cancel the subscription' ) }
			</Button>

			<Dialog
				className="cancel-subscription-confirmation-dialog"
				isVisible={ isVisible }
				buttons={ [
					<Button onClick={ () => setIsVisible( false ) }>
						{ translate( 'Keep the subscription' ) }
					</Button>,
					<Button onClick={ () => onConfirm() } scary primary>
						{ translate( 'Cancel subscription' ) }
					</Button>,
				] }
				shouldCloseOnEsc
				onClose={ () => setIsVisible( false ) }
			>
				<h1 className="cancel-subscription-confirmation-dialog__title">
					{ translate( 'Are you sure you want to cancel this subscription?' ) }
				</h1>
				{ isFetching ? (
					<TextPlaceholder />
				) : (
					translate(
						'%(productName)s will stop recommending products to your customers. This action cannot be undone.',
						{
							args: {
								productName,
							},
							comment:
								'%(productName)s is the name of the product that the user is about to cancel.',
						}
					)
				) }
			</Dialog>
		</>
	);
}
