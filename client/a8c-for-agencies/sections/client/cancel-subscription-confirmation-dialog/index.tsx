import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useCancelClientSubscription from 'calypso/a8c-for-agencies/data/client/use-cancel-client-subscription';
import useFetchClientProducts from 'calypso/a8c-for-agencies/data/client/use-fetch-client-products';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { Subscription } from '../types';

type Props = {
	subscription: Subscription;
	onCancelSubscription: ( subscription: Subscription ) => void;
};

export default function CancelSubscriptionAction( { subscription, onCancelSubscription }: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isVisible, setIsVisible ] = useState( false );

	const { data: products, isFetching: isFetchingProductInfo } = useFetchClientProducts();

	const { mutate: cancelSubscription, isPending } = useCancelClientSubscription( {
		onSuccess: () => {
			dispatch(
				successNotice( translate( 'The subscription was successfully canceled.' ), {
					id: 'a8c-cancel-subscription-success',
				} )
			);
			onCancelSubscription?.( subscription );
			setIsVisible( false );
		},
		onError: ( error ) => {
			dispatch( errorNotice( error.message ) );
			setIsVisible( false );
		},
	} );

	const onConfirm = () => {
		cancelSubscription( {
			licenseKey: subscription.license.license_key,
		} );
		dispatch( recordTracksEvent( 'calypso_a8c_client_subscription_cancel_confirm' ) );
	};

	const handleClose = () => {
		dispatch( recordTracksEvent( 'calypso_a8c_client_subscription_cancel_dismiss' ) );
		setIsVisible( false );
	};

	const productName =
		products?.find( ( product ) => product.product_id === subscription.product_id )?.name ?? '';

	return (
		<>
			<Button compact onClick={ () => setIsVisible( true ) }>
				{ translate( 'Cancel the subscription' ) }
			</Button>

			<Dialog
				className="cancel-subscription-confirmation-dialog"
				isVisible={ isVisible }
				buttons={ [
					<Button onClick={ handleClose } disabled={ isPending }>
						{ translate( 'Keep the subscription' ) }
					</Button>,
					<Button
						onClick={ () => onConfirm() }
						scary
						primary
						busy={ isPending }
						disabled={ isPending }
					>
						{ translate( 'Cancel subscription' ) }
					</Button>,
				] }
				shouldCloseOnEsc
				onClose={ handleClose }
			>
				<h1 className="cancel-subscription-confirmation-dialog__title">
					{ translate( 'Are you sure you want to cancel this subscription?' ) }
				</h1>
				{ isFetchingProductInfo ? (
					<TextPlaceholder />
				) : (
					translate(
						'{{b}}%(productName)s{{/b}} will stop recommending products to your customers. This action cannot be undone.',
						{
							args: {
								productName,
							},
							components: {
								b: <b />,
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
