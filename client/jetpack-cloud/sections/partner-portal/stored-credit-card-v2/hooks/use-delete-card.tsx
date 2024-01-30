import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { deleteStoredCard } from 'calypso/state/partner-portal/stored-cards/actions';
import { useRecentPaymentMethodsQuery } from '../../hooks';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

const NOTIFICATION_DURATION = 3000;

export function useDeleteCard( card: PaymentMethod ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const [ isDeleteDialogVisible, setIsDeleteDialogVisible ] = useState( false );
	const [ isDeleteInProgress, setIsDeleteInProgress ] = useState( false );

	const { data: recentCards } = useRecentPaymentMethodsQuery();

	const nextPrimaryPaymentMethod = ( recentCards?.items || [] ).find(
		( currCard: PaymentMethod ) => currCard.id !== card.id
	);

	const closeDialog = useCallback( () => {
		setIsDeleteDialogVisible( false );
	}, [] );

	const handleDelete = useCallback( () => {
		closeDialog();
		setIsDeleteInProgress( true );
		dispatch( deleteStoredCard( card, nextPrimaryPaymentMethod?.id ) )
			.then( () => {
				setIsDeleteInProgress( false );
				dispatch(
					successNotice( translate( 'Payment method deleted successfully' ), {
						duration: NOTIFICATION_DURATION,
						id: 'payment-method-deleted-successfully',
					} )
				);
				dispatch( recordTracksEvent( 'calypso_partner_portal_delete_payment_method' ) );
			} )
			.catch( ( error: Error ) => {
				setIsDeleteInProgress( false );
				dispatch(
					errorNotice( error.message, {
						duration: NOTIFICATION_DURATION,
						id: 'payment-method-deleted-error',
					} )
				);
			} );
	}, [ closeDialog, dispatch, card, nextPrimaryPaymentMethod?.id, translate ] );

	return {
		isDeleteDialogVisible,
		setIsDeleteDialogVisible,
		closeDialog,
		handleDelete,
		isDeleteInProgress,
	};
}
