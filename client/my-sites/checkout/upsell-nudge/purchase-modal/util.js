/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useProcessPayment } from '@automattic/composite-checkout';

/**
 * Internal dependencies
 */
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import notices from 'calypso/notices';
import { translateResponseCartToWPCOMCart } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-cart';

export function extractStoredCardMetaValue( card, key ) {
	return card.meta?.find( ( meta ) => meta.meta_key === key )?.meta_value;
}

export function useSubmitTransaction( {
	cart,
	siteId,
	storedCard,
	setStep,
	onClose,
	successMessage,
} ) {
	const callPaymentProcessor = useProcessPayment();

	return useCallback( () => {
		const wpcomCart = translateResponseCartToWPCOMCart( cart );
		const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' );
		const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' );
		callPaymentProcessor( 'existing-card', {
			items: wpcomCart.items,
			name: storedCard.name,
			storedDetailsId: storedCard.stored_details_id,
			paymentMethodToken: storedCard.mp_ref,
			paymentPartnerProcessorId: storedCard.payment_partner,
			country: countryCode,
			postalCode,
			siteId: siteId ? String( siteId ) : undefined,
		} )
			.then( () => {
				setStep( name );
				notices.success( successMessage, {
					persistent: true,
				} );
				recordTracksEvent( 'calypso_oneclick_upsell_payment_success', {} );
			} )
			.catch( ( error ) => {
				recordTracksEvent( 'calypso_oneclick_upsell_payment_error', {
					error_code: error.code || error.error,
					reason: error.message,
				} );
				notices.error( error.message );
				onClose();
			} );
	}, [ siteId, callPaymentProcessor, cart, storedCard, setStep, onClose, successMessage ] );
}

export function formatDate( cardExpiry ) {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}
