import { ThemeProvider } from '@emotion/react';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { LineItem, CheckoutProviderProps, FormStatus, TransactionStatus } from '../types';
import CheckoutErrorBoundary from './checkout-error-boundary';
import { FormStatusProvider } from './form-status-provider';
import TransactionStatusHandler from './transaction-status-handler';
import type {
	PaymentEventCallback,
	PaymentErrorCallback,
	PaymentProcessorResponseData,
	CheckoutContextInterface,
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
	onPaymentMethodChanged,
	redirectToUrl,
	theme,
	paymentMethods,
	paymentProcessors,
	isLoading,
	isValidating,
	selectFirstAvailablePaymentMethod,
	initiallySelectedPaymentMethodId = null,
	children,
}: CheckoutProviderProps ) {
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

	// Keep track of enabled/disabled payment methods.
	const [ disabledPaymentMethodIds, setDisabledPaymentMethodIds ] = useState< string[] >( [] );
	const availablePaymentMethodIds = paymentMethods
		.filter( ( method ) => ! disabledPaymentMethodIds.includes( method.id ) )
		.map( ( method ) => method.id );

	// Automatically select first payment method unless explicitly set or disabled.
	if (
		selectFirstAvailablePaymentMethod &&
		! initiallySelectedPaymentMethodId &&
		availablePaymentMethodIds.length > 0
	) {
		initiallySelectedPaymentMethodId = availablePaymentMethodIds[ 0 ];
	}

	// Keep track of selected payment method.
	const [ paymentMethodId, setPaymentMethodId ] = useState< string | null >(
		initiallySelectedPaymentMethodId
	);

	// Reset the selected payment method if the list of payment methods changes.
	useResetSelectedPaymentMethodWhenListChanges(
		availablePaymentMethodIds,
		initiallySelectedPaymentMethodId,
		setPaymentMethodId
	);

	// Keep track of form status state (loading, validating, ready, etc).
	const formStatusManager = useFormStatusManager( Boolean( isLoading ), Boolean( isValidating ) );

	// Keep track of transaction status state (pending, complete, redirecting, etc).
	const transactionStatusManager = useTransactionStatusManager();
	const { transactionLastResponse, transactionStatus, transactionError } = transactionStatusManager;

	// When form status or transaction status changes, call the appropriate callbacks.
	useCallEventCallbacks( {
		onPaymentComplete,
		onPaymentRedirect,
		onPaymentError,
		formStatus: formStatusManager.formStatus,
		transactionError,
		transactionStatus,
		paymentMethodId,
		transactionLastResponse,
	} );

	// Create a big blob of state to store in React Context for use by all this Provider's children.
	const value: CheckoutContextInterface = useMemo(
		() => ( {
			allPaymentMethods: paymentMethods,
			disabledPaymentMethodIds,
			setDisabledPaymentMethodIds,
			paymentMethodId,
			setPaymentMethodId,
			transactionStatusManager,
			paymentProcessors,
			onPageLoadError,
			onPaymentMethodChanged,
		} ),
		[
			paymentMethodId,
			paymentMethods,
			disabledPaymentMethodIds,
			transactionStatusManager,
			paymentProcessors,
			onPageLoadError,
			onPaymentMethodChanged,
		]
	);

	const { __ } = useI18n();
	const errorMessage = __( 'Sorry, there was an error loading this page.' );
	const onLoadError = useCallback(
		( error: Error ) => {
			onPageLoadError?.( 'page_load', error );
		},
		[ onPageLoadError ]
	);
	return (
		<CheckoutErrorBoundary errorMessage={ errorMessage } onError={ onLoadError }>
			<CheckoutProviderPropValidator propsToValidate={ propsToValidate } />
			<ThemeProvider theme={ theme || defaultTheme }>
				<LineItemsProvider items={ items } total={ total }>
					<FormStatusProvider formStatusManager={ formStatusManager }>
						<CheckoutContext.Provider value={ value }>
							<TransactionStatusHandler redirectToUrl={ redirectToUrl } />
							{ children }
						</CheckoutContext.Provider>
					</FormStatusProvider>
				</LineItemsProvider>
			</ThemeProvider>
		</CheckoutErrorBoundary>
	);
}

/**
 * Even though CheckoutProvider is TypeScript, it's possible for consumers to
 * misuse it in ways that are not easy to debug. This helper component throws
 * errors if the props are not what they should be.
 */
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

// When form status or transaction status changes, call the appropriate callbacks.
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
	// Store the callbacks as refs so we do not call them more than once if they
	// are anonymous functions. This way they are only called when the
	// transactionStatus/formStatus changes, which is what we really want.
	const paymentCompleteRef = useRef( onPaymentComplete );
	paymentCompleteRef.current = onPaymentComplete;
	const paymentRedirectRef = useRef( onPaymentRedirect );
	paymentRedirectRef.current = onPaymentRedirect;
	const paymentErrorRef = useRef( onPaymentError );
	paymentErrorRef.current = onPaymentError;

	const prevFormStatus = useRef< FormStatus >();
	const prevTransactionStatus = useRef< TransactionStatus >();

	useEffect( () => {
		if (
			paymentCompleteRef.current &&
			formStatus === FormStatus.COMPLETE &&
			formStatus !== prevFormStatus.current
		) {
			debug( "form status changed to complete so I'm calling onPaymentComplete" );
			paymentCompleteRef.current( { paymentMethodId, transactionLastResponse } );
		}
		prevFormStatus.current = formStatus;
	}, [ formStatus, transactionLastResponse, paymentMethodId ] );

	useEffect( () => {
		if (
			paymentRedirectRef.current &&
			transactionStatus === TransactionStatus.REDIRECTING &&
			transactionStatus !== prevTransactionStatus.current
		) {
			debug( "transaction status changed to redirecting so I'm calling onPaymentRedirect" );
			paymentRedirectRef.current( { paymentMethodId, transactionLastResponse } );
		}
		if (
			paymentErrorRef.current &&
			transactionStatus === TransactionStatus.ERROR &&
			transactionStatus !== prevTransactionStatus.current
		) {
			debug( "transaction status changed to error so I'm calling onPaymentError" );
			paymentErrorRef.current( { paymentMethodId, transactionError } );
		}
		prevTransactionStatus.current = transactionStatus;
	}, [ transactionStatus, paymentMethodId, transactionLastResponse, transactionError ] );
}

// Reset the selected payment method if the list of payment methods changes.
function useResetSelectedPaymentMethodWhenListChanges(
	availablePaymentMethodIds: string[],
	initiallySelectedPaymentMethodId: string | null,
	setPaymentMethodId: ( id: string | null ) => void
) {
	const hashKey = availablePaymentMethodIds.join( '-_-' );
	const previousKey = useRef< string >();

	useEffect( () => {
		if ( previousKey.current !== hashKey ) {
			debug(
				'paymentMethods changed; setting payment method to initial selection ',
				initiallySelectedPaymentMethodId
			);

			previousKey.current = hashKey;
			setPaymentMethodId( initiallySelectedPaymentMethodId );
		}
	}, [ hashKey, setPaymentMethodId, initiallySelectedPaymentMethodId ] );
}
