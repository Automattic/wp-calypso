/**
 * External dependencies
 */
import React, { ReactElement, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import { PaymentLogo } from '@automattic/composite-checkout';
import Gridicon from 'calypso/components/gridicon';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { getFormattedExpiryDate } from 'calypso/jetpack-cloud/sections/partner-portal/utils';
import { CreditCard } from 'calypso/state/partner-portal/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { deleteStoredCard } from 'calypso/state/stored-cards/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface CardDetailsProps {
	title: TranslateResult | string;
	lastFour: string;
	date: string;
	brand: string;
}

function CardDetails( { title, lastFour, date, brand }: CardDetailsProps ): ReactElement {
	return (
		<div className="delete-payment-method-dialog__card-details">
			<h3>{ title }</h3>
			<div className="delete-payment-method-dialog__credit-card">
				<span className="delete-payment-method-dialog__brand-logo">
					<PaymentLogo brand={ brand } isSummary={ true } />
				</span>
				<span>{ `**** **** **** ${ lastFour }` }</span>
				<span>{ date }</span>
			</div>
		</div>
	);
}

interface Props {
	availableCards: CreditCard[];
	cardToDelete: CreditCard;
	onClose: () => void;
}

export default function DeletePaymentMethodDialog( {
	availableCards,
	cardToDelete,
	onClose,
	...rest
}: Props ): ReactElement {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const expiryDate = getFormattedExpiryDate( cardToDelete.expiry );
	const hasMultipleAvailableCards = availableCards.length > 1;
	const nextAvailableCard = hasMultipleAvailableCards
		? availableCards.find( ( card ) => card.stored_details_id !== cardToDelete.stored_details_id )
		: null;
	const isPrimaryCard = false;

	const handleDelete = useCallback( () => {
		dispatch( deleteStoredCard( cardToDelete ) )
			.then( () => {
				dispatch( successNotice( translate( 'Card deleted successfully' ) ) );
				page( '/partner-portal/payment-method/' );

				// recordTracksEvent( '' );
			} )
			.catch( ( error: Error ) => {
				dispatch( errorNotice( error.message ) );
			} );
		onClose();
	}, [ onClose, cardToDelete, translate, dispatch ] );

	const deleteButton = (
		<Button primary scary busy={ false } onClick={ handleDelete }>
			{ translate( 'Delete Payment Method' ) }
		</Button>
	);
	const addPaymentMethodButton = (
		<Button href="/partner-portal/payment-method/card" primary busy={ false } onClick={ onClose }>
			{ translate( 'Add a new payment method' ) }
		</Button>
	);

	const buttons = [
		<Button disabled={ false } onClick={ onClose }>
			{ translate( 'Go back' ) }
		</Button>,

		...( hasMultipleAvailableCards ? [ deleteButton ] : [ addPaymentMethodButton ] ),
	];

	return (
		<Dialog
			isVisible={ true }
			buttons={ buttons }
			additionalClassNames="delete-payment-method-dialog"
			onClose={ onClose }
			{ ...rest }
		>
			<h2 className="delete-payment-method-dialog__heading">
				{ translate( 'Delete Payment Method' ) }
			</h2>

			<p>
				{ ! hasMultipleAvailableCards &&
					translate(
						'Cannot delete payment method. You only have one payment method associated with your account. In order to remove this credit card, please add another one first or revoke existing licenses.'
					) }
				{ hasMultipleAvailableCards &&
					isPrimaryCard &&
					translate(
						'You are about to delete a payment method. In this case all your auto payments will be switched to your secondary payment method.'
					) }
			</p>

			<CardDetails
				title={
					hasMultipleAvailableCards
						? translate( 'Deleting' )
						: translate( 'Current Payment Method' )
				}
				brand={ cardToDelete.card_type }
				lastFour={ cardToDelete.card }
				date={ expiryDate }
			/>

			{ hasMultipleAvailableCards && nextAvailableCard && isPrimaryCard && (
				<CardDetails
					title={ translate( 'Your primary payment method will automatically switch to' ) }
					brand={ nextAvailableCard.card_type }
					lastFour={ nextAvailableCard.card }
					date={ getFormattedExpiryDate( nextAvailableCard.expiry ) }
				/>
			) }
		</Dialog>
	);
}
