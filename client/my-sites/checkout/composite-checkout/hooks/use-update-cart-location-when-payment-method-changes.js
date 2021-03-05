/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';

export default function useUpdateCartLocationWhenPaymentMethodChanges(
	activePaymentMethod,
	updateCartContactDetails
) {
	const previousPaymentMethodId = useRef();
	const hasInitialized = useRef( false );
	useEffect( () => {
		if ( activePaymentMethod?.id && activePaymentMethod.id !== previousPaymentMethodId.current ) {
			previousPaymentMethodId.current = activePaymentMethod.id;
			if ( hasInitialized.current ) {
				updateCartContactDetails();
			}
			hasInitialized.current = true;
		}
	}, [ activePaymentMethod, updateCartContactDetails ] );
}
