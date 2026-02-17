import {
	submitTransaction,
	getPayPalExpressUrl,
	getPayPalConfiguration,
	confirmPayPalPPCPPayment,
	type TransactionRequest,
	type PayPalExpressRequest,
	type PayPalPPCPConfirmRequest,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export const submitTransactionMutation = () =>
	mutationOptions( {
		mutationFn: ( request: TransactionRequest ) => submitTransaction( request ),
	} );

export const getPayPalExpressUrlMutation = () =>
	mutationOptions( {
		mutationFn: ( request: PayPalExpressRequest ) => getPayPalExpressUrl( request ),
	} );

export const getPayPalConfigurationQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'paypal-configuration' ],
		queryFn: () => getPayPalConfiguration(),
		staleTime: Infinity,
	} );

export const confirmPayPalPPCPPaymentMutation = () =>
	mutationOptions( {
		mutationFn: ( request: PayPalPPCPConfirmRequest ) => confirmPayPalPPCPPayment( request ),
	} );
