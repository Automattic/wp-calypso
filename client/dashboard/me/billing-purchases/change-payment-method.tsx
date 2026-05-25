import {
	purchaseQuery,
	userSettingsQuery,
	userPaymentMethodsQuery,
	stripeConfigurationQuery,
	queryClient,
} from '@automattic/api-queries';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { isAllowedRedirectUrl } from '@automattic/calypso-url';
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
	const { redirect_to } = changePaymentMethodRoute.useSearch();
	const navigate = useNavigate();

	const numericId = parseInt( purchaseId );
	if ( isNaN( numericId ) ) {
		throw new Error( 'Invalid purchase ID' );
	}
	const { data: purchase } = useSuspenseQuery( purchaseQuery( numericId ) );

	const { isLoading: isLoadingStoredCards } = useQuery(
		userPaymentMethodsQuery( {
			type: 'card',
		} )
	);
	const { isLoading: isLoadingPayPal } = useQuery(
		userPaymentMethodsQuery( {
			type: 'vault-token',
		} )
	);
	const { isStripeLoading } = useStripe();

	const paymentMethods = useCreateAssignablePaymentMethods( purchase );
	const isDataLoading = isLoadingStoredCards || isLoadingPayPal || isStripeLoading;

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
		if (
			redirect_to &&
			purchase.domain &&
			isAllowedRedirectUrl( redirect_to, [ purchase.domain ] )
		) {
			window.location.href = redirect_to;
			return;
		}
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

	return (
		<StripeHookProvider locale={ locale } fetchStripeConfiguration={ fetchStripeConfiguration }>
			<ChangePaymentMethod />
		</StripeHookProvider>
	);
}
