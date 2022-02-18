import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PaymentMethodDeleteDialog from 'calypso/jetpack-cloud/sections/partner-portal/payment-method-delete-dialog';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { getPaymentMethodSummary, PaymentMethod } from 'calypso/lib/checkout/payment-methods';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { deleteStoredCard } from 'calypso/state/stored-cards/actions';
import { isDeletingStoredCard } from 'calypso/state/stored-cards/selectors';
import type { CalypsoDispatch } from 'calypso/state/types';

interface Props {
	card: PaymentMethod;
}

const StoredPaymentMethodDelete: FunctionComponent< Props > = ( { card } ) => {
	const translate = useTranslate();
	const isDeleting = useSelector( ( state ) =>
		isDeletingStoredCard( state, card.stored_details_id )
	);
	const reduxDispatch = useDispatch< CalypsoDispatch >();
	const [ isDialogVisible, setIsDialogVisible ] = useState( false );
	const closeDialog = useCallback( () => setIsDialogVisible( false ), [] );

	const handleDelete = useCallback( () => {
		closeDialog();
		reduxDispatch( deleteStoredCard( card ) )
			.then( () => {
				reduxDispatch( successNotice( translate( 'Payment method deleted successfully' ) ) );

				recordTracksEvent( 'calypso_partner_portal_delete_payment_method' );
			} )
			.catch( ( error: Error ) => {
				reduxDispatch( errorNotice( error.message ) );
			} );
	}, [ closeDialog, card, translate, reduxDispatch ] );

	const renderDeleteButton = () => {
		const text = isDeleting ? translate( 'Deleting…' ) : translate( 'Delete' );

		return (
			<Button disabled={ isDeleting } onClick={ () => setIsDialogVisible( true ) }>
				{ text }
			</Button>
		);
	};

	return (
		<>
			<PaymentMethodDeleteDialog
				paymentMethodSummary={ getPaymentMethodSummary( {
					translate,
					type: card.card_type || card.payment_partner,
					digits: card.card,
				} ) }
				isVisible={ isDialogVisible }
				onClose={ closeDialog }
				onConfirm={ handleDelete }
			/>
			{ renderDeleteButton() }
		</>
	);
};

export default StoredPaymentMethodDelete;
