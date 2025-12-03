import {
	purchaseQuery,
	userSettingsQuery,
	userPaymentMethodsQuery,
	stripeConfigurationQuery,
	razorpayConfigurationQuery,
	queryClient,
} from '@automattic/api-queries';
import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useCallback } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import {
	changePaymentMethodRoute,
	purchaseSettingsRoute,
	purchasesRoute,
} from '../../app/router/me';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PaymentMethodSelector } from './payment-method-selector';
import { useCreateAssignablePaymentMethods } from './payment-method-selector/use-create-assignable-payment-methods';

import './style.scss';

function ChangePaymentMethod() {
	const { purchaseId } = changePaymentMethodRoute.useParams();
	const navigate = useNavigate();

	const numericId = parseInt( purchaseId );
	if ( isNaN( numericId ) ) {
		throw new Error( 'Invalid purchase ID' );
	}
	const { data: purchase, isLoading: isLoadingPurchase } = useSuspenseQuery(
		purchaseQuery( numericId )
	);
	const { isLoading: isLoadingStoredCards } = useQuery(
		userPaymentMethodsQuery( { type: 'card' } )
	);
	const { isStripeLoading } = useStripe();

	const paymentMethods = useCreateAssignablePaymentMethods( purchase );
	const isDataLoading = isLoadingStoredCards || isStripeLoading || isLoadingPurchase;

	useEffect( () => {
		if ( ! isDataLoading && ! purchase ) {
			// Redirect if the purchase does not exist
			navigate( { to: purchasesRoute.fullPath } );
		}
	}, [ isDataLoading, purchase, navigate ] );

	if ( isDataLoading || ! purchase ) {
		return null;
	}

	const successCallback = () => {
		navigate( { to: purchaseSettingsRoute.fullPath, params: { purchaseId: purchase.ID } } );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader
					prefix={ <Breadcrumbs length={ 4 } /> }
					title={
						! purchase.payment_type || purchase.payment_type === 'credits'
							? __( 'Add payment method' )
							: __( 'Update payment method' )
					}
					description={ __( 'Select or update the payment method for this purchase.' ) }
				/>
			}
		>
			<VStack spacing={ 6 }>
				<PaymentMethodSelector
					purchase={ purchase }
					paymentMethods={ paymentMethods }
					successCallback={ successCallback }
				/>
			</VStack>
		</PageLayout>
	);
}

export default function ChangePaymentMethodWrapper() {
	const { data: userSettings } = useQuery( userSettingsQuery() );
	const locale = userSettings?.language || 'en';

	const fetchStripeConfiguration = useCallback(
		( requestArgs?: { country?: string; payment_partner?: string } ) => {
			return queryClient.fetchQuery( stripeConfigurationQuery( requestArgs ) );
		},
		[]
	);

	const fetchRazorpayConfiguration = useCallback( ( requestArgs?: { sandbox: boolean } ) => {
		return queryClient.fetchQuery( razorpayConfigurationQuery( requestArgs ) );
	}, [] );

	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ fetchStripeConfiguration }>
			<RazorpayHookProvider fetchRazorpayConfiguration={ fetchRazorpayConfiguration }>
				<ChangePaymentMethod />
			</RazorpayHookProvider>
		</StripeHookProvider>
	);
}
