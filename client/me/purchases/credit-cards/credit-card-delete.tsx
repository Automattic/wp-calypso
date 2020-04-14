/**
 * External dependencies
 */

import React, { FunctionComponent, useState, useCallback } from 'react';
import { connect } from 'react-redux';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { deleteStoredCard } from 'state/stored-cards/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { isDeletingStoredCard } from 'state/stored-cards/selectors';
import { Button } from '@automattic/components';
import { isPaymentAgreement, getPaymentMethodSummary } from 'lib/checkout/payment-methods';
import StoredCard from 'components/credit-card/stored-card';
import PaymentMethodDeleteDialog from './payment-method-delete-dialog';

/**
 * Style dependencies
 */
import './credit-card-delete.scss';

interface Card {
	card?: string;
	email: string;
	card_type?: string;
	payment_partner: string;
	name: string;
	expiry: string;
	stored_details_id: string;
}

interface Props {
	card: Card;
	errorNotice: ( msg: TranslateResult ) => void;
	successNotice: ( msg: TranslateResult ) => void;
	deleteStoredCard: ( card: Card ) => Promise< void >;
	isDeleting: boolean;
}

const CreditCardDelete: FunctionComponent< Props > = props => {
	const translate = useTranslate();
	const [ isDialogVisible, setIsDialogVisible ] = useState( false );

	const closeDialog = useCallback( () => setIsDialogVisible( false ), [] );

	const handleDelete = useCallback( () => {
		closeDialog();
		props
			.deleteStoredCard( props.card )
			.then( () => {
				if ( isPaymentAgreement( props.card ) ) {
					props.successNotice( translate( 'Payment method deleted successfully' ) );
				} else {
					props.successNotice( translate( 'Card deleted successfully' ) );
				}
			} )
			.catch( ( error: Error ) => {
				errorNotice( error.message );
			} );
	}, [ closeDialog, props, translate ] );

	const renderDeleteButton = () => {
		const text = props.isDeleting ? translate( 'Deleting…' ) : translate( 'Delete' );

		return (
			<Button
				className="credit-cards__delete-button"
				disabled={ props.isDeleting }
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
					type: props.card.card_type || props.card.payment_partner,
					digits: props.card.card,
					email: props.card.email,
				} ) }
				isVisible={ isDialogVisible }
				onClose={ closeDialog }
				onConfirm={ handleDelete }
			/>
			<StoredCard
				lastDigits={ props.card.card }
				email={ props.card.email }
				cardType={ props.card.card_type || '' }
				paymentPartner={ props.card.payment_partner }
				name={ props.card.name }
				expiry={ props.card.expiry }
			/>
			{ renderDeleteButton() }
		</div>
	);
};

interface OwnProps {
	card: Card;
}

export default connect< {}, {}, OwnProps >(
	( state, props ) => ( {
		isDeleting: isDeletingStoredCard( state, props.card.stored_details_id ),
	} ),
	{
		deleteStoredCard,
		errorNotice,
		successNotice,
	}
)( CreditCardDelete );
