import { useCallback, useEffect, useRef, useState } from 'react';
import { useDomainSearch } from '../components/domain-search';

export const useFocusedCartAction = ( action: () => void ) => {
	const { cart } = useDomainSearch();
	const [ isBusy, setIsBusy ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState< string | null >( null );

	const initiatedByThisComponent = useRef( false );

	useEffect( () => {
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
