import debugFactory from 'debug';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { PaymentMethodProviderContext } from '../lib/payment-method-provider-context';
import type {
	PaymentMethod,
	PaymentMethodChangedCallback,
	PaymentMethodProviderContextInterface,
	PaymentProcessorProp,
} from '../types';

const debug = debugFactory( 'composite-checkout:payment-method-provider' );

export function PaymentMethodProvider( {
	paymentMethods,
	paymentProcessors,
	selectFirstAvailablePaymentMethod,
	initiallySelectedPaymentMethodId,
	onPaymentMethodChanged,
	children,
}: {
	paymentMethods: PaymentMethod[];
	paymentProcessors: PaymentProcessorProp;
	selectFirstAvailablePaymentMethod?: boolean;
	initiallySelectedPaymentMethodId?: string | null;
	onPaymentMethodChanged?: PaymentMethodChangedCallback;
	children: React.ReactNode;
} ) {
	// Keep track of enabled/disabled payment methods.
	const [ disabledPaymentMethodIds, setDisabledPaymentMethodIds ] = useState< string[] >(
		paymentMethods.filter( ( method ) => method.isInitiallyDisabled ).map( ( method ) => method.id )
	);
	const availablePaymentMethodIds = paymentMethods
		.filter( ( method ) => ! disabledPaymentMethodIds.includes( method.id ) )
		.map( ( method ) => method.id );

	// Keep track of loading payment methods.
	const [ loadingPaymentMethodIds, setLoadingPaymentMethodIds ] = useState< string[] >( [] );

	// Automatically select first payment method unless explicitly set or disabled.
	if (
		selectFirstAvailablePaymentMethod &&
		! initiallySelectedPaymentMethodId &&
		availablePaymentMethodIds.length > 0
	) {
		initiallySelectedPaymentMethodId = availablePaymentMethodIds[ 0 ];
	}

	// Keep track of selected payment method.
	const [ paymentMethodId, setPaymentMethodId ] = useState< string | null | undefined >(
		initiallySelectedPaymentMethodId
	);

	// Remember which method the user explicitly picked (as opposed to one
	// selected automatically) so that a late change to the list of available
	// methods does not discard their choice.
	const userSelectedPaymentMethodId = useRef< string | null >( null );
	const setPaymentMethodIdFromUser = useCallback( ( id: string ) => {
		userSelectedPaymentMethodId.current = id;
		setPaymentMethodId( id );
	}, [] );

	useDisablePaymentMethodsWhenListChanges( paymentMethods, setDisabledPaymentMethodIds );

	// Reset the selected payment method if the list of payment methods changes.
	useResetSelectedPaymentMethodWhenListChanges(
		availablePaymentMethodIds,
		initiallySelectedPaymentMethodId,
		setPaymentMethodId,
		userSelectedPaymentMethodId
	);

	const value: PaymentMethodProviderContextInterface = useMemo(
		() => ( {
			allPaymentMethods: paymentMethods,
			paymentProcessors,
			disabledPaymentMethodIds,
			setDisabledPaymentMethodIds,
			paymentMethodId,
			setPaymentMethodId: setPaymentMethodIdFromUser,
			onPaymentMethodChanged,
			loadingPaymentMethodIds,
			setLoadingPaymentMethodIds,
		} ),
		[
			paymentMethodId,
			setPaymentMethodIdFromUser,
			paymentMethods,
			disabledPaymentMethodIds,
			onPaymentMethodChanged,
			paymentProcessors,
			loadingPaymentMethodIds,
		]
	);

	return (
		<PaymentMethodProviderContext.Provider value={ value }>
			{ children }
		</PaymentMethodProviderContext.Provider>
	);
}

function useDisablePaymentMethodsWhenListChanges(
	paymentMethods: PaymentMethod[],
	setDisabledPaymentMethodIds: ( setter: ( ids: string[] ) => string[] ) => void
) {
	const previousPaymentMethodIds = useRef< string[] >( [] );

	const initiallyDisabledPaymentMethodIds = paymentMethods
		.filter( ( method ) => method.isInitiallyDisabled )
		.map( ( method ) => method.id );

	const newInitiallyDisabledPaymentMethodIds = initiallyDisabledPaymentMethodIds.filter(
		( id ) => ! previousPaymentMethodIds.current.includes( id )
	);

	const paymentMethodIdsHash = paymentMethods.map( ( method ) => method.id ).join( '-_-' );
	const previousPaymentMethodIdsHash = useRef< string >( undefined );

	useEffect( () => {
		if ( previousPaymentMethodIdsHash.current !== paymentMethodIdsHash ) {
			debug( 'paymentMethods changed; disabling any new isInitiallyDisabled payment methods' );

			setDisabledPaymentMethodIds( ( currentlyDisabledIds: string[] ) => [
				...currentlyDisabledIds,
				...newInitiallyDisabledPaymentMethodIds,
			] );
			previousPaymentMethodIdsHash.current = paymentMethodIdsHash;
			previousPaymentMethodIds.current = paymentMethods.map( ( method ) => method.id );
		}
	}, [
		paymentMethodIdsHash,
		setDisabledPaymentMethodIds,
		paymentMethods,
		newInitiallyDisabledPaymentMethodIds,
	] );
}

// Reset the selected payment method if the list of payment methods changes,
// unless the user explicitly picked a method that is still available (for
// example, a wallet that becomes available after the user has already started
// filling in the credit card form must not close that form).
function useResetSelectedPaymentMethodWhenListChanges(
	availablePaymentMethodIds: string[],
	initiallySelectedPaymentMethodId: string | null | undefined,
	setPaymentMethodId: ( id: string | null | undefined ) => void,
	userSelectedPaymentMethodId: React.MutableRefObject< string | null >
) {
	const hashKey = availablePaymentMethodIds.join( '-_-' );
	const previousKey = useRef< string >( undefined );

	useEffect( () => {
		if ( previousKey.current === hashKey ) {
			return;
		}
		previousKey.current = hashKey;

		const userSelection = userSelectedPaymentMethodId.current;
		if ( userSelection && hashKey.split( '-_-' ).includes( userSelection ) ) {
			debug( 'paymentMethods changed; keeping user-selected payment method', userSelection );
			return;
		}

		debug(
			'paymentMethods changed; setting payment method to initial selection ',
			initiallySelectedPaymentMethodId
		);
		userSelectedPaymentMethodId.current = null;
		setPaymentMethodId( initiallySelectedPaymentMethodId );
	}, [
		hashKey,
		setPaymentMethodId,
		initiallySelectedPaymentMethodId,
		userSelectedPaymentMethodId,
	] );
}
