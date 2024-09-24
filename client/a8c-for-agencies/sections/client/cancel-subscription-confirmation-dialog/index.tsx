import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
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

	const { data: products, isFetching: isFetchingProductInfo } = useFetchClientProducts( false );

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

			{ isVisible && (
				<A4AConfirmationDialog
					title={ translate( 'Are you sure you want to cancel this subscription?' ) }
					onClose={ handleClose }
					onConfirm={ onConfirm }
					ctaLabel={ translate( 'Cancel subscription' ) }
					closeLabel={ translate( 'Keep the subscription' ) }
					isLoading={ isPending }
					isDestructive
				>
					{ isFetchingProductInfo ? (
						<TextPlaceholder />
					) : (
						translate(
							'{{b}}%(productName)s{{/b}} will be canceled, and you will no longer have access to it. Are you sure you want to cancel?',
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
				</A4AConfirmationDialog>
			) }
		</>
	);
}
