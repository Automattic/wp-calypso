/**
 * External dependencies
 */
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ThemeProvider } from 'emotion-theming';
import debugFactory from 'debug';
import { useI18n } from '@automattic/react-i18n';
import { DataRegistry } from '@wordpress/data';

/**
 * Internal dependencies
 */
import CheckoutContext from '../lib/checkout-context';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { LineItemsProvider } from '../lib/line-items';
import { defaultRegistry, RegistryProvider } from '../lib/registry';
import { useFormStatusManager } from '../lib/form-status';
import { useTransactionStatusManager } from '../lib/transaction-status';
import defaultTheme from '../lib/theme';
import {
	validateArg,
	validateLineItems,
	validatePaymentMethods,
	validateTotal,
} from '../lib/validation';
import TransactionStatusHandler from './transaction-status-handler';
import { CheckoutProviderProps, FormStatus, PaymentMethod } from '../types';

const debug = debugFactory( 'composite-checkout:checkout-provider' );

export const CheckoutProvider: FunctionComponent< CheckoutProviderProps > = ( props ) => {
	const {
		total,
		items,
		onPaymentComplete,
		showErrorMessage,
		showInfoMessage,
		showSuccessMessage,
		redirectToUrl,
		theme,
		paymentMethods,
		paymentProcessors,
		registry,
		onEvent,
		isLoading,
		isValidating,
		children,
	} = props;
	const [ paymentMethodId, setPaymentMethodId ] = useState< string | null >(
		paymentMethods?.length ? paymentMethods[ 0 ].id : null
	);
	const [ prevPaymentMethods, setPrevPaymentMethods ] = useState< PaymentMethod[] >( [] );
	useEffect( () => {
		if ( paymentMethods.length !== prevPaymentMethods.length ) {
			debug( 'paymentMethods changed; setting payment method to first of', paymentMethods );
			setPaymentMethodId( paymentMethods?.length ? paymentMethods[ 0 ].id : null );
			setPrevPaymentMethods( paymentMethods );
		}
	}, [ paymentMethods, prevPaymentMethods ] );

	const [ formStatus, setFormStatus ] = useFormStatusManager(
		Boolean( isLoading ),
		Boolean( isValidating )
	);
	const transactionStatusManager = useTransactionStatusManager();
	const { transactionLastResponse } = transactionStatusManager;
	const didCallOnPaymentComplete = useRef( false );
	useEffect( () => {
		if ( formStatus === FormStatus.COMPLETE && ! didCallOnPaymentComplete.current ) {
			debug( "form status is complete so I'm calling onPaymentComplete" );
			didCallOnPaymentComplete.current = true;
			onPaymentComplete( { paymentMethodId, transactionLastResponse } );
		}
	}, [ formStatus, onPaymentComplete, transactionLastResponse, paymentMethodId ] );

	// Create the registry automatically if it's not a prop
	const registryRef = useRef< DataRegistry | undefined >( registry );
	registryRef.current = registryRef.current || defaultRegistry;

	const value = useMemo(
		() => ( {
			allPaymentMethods: paymentMethods,
			paymentMethodId,
			setPaymentMethodId,
			showErrorMessage,
			showInfoMessage,
			showSuccessMessage,
			onEvent: onEvent || noop,
			formStatus,
			setFormStatus,
			transactionStatusManager,
			paymentProcessors,
		} ),
		[
			formStatus,
			onEvent,
			paymentMethodId,
			paymentMethods,
			setFormStatus,
			showErrorMessage,
			showInfoMessage,
			showSuccessMessage,
			transactionStatusManager,
			paymentProcessors,
		]
	);

	const { __ } = useI18n();
	const errorMessage = __( 'Sorry, there was an error loading this page.' );
	const onError = useCallback(
		( error ) => onEvent?.( { type: 'PAGE_LOAD_ERROR', payload: error } ),
		[ onEvent ]
	);
	return (
		<CheckoutErrorBoundary errorMessage={ errorMessage } onError={ onError }>
			<CheckoutProviderPropValidator propsToValidate={ props } />
			<ThemeProvider theme={ theme || defaultTheme }>
				<RegistryProvider value={ registryRef.current }>
					<LineItemsProvider items={ items } total={ total }>
						<CheckoutContext.Provider value={ value }>
							<TransactionStatusHandler redirectToUrl={ redirectToUrl } />
							{ children }
						</CheckoutContext.Provider>
					</LineItemsProvider>
				</RegistryProvider>
			</ThemeProvider>
		</CheckoutErrorBoundary>
	);
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop(): void {}

function CheckoutProviderPropValidator( {
	propsToValidate,
}: {
	propsToValidate: CheckoutProviderProps;
} ) {
	const {
		total,
		items,
		onPaymentComplete,
		showErrorMessage,
		showInfoMessage,
		showSuccessMessage,
		paymentMethods,
		paymentProcessors,
	} = propsToValidate;
	useEffect( () => {
		debug( 'propsToValidate', propsToValidate );

		validateArg( total, 'CheckoutProvider missing required prop: total' );
		validateTotal( total );
		validateArg( items, 'CheckoutProvider missing required prop: items' );
		validateLineItems( items );
		validateArg( paymentProcessors, 'CheckoutProvider missing required prop: paymentProcessors' );
		validateArg( paymentMethods, 'CheckoutProvider missing required prop: paymentMethods' );
		validatePaymentMethods( paymentMethods );
		validateArg( onPaymentComplete, 'CheckoutProvider missing required prop: onPaymentComplete' );
		validateArg( showErrorMessage, 'CheckoutProvider missing required prop: showErrorMessage' );
		validateArg( showInfoMessage, 'CheckoutProvider missing required prop: showInfoMessage' );
		validateArg( showSuccessMessage, 'CheckoutProvider missing required prop: showSuccessMessage' );
	}, [
		items,
		onPaymentComplete,
		paymentMethods,
		paymentProcessors,
		propsToValidate,
		showErrorMessage,
		showInfoMessage,
		showSuccessMessage,
		total,
	] );
	return null;
}
