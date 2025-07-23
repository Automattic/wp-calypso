import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDomainSearch } from '../components/domain-search';

/**
 * A hook that manages loading and error states for cart actions.
 * It tracks whether the action was initiated by this component to avoid
 * responding to cart updates from other sources.
 *
 * It is necessary because the cart operations aren't specific,
 * so this is the workaround to 'know' which row triggered
 * the operation and only show the message in it.
 */
export const useFocusedCartAction = ( action: () => void ) => {
	const { cart } = useDomainSearch();
	const [ isBusy, setIsBusy ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState< string | null >( null );

	const initiatedByThisComponent = useRef( false );

	useLayoutEffect( () => {
		if ( ! cart.errorMessage ) {
			setErrorMessage( null );
		}
	}, [ cart.errorMessage ] );

	useEffect( () => {
		if ( ! initiatedByThisComponent.current ) {
			return;
		}

		if ( cart.isBusy ) {
			setIsBusy( true );
			setErrorMessage( null );

			return;
		}

		initiatedByThisComponent.current = false;

		setIsBusy( false );
		setErrorMessage( cart.errorMessage );
	}, [ cart.isBusy, cart.errorMessage ] );

	const callback = async () => {
		initiatedByThisComponent.current = true;
		action();
	};

	const removeErrorMessage = useCallback( () => {
		setErrorMessage( null );
	}, [] );

	return { isBusy, errorMessage, removeErrorMessage, callback };
};
