import {
	userSettingsQuery,
	stripeConfigurationQuery,
	razorpayConfigurationQuery,
	queryClient,
} from '@automattic/api-queries';
import { RazorpayHookProvider } from '@automattic/calypso-razorpay';
import { StripeHookProvider, useStripe } from '@automattic/calypso-stripe';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback } from 'react';
import Breadcrumbs from '../../app/breadcrumbs';
import { paymentMethodsRoute } from '../../app/router/me';
import { PageHeader } from '../../components/page-header';
import PageLayout from '../../components/page-layout';
import { PaymentMethodSelector } from './payment-method-selector';
import { useCreateCreditCard } from './payment-methods';

import './style.scss';

function AddPaymentMethod() {
	const navigate = useNavigate();

	const { isStripeLoading, stripeLoadingError } = useStripe();

	const creditCardMethod = useCreateCreditCard( {
		isStripeLoading,
		stripeLoadingError,
		allowUseForAllSubscriptions: true,
		defaultToUseForAllSubscriptions: true,
	} );

	if ( stripeLoadingError || ( ! isStripeLoading && ! creditCardMethod ) ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 4 } /> }
						title={ __( 'Add payment method' ) }
					/>
				}
			>
				<VStack spacing={ 6 }>
					{ __(
						'Sorry, an error occurred while loading the payment method form. Please refresh the page and try again.'
					) }
				</VStack>
			</PageLayout>
		);
	}

	if ( isStripeLoading || ! creditCardMethod ) {
		return (
			<PageLayout
				size="small"
				header={
					<PageHeader
						prefix={ <Breadcrumbs length={ 4 } /> }
						title={ __( 'Add payment method' ) }
					/>
				}
			>
				<VStack spacing={ 6 }>{ __( 'Loading…' ) }</VStack>
			</PageLayout>
		);
	}

	const successCallback = () => {
		navigate( { to: paymentMethodsRoute.to } );
	};

	return (
		<PageLayout
			size="small"
			header={
				<PageHeader prefix={ <Breadcrumbs length={ 4 } /> } title={ __( 'Add payment method' ) } />
			}
		>
			<VStack spacing={ 6 }>
				<PaymentMethodSelector
					paymentMethods={ [ creditCardMethod ] }
					successCallback={ successCallback }
				/>
			</VStack>
		</PageLayout>
	);
}

export default function AddPaymentMethodWrapper() {
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
				<AddPaymentMethod />
			</RazorpayHookProvider>
		</StripeHookProvider>
	);
}
