import { Button } from '@automattic/components';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { A4AConfirmationDialog } from 'calypso/a8c-for-agencies/components/a4a-confirmation-dialog';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useCancelClientSubscription from 'calypso/a8c-for-agencies/data/client/use-cancel-client-subscription';
import useFetchClientProducts from 'calypso/a8c-for-agencies/data/client/use-fetch-client-products';
import { formatDate } from 'calypso/dashboard/utils/datetime';
import { useSelector, useDispatch } from 'calypso/state';
import { getUserBillingType } from 'calypso/state/a8c-for-agencies/agency/selectors';
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

	// Check if auto-renew is enabled to determine if the cancel button should be shown
	// If subscription.subscription is null, fallback to old behavior (show the button)
	// If subscription.subscription exists but is_auto_renew_enabled is null/undefined, default to true (show the button)
	// TODO: Later we might show added details and the ability to actually remove a cancelled subscription that has auto-renew disabled, like on the WPCOM side.
	const isAutoRenewEnabled = subscription.subscription
		? subscription.subscription.is_auto_renew_enabled ?? true
		: true;

	return (
		<>
			{ isAutoRenewEnabled && (
				<Button compact onClick={ () => setIsVisible( true ) }>
					{ translate( 'Cancel the subscription' ) }
				</Button>
			) }

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
					<A4ACancelSubscriptionContent subscription={ subscription } />
				</A4AConfirmationDialog>
			) }
		</>
	);
}

function A4ACancelSubscriptionContent( { subscription }: { subscription: Subscription } ) {
	const translate = useTranslate();
	const locale = useLocale();
	const { data: products, isFetching: isFetchingProductInfo } = useFetchClientProducts( false );
	const isBillingTypeBD = useSelector( getUserBillingType ) === 'billingdragon';

	if ( isFetchingProductInfo ) {
		return <TextPlaceholder />;
	}

	const storeSubscription = subscription.subscription;

	const productName =
		isBillingTypeBD && storeSubscription?.product_name
			? storeSubscription.product_name
			: products?.find( ( product ) => product.product_id === subscription.product_id )?.name ?? '';

	if ( storeSubscription ) {
		const expiryDate = storeSubscription.expiry
			? formatDate( new Date( storeSubscription.expiry ), locale, { dateStyle: 'long' } )
			: '';
		return (
			<>
				<div>
					{ storeSubscription.is_refundable
						? translate(
								'{{b}}%(productName)s{{/b}} will be canceled and removed immediately. Since you are within the money-back period, you will be refunded.',
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
						: translate(
								'{{b}}%(productName)s{{/b}} will be canceled, but it will remain active until {{b}}%(expiryDate)s{{/b}}. After that, it will not renew',
								{
									args: {
										productName,
										expiryDate,
									},
									components: {
										b: <b />,
									},
									comment:
										'%(productName)s is the name of the product that the user is about to cancel.',
								}
						  ) }
				</div>
				<p>{ translate( 'Are you sure you want to cancel?' ) }</p>
				<p>
					{ translate( '{{link}}Learn more{{/link}} about how product cancellations work.', {
						components: {
							link: (
								<a
									href={ localizeUrl(
										'https://wordpress.com/support/manage-purchases/cancel-a-purchase/'
									) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
						},
					} ) }
				</p>
			</>
		);
	}

	return translate(
		'{{b}}%(productName)s{{/b}} will be canceled, and you will no longer have access to it. Are you sure you want to cancel?',
		{
			args: {
				productName,
			},
			components: {
				b: <b />,
			},
			comment: '%(productName)s is the name of the product that the user is about to cancel.',
		}
	);
}
