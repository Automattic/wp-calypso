import { ThemeProvider } from '@emotion/react';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CheckoutContext from '../lib/checkout-context';
import { useFormStatusManager } from '../lib/form-status';
import { LineItemsProvider } from '../lib/line-items';
import defaultTheme from '../lib/theme';
import { useTransactionStatusManager } from '../lib/transaction-status';
import {
	validateArg,
	validateLineItems,
	validatePaymentMethods,
	validateTotal,
} from '../lib/validation';
import {
	LineItem,
	CheckoutProviderProps,
	FormStatus,
	TransactionStatus,
	PaymentMethod,
} from '../types';
import CheckoutErrorBoundary from './checkout-error-boundary';
import TransactionStatusHandler from './transaction-status-handler';
import type {
	PaymentEventCallback,
	PaymentErrorCallback,
	PaymentProcessorResponseData,
} from '../types';

const debug = debugFactory( 'composite-checkout:checkout-provider' );

const emptyTotal: LineItem = {
	id: 'total',
	type: 'total',
	amount: { value: 0, displayValue: '0', currency: 'USD' },
	label: 'Total',
};

export function CheckoutProvider( {
	total = emptyTotal,
	items = [],
	onPaymentComplete,
	onPaymentRedirect,
	onPaymentError,
	onPageLoadError,
	onStepChanged,
	onPaymentMethodChanged,
	redirectToUrl,
	theme,
	paymentMethods,
	paymentProcessors,
	isLoading,
	isValidating,
	initiallySelectedPaymentMethodId = null,
	children,
}: CheckoutProviderProps ): JSX.Element {
	const propsToValidate = {
		total,
		items,
		redirectToUrl,
		theme,
		paymentMethods,
		paymentProcessors,
		isLoading,
		isValidating,
		children,
		initiallySelectedPaymentMethodId,
	};
	const [ paymentMethodId, setPaymentMethodId ] = useState< string | null >(
		initiallySelectedPaymentMethodId
	);
	const [ prevPaymentMethods, setPrevPaymentMethods ] = useState< PaymentMethod[] >( [] );
	useEffect( () => {
		const paymentMethodIds = paymentMethods.map( ( x ) => x?.id );
		const prevPaymentMethodIds = prevPaymentMethods.map( ( x ) => x?.id );
		const paymentMethodsChanged =
			paymentMethodIds.some( ( x ) => ! prevPaymentMethodIds.includes( x ) ) ||
			prevPaymentMethodIds.some( ( x ) => ! paymentMethodIds.includes( x ) );
		if ( paymentMethodsChanged ) {
			debug(
				'paymentMethods changed; setting payment method to initial selection ',
				initiallySelectedPaymentMethodId,
				'from',
				paymentMethods
			);
			setPrevPaymentMethods( paymentMethods );
			setPaymentMethodId( initiallySelectedPaymentMethodId );
		}
	}, [ paymentMethods, prevPaymentMethods, initiallySelectedPaymentMethodId ] );

	const [ formStatus, setFormStatus ] = useFormStatusManager(
		Boolean( isLoading ),
		Boolean( isValidating )
	);
	const transactionStatusManager = useTransactionStatusManager();
	const { transactionLastResponse, transactionStatus, transactionError } = transactionStatusManager;

	useCallEventCallbacks( {
		onPaymentComplete,
		onPaymentRedirect,
		onPaymentError,
		formStatus,
		transactionError,
		transactionStatus,
		paymentMethodId,
		transactionLastResponse,
	} );

	const value = useMemo(
		() => ( {
			allPaymentMethods: paymentMethods,
			paymentMethodId,
			setPaymentMethodId,
			formStatus,
			setFormStatus,
			transactionStatusManager,
			paymentProcessors,
			onPageLoadError,
			onStepChanged,
			onPaymentMethodChanged,
		} ),
		[
			formStatus,
			paymentMethodId,
			paymentMethods,
			setFormStatus,
			transactionStatusManager,
			paymentProcessors,
			onPageLoadError,
			onStepChanged,
			onPaymentMethodChanged,
		]
	);

	const { __ } = useI18n();
	const errorMessage = __( 'Sorry, there was an error loading this page.' );
	const onLoadError = useCallback(
		( errorMessage ) => {
			onPageLoadError?.( 'page_load', errorMessage );
		},
		[ onPageLoadError ]
	);
	return (
		<CheckoutErrorBoundary errorMessage={ errorMessage } onError={ onLoadError }>
			<CheckoutProviderPropValidator propsToValidate={ propsToValidate } />
			<ThemeProvider theme={ theme || defaultTheme }>
				<LineItemsProvider items={ items } total={ total }>
					<CheckoutContext.Provider value={ value }>
						<TransactionStatusHandler redirectToUrl={ redirectToUrl } />
						{ children }
					</CheckoutContext.Provider>
				</LineItemsProvider>
			</ThemeProvider>
		</CheckoutErrorBoundary>
	);
}

function CheckoutProviderPropValidator( {
	propsToValidate,
}: {
	propsToValidate: CheckoutProviderProps;
} ) {
	const { total, items, paymentMethods, paymentProcessors } = propsToValidate;
	useEffect( () => {
		debug( 'propsToValidate', propsToValidate );

		validateArg( total, 'CheckoutProvider missing required prop: total' );
		validateTotal( total );
		validateArg( items, 'CheckoutProvider missing required prop: items' );
		validateLineItems( items );
		validateArg( paymentProcessors, 'CheckoutProvider missing required prop: paymentProcessors' );
		validateArg( paymentMethods, 'CheckoutProvider missing required prop: paymentMethods' );
		validatePaymentMethods( paymentMethods );
	}, [ items, paymentMethods, paymentProcessors, propsToValidate, total ] );
	return null;
}

function useCallEventCallbacks( {
	onPaymentComplete,
	onPaymentRedirect,
	onPaymentError,
	formStatus,
	transactionError,
	transactionStatus,
	paymentMethodId,
	transactionLastResponse,
}: {
	onPaymentComplete?: PaymentEventCallback;
	onPaymentRedirect?: PaymentEventCallback;
	onPaymentError?: PaymentErrorCallback;
	formStatus: FormStatus;
	transactionError: string | null;
	transactionStatus: TransactionStatus;
	paymentMethodId: string | null;
	transactionLastResponse: PaymentProcessorResponseData;
} ): void {
	useEffect( () => {
		if ( onPaymentComplete && formStatus === FormStatus.COMPLETE ) {
			debug( "form status is complete so I'm calling onPaymentComplete" );
			onPaymentComplete( { paymentMethodId, transactionLastResponse } );
		}
	}, [ formStatus, onPaymentComplete, transactionLastResponse, paymentMethodId ] );

	useEffect( () => {
		if ( onPaymentRedirect && transactionStatus === TransactionStatus.REDIRECTING ) {
			debug( "transaction status is redirecting so I'm calling onPaymentRedirect" );
			onPaymentRedirect( { paymentMethodId, transactionLastResponse } );
		}
	}, [
		transactionStatus,
		onPaymentRedirect,
		onPaymentError,
		paymentMethodId,
		transactionLastResponse,
	] );

	useEffect( () => {
		if ( onPaymentError && transactionStatus === TransactionStatus.ERROR ) {
			debug( "transaction status is error so I'm calling onPaymentError" );
			onPaymentError( { paymentMethodId, transactionError } );
		}
	}, [ transactionStatus, onPaymentRedirect, onPaymentError, paymentMethodId, transactionError ] );
}
