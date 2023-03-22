import { Button } from '@automattic/components';
import { sprintf } from '@wordpress/i18n';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isPaymentAgreement, PaymentMethodSummary } from 'calypso/lib/checkout/payment-methods';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/composite-checkout/hooks/use-stored-payment-methods';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import PaymentMethodDeleteDialog from './payment-method-delete-dialog';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import type { CalypsoDispatch } from 'calypso/state/types';

interface Props {
	card: StoredPaymentMethod;
}

const PaymentMethodDelete: FunctionComponent< Props > = ( { card } ) => {
	const translate = useTranslate();
	const { isDeleting, deletePaymentMethod } = useStoredPaymentMethods();
	const reduxDispatch = useDispatch< CalypsoDispatch >();
	const [ isDialogVisible, setIsDialogVisible ] = useState( false );
	const closeDialog = useCallback( () => setIsDialogVisible( false ), [] );

	const handleDelete = useCallback( () => {
		closeDialog();
		deletePaymentMethod( card.stored_details_id )
			.then( () => {
				if ( isPaymentAgreement( card ) ) {
					reduxDispatch( successNotice( translate( 'Payment method deleted successfully' ) ) );
				} else {
					reduxDispatch( successNotice( translate( 'Card deleted successfully' ) ) );
				}

				recordTracksEvent( 'calypso_purchases_delete_payment_method' );
			} )
			.catch( ( error: Error ) => {
				reduxDispatch( errorNotice( error.message ) );
			} );
	}, [ deletePaymentMethod, closeDialog, card, translate, reduxDispatch ] );

	const renderDeleteButton = () => {
		const text = isDeleting ? translate( 'Deleting…' ) : translate( 'Delete this payment method' );
		const ariaText = isDeleting
			? translate( 'Deleting…' )
			: /* translators: %s is the name of the payment method (usually the last 4 digits of the card but could be a proper name for PayPal). */
			  sprintf(
					translate( 'Delete the "%s" payment method' ),
					'card_last_4' in card ? card.card_last_4 : card.name
			  );

		return (
			<Button
				aria-label={ ariaText }
				className="payment-method-delete__button"
				disabled={ isDeleting }
				onClick={ () => setIsDialogVisible( true ) }
				scary
				borderless
			>
				{ text }
			</Button>
		);
	};

	return (
		<div className="payment-method-delete">
			<PaymentMethodDeleteDialog
				paymentMethodSummary={
					<PaymentMethodSummary
						type={ 'card_type' in card ? card.card_type : card.payment_partner }
						digits={ 'card_last_4' in card ? card.card_last_4 : undefined }
						email={ card.email }
					/>
				}
				isVisible={ isDialogVisible }
				onClose={ closeDialog }
				onConfirm={ handleDelete }
			/>
			{ renderDeleteButton() }
		</div>
	);
};

export default PaymentMethodDelete;
