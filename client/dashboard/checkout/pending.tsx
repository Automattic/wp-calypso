import { useNavigate, useParams } from '@tanstack/react-router';
import {
	Button,
	Spinner,
	__experimentalVStack as VStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';
import { useEffect } from 'react';
import { PageHeader } from '../components/page-header';
import PageLayout from '../components/page-layout';
import { usePurchaseOrder } from './use-purchase-order';

/**
 * Displayed while the transaction is being processed. Polls the order endpoint
 * and transitions to a success or error state once the order settles.
 *
 * On error or payment failure the user is navigated back to the checkout page
 * with an error notice. On success, a completion message is shown in place.
 */
export default function CheckoutPendingPage() {
	const { siteSlug, orderId: orderIdParam } = useParams( { strict: false } );
	const parsedOrderId = orderIdParam ? parseInt( orderIdParam, 10 ) : NaN;
	const orderId = Number.isFinite( parsedOrderId ) ? parsedOrderId : undefined;

	const navigate = useNavigate();
	const { createErrorNotice } = useDispatch( noticesStore );

	const { order, isLoading } = usePurchaseOrder( orderId );

	useEffect( () => {
		if ( ! order ) {
			return;
		}

		if ( order.processing_status === 'error' || order.processing_status === 'payment-failure' ) {
			const message =
				order.processing_status === 'payment-failure'
					? __( 'Your payment failed. Please check your payment details and try again.' )
					: __( 'There was an error processing your order. Please try again.' );

			createErrorNotice( message, { id: 'checkout-error', type: 'snackbar' } );

			void navigate( {
				to: '/checkout/$siteSlug',
				params: { siteSlug: String( siteSlug ) },
			} );
		}
	}, [ order, siteSlug, navigate, createErrorNotice ] );

	if ( ! orderId ) {
		return (
			<PageLayout>
				<PageHeader title={ __( 'Checkout' ) } />
				<Text>{ __( 'Invalid order. Please try your purchase again.' ) }</Text>
			</PageLayout>
		);
	}

	if ( order?.processing_status === 'success' ) {
		return (
			<PageLayout>
				<PageHeader title={ __( 'Purchase complete' ) } />
				<VStack spacing={ 4 } style={ { maxWidth: '480px' } }>
					<Text>{ __( 'Your purchase was successful.' ) }</Text>
					<Button
						variant="primary"
						onClick={ () =>
							void navigate( {
								to: '/sites/$siteSlug',
								params: { siteSlug: String( siteSlug ) },
							} )
						}
					>
						{ __( 'Return to dashboard' ) }
					</Button>
				</VStack>
			</PageLayout>
		);
	}

	// Order is processing or async-pending (or still loading for the first time).
	return (
		<PageLayout>
			<PageHeader title={ __( 'Processing your payment' ) } />
			<VStack spacing={ 4 } alignment="center" style={ { padding: '48px 0', textAlign: 'center' } }>
				<Spinner style={ { width: '32px', height: '32px' } } />
				{ ! isLoading && <Text>{ __( 'Processing your payment…' ) }</Text> }
			</VStack>
		</PageLayout>
	);
}
