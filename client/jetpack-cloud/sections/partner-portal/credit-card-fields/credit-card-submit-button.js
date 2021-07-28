/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import debugFactory from 'debug';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';

/**
 * Internal dependencies
 */
import {
	FormStatus,
	useLineItems,
	useEvents,
	useFormStatus,
	useSelect,
} from '@automattic/composite-checkout';
import { Button } from '@automattic/components';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

const debug = debugFactory( 'calypso:composite-checkout:credit-card' );

export default function CreditCardSubmitButton( {
	disabled,
	onClick,
	store,
	stripe,
	stripeConfiguration,
	activeButtonText = undefined,
} ) {
	const { __ } = useI18n();
	const dispatch = useDispatch();
	const [ items, total ] = useLineItems();
	const fields = useSelect( ( select ) => select( 'credit-card' ).getFields() );
	const cardholderName = fields.cardholderName;
	const cardholderEmail = fields.cardholderEmail;
	const cardholderPhone = fields.cardholderPhone;
	const { formStatus } = useFormStatus();
	const onEvent = useEvents();
	const paymentPartner = 'stripe';

	const onSubmitButtonClick = () => {
		if ( isCreditCardFormValid( store, paymentPartner, __ ) && paymentPartner === 'stripe' ) {
			debug( 'submitting stripe payment' );
			dispatch(
				recordTracksEvent( 'calypso_partner_portal_payment_method_card_submit_button_click' )
			);
			onEvent( { type: 'STRIPE_TRANSACTION_BEGIN' } );
			onClick( 'card', {
				stripe,
				name: cardholderName?.value,
				email: cardholderEmail?.value,
				phone: cardholderPhone?.value,
				items,
				total,
				stripeConfiguration,
				paymentPartner,
			} );
			return;
		}
		throw new Error( `Unrecognized payment partner in submit handler: '${ paymentPartner }'` );
	};

	return (
		<Button
			primary
			disabled={ disabled }
			onClick={ onSubmitButtonClick }
			busy={ FormStatus.SUBMITTING === formStatus }
		>
			<ButtonContents
				formStatus={ formStatus }
				total={ total }
				activeButtonText={ activeButtonText }
			/>
		</Button>
	);
}

function ButtonContents( { formStatus, total, activeButtonText = undefined } ) {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return __( 'Processing…' );
	}
	if ( formStatus === FormStatus.READY ) {
		/* translators: %s is the total to be paid in localized currency */
		return activeButtonText || sprintf( __( 'Pay %s' ), total.amount.displayValue );
	}
	return __( 'Please wait…' );
}

function isCreditCardFormValid( store, paymentPartner, __ ) {
	debug( 'validating credit card fields' );

	switch ( paymentPartner ) {
		case 'stripe': {
			const fields = store.selectors.getFields( store.getState() );
			const cardholderName = fields.cardholderName;
			if ( ! cardholderName?.value.length ) {
				// Touch the field so it displays a validation error
				store.dispatch( store.actions.setFieldValue( 'cardholderName', '' ) );
			}
			const errors = store.selectors.getCardDataErrors( store.getState() );
			const incompleteFieldKeys = store.selectors.getIncompleteFieldKeys( store.getState() );
			const areThereErrors = Object.keys( errors ).some( ( errorKey ) => errors[ errorKey ] );

			if ( incompleteFieldKeys.length > 0 ) {
				// Show "this field is required" for each incomplete field
				incompleteFieldKeys.map( ( key ) =>
					store.dispatch( store.actions.setCardDataError( key, __( 'This field is required' ) ) )
				);
			}
			if ( areThereErrors || ! cardholderName?.value.length || incompleteFieldKeys.length > 0 ) {
				return false;
			}
			return true;
		}

		default: {
			throw new RangeError( 'Unexpected payment partner "' + paymentPartner + '"' );
		}
	}
}
