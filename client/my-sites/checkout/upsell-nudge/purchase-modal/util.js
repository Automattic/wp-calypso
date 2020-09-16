/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { find, pick } from 'lodash';

/**
 * Internal dependencies
 */
import { RECEIVED_WPCOM_RESPONSE } from 'lib/store-transactions/step-types';
import { preprocessCartForServer } from 'lib/cart-values';
import { submit } from 'lib/store-transactions';
import { recordTracksEvent } from 'lib/analytics/tracks';
import { errorNotice } from 'state/notices/actions';

function extractStoredCardMetaValue( card, key ) {
	return find( card.meta, [ 'meta_key', key ] )?.meta_value;
}

function generateTransactionData( cart, storedCard ) {
	const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' );
	const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' );

	return {
		cart: {
			...pick( cart, [ 'blog_id', 'cart_key' ] ),
			...preprocessCartForServer( cart ),
			create_new_blog: false,
		},
		domainDetails: null,
		payment: {
			paymentMethod: 'WPCOM_Billing_MoneyPress_Stored',
			storedCard,
			name: storedCard.name,
			country: countryCode,
			country_code: countryCode,
			postal_code: postalCode,
			zip: postalCode,
		},
	};
}

export function useSubmitTransaction( { cart, storedCard, setStep, onClose, onComplete } ) {
	const dispatch = useDispatch();
	return useCallback( () => {
		const transactionData = generateTransactionData( cart, storedCard );
		submit( transactionData, ( { name, data, error } ) => {
			if ( error ) {
				recordTracksEvent( 'calypso_oneclick_upsell_payment_error', {
					error_code: error.code || error.error,
					reason: error.message,
				} );
				dispatch( errorNotice( error.message ) );
				onClose();
				return;
			}

			setStep( name );

			if ( RECEIVED_WPCOM_RESPONSE === name && data && ! error ) {
				recordTracksEvent( 'calypso_oneclick_upsell_payment_success', {} );
				onComplete?.();
			}
		} );
	}, [ cart, storedCard, setStep ] );
}

export function formatDate( cardExpiry ) {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}
