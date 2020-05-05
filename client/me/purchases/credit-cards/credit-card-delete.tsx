/**
 * External dependencies
 */

import React, { FunctionComponent, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { ReduxDispatch } from 'state/redux-store';
import { deleteStoredCard } from 'state/stored-cards/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { isDeletingStoredCard } from 'state/stored-cards/selectors';
import { Button } from '@automattic/components';
import {
	isPaymentAgreement,
	getPaymentMethodSummary,
	PaymentMethod,
} from 'lib/checkout/payment-methods';
import StoredCard from 'components/credit-card/stored-card';
import PaymentMethodDeleteDialog from './payment-method-delete-dialog';

/**
 * Style dependencies
 */
import './credit-card-delete.scss';

interface Props {
	card: PaymentMethod;
}

const CreditCardDelete: FunctionComponent< Props > = ( { card } ) => {
	const translate = useTranslate();
	const isDeleting = useSelector( ( state ) =>
		isDeletingStoredCard( state, card.stored_details_id )
	);
	const reduxDispatch = useDispatch< ReduxDispatch >();
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
			} )
			.catch( ( error: Error ) => {
				reduxDispatch( errorNotice( error.message ) );
			} );
	}, [ closeDialog, card, translate, reduxDispatch ] );

	const renderDeleteButton = () => {
		const text = isDeleting ? translate( 'Deleting…' ) : translate( 'Delete' );

		return (
			<Button
				className="credit-cards__delete-button"
				disabled={ isDeleting }
				onClick={ () => setIsDialogVisible( true ) }
			>
				{ text }
			</Button>
		);
	};

	return (
		<div className="credit-cards__credit-card-delete">
			<PaymentMethodDeleteDialog
				paymentMethodSummary={ getPaymentMethodSummary( {
					translate,
					type: card.card_type || card.payment_partner,
					digits: card.card,
					email: card.email,
				} ) }
				isVisible={ isDialogVisible }
				onClose={ closeDialog }
				onConfirm={ handleDelete }
			/>
			<StoredCard
				lastDigits={ card.card }
				email={ card.email }
				cardType={ card.card_type || '' }
				paymentPartner={ card.payment_partner }
				name={ card.name }
				expiry={ card.expiry }
			/>
			{ renderDeleteButton() }
		</div>
	);
};

export default CreditCardDelete;
