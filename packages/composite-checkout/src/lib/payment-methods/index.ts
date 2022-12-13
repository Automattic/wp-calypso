import debugFactory from 'debug';
import { useContext, useMemo } from 'react';
import { PaymentMethod } from '../../types';
import CheckoutContext from '../checkout-context';

const debug = debugFactory( 'composite-checkout:payment-methods' );

export function usePaymentMethodId(): [ string | null, ( id: string ) => void ] {
	const { paymentMethodId, setPaymentMethodId } = useContext( CheckoutContext );
	if ( ! setPaymentMethodId ) {
		throw new Error( 'usePaymentMethodId can only be used inside a CheckoutProvider' );
	}
	return [ paymentMethodId, setPaymentMethodId ];
}

export function usePaymentMethod(): PaymentMethod | null {
	const { paymentMethodId, setPaymentMethodId } = useContext( CheckoutContext );
	const allPaymentMethods = useAllPaymentMethods();
	if ( ! setPaymentMethodId ) {
		throw new Error( 'usePaymentMethod can only be used inside a CheckoutProvider' );
	}
	if ( ! paymentMethodId ) {
		return null;
	}
	const paymentMethod = allPaymentMethods.find( ( { id } ) => id === paymentMethodId );
	if ( ! paymentMethod ) {
		debug( `No payment method found matching id '${ paymentMethodId }' in`, allPaymentMethods );
		return null;
	}
	return paymentMethod;
}

export function useAllPaymentMethods() {
	const { allPaymentMethods } = useContext( CheckoutContext );
	if ( ! allPaymentMethods ) {
		throw new Error( 'useAllPaymentMethods cannot be used outside of CheckoutProvider' );
	}
	return allPaymentMethods;
}

export function useAvailablePaymentMethodIds(): string[] {
	const { allPaymentMethods, disabledPaymentMethodIds } = useContext( CheckoutContext );
	if ( ! allPaymentMethods ) {
		throw new Error( 'useAvailablePaymentMethodIds cannot be used outside of CheckoutProvider' );
	}
	const paymentMethodIds = allPaymentMethods.map( ( method ) => method.id );
	const availablePaymentMethodIds = useMemo(
		() => paymentMethodIds.filter( ( id ) => ! disabledPaymentMethodIds.includes( id ) ),
		[ paymentMethodIds, disabledPaymentMethodIds ]
	);
	debug( 'Returning available payment methods', availablePaymentMethodIds );
	return availablePaymentMethodIds;
}

export function useTogglePaymentMethod(): ( paymentMethodId: string, available: boolean ) => void {
	const { allPaymentMethods, disabledPaymentMethodIds, setDisabledPaymentMethodIds } =
		useContext( CheckoutContext );
	if ( ! allPaymentMethods ) {
		throw new Error( 'useTogglePaymentMethod cannot be used outside of CheckoutProvider' );
	}
	return ( paymentMethodId: string, available: boolean ) => {
		const paymentMethod = allPaymentMethods.find( ( { id } ) => id === paymentMethodId );
		if ( ! paymentMethod ) {
			debug( `No payment method found matching id '${ paymentMethodId }' in`, allPaymentMethods );
			return;
		}

		if ( available && disabledPaymentMethodIds.includes( paymentMethodId ) ) {
			debug( 'Adding available payment method', paymentMethodId );
			setDisabledPaymentMethodIds(
				disabledPaymentMethodIds.filter( ( id ) => id !== paymentMethodId )
			);
		}

		if ( ! available && ! disabledPaymentMethodIds.includes( paymentMethodId ) ) {
			debug( 'Removing available payment method', paymentMethodId );
			setDisabledPaymentMethodIds( [ ...disabledPaymentMethodIds, paymentMethodId ] );
		}
	};
}
