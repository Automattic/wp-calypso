import { Button } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { FunctionComponent, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	isPaymentAgreement,
	PaymentMethodSummary,
	PaymentMethod,
} from 'calypso/lib/checkout/payment-methods';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { deleteStoredCard } from 'calypso/state/stored-cards/actions';
import { isDeletingStoredCard } from 'calypso/state/stored-cards/selectors';
import PaymentMethodDeleteDialog from './payment-method-delete-dialog';
import type { CalypsoDispatch, IAppState } from 'calypso/state/types';

interface Props {
	card: PaymentMethod;
}

const PaymentMethodDelete: FunctionComponent< Props > = ( { card } ) => {
	const translate = useTranslate();
	const isDeleting = useSelector( ( state: IAppState ) =>
		isDeletingStoredCard( state, card.stored_details_id )
	);
	const reduxDispatch = useDispatch< CalypsoDispatch >();
	const [ isDialogVisible, setIsDialogVisible ] = useState( false );
	const closeDialog = useCallback( () => setIsDialogVisible( false ), [] );

	const handleDelete = useCallback( () => {
		closeDialog();
		reduxDispatch( deleteStoredCard( card ) )
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
	}, [ closeDialog, card, translate, reduxDispatch ] );

	const renderDeleteButton = () => {
		const text = isDeleting ? translate( 'Deleting…' ) : translate( 'Delete this payment method' );

		return (
			<Button
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
						type={ card.card_type || card.payment_partner }
						digits={ card.card }
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
