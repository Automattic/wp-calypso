import debugFactory from 'debug';
import { useState, useRef, useEffect, useMemo } from 'react';
import { PaymentMethodProviderContext } from '../lib/payment-method-provider-context';
import type {
	PaymentMethod,
	PaymentMethodChangedCallback,
	PaymentMethodProviderContextInterface,
} from '../types';

const debug = debugFactory( 'composite-checkout:payment-method-provider' );

export function PaymentMethodProvider( {
	paymentMethods,
	selectFirstAvailablePaymentMethod,
	initiallySelectedPaymentMethodId,
	onPaymentMethodChanged,
	children,
}: {
	paymentMethods: PaymentMethod[];
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

	useDisablePaymentMethodsWhenListChanges( paymentMethods, setDisabledPaymentMethodIds );

	// Reset the selected payment method if the list of payment methods changes.
	useResetSelectedPaymentMethodWhenListChanges(
		availablePaymentMethodIds,
		initiallySelectedPaymentMethodId,
		setPaymentMethodId
	);

	const value: PaymentMethodProviderContextInterface = useMemo(
		() => ( {
			allPaymentMethods: paymentMethods,
			disabledPaymentMethodIds,
			setDisabledPaymentMethodIds,
			paymentMethodId,
			setPaymentMethodId,
			onPaymentMethodChanged,
		} ),
		[ paymentMethodId, paymentMethods, disabledPaymentMethodIds, onPaymentMethodChanged ]
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
	const previousPaymentMethodIdsHash = useRef< string >();

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

// Reset the selected payment method if the list of payment methods changes.
function useResetSelectedPaymentMethodWhenListChanges(
	availablePaymentMethodIds: string[],
	initiallySelectedPaymentMethodId: string | null | undefined,
	setPaymentMethodId: ( id: string | null | undefined ) => void
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
