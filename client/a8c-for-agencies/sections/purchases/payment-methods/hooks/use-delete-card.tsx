import { useCallback, useState } from 'react';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

export function useDeleteCard( card: PaymentMethod ) {
	const [ isDeleteDialogVisible, setIsDeleteDialogVisible ] = useState( false );
	const [ isDeleteInProgress ] = useState( false );

	const handleDelete = useCallback( () => {
		setIsDeleteDialogVisible( false );

		// FIXME: Need to implement the actual API call.
		card;
	}, [ card ] );

	return {
		isDeleteDialogVisible,
		setIsDeleteDialogVisible,
		handleDelete,
		isDeleteInProgress,
	};
}
