/**
 * External dependencies
 */
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useProcessPayment } from '@automattic/composite-checkout';
import type { ResponseCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { errorNotice } from 'calypso/state/notices/actions';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { translateResponseCartToWPCOMCart } from 'calypso/my-sites/checkout/composite-checkout/lib/translate-cart';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

export function extractStoredCardMetaValue( card: StoredCard, key: string ): string | undefined {
	return card.meta?.find( ( meta ) => meta.meta_key === key )?.meta_value;
}

type SetStep = ( step: string ) => void;
type OnClose = () => void;
type SubmitTransactionFunction = () => void;

export function useSubmitTransaction( {
	cart,
	siteId,
	storedCard,
	setStep,
	onClose,
}: {
	cart: ResponseCart;
	siteId: string | number;
	storedCard: StoredCard | undefined;
	setStep: SetStep;
	onClose: OnClose;
} ): SubmitTransactionFunction {
	const callPaymentProcessor = useProcessPayment();
	const reduxDispatch = useDispatch();

	return useCallback( () => {
		if ( ! storedCard ) {
			throw new Error( 'No saved card found' );
		}
		const wpcomCart = translateResponseCartToWPCOMCart( cart );
		const countryCode = extractStoredCardMetaValue( storedCard, 'country_code' );
		const postalCode = extractStoredCardMetaValue( storedCard, 'card_zip' );
		setStep( 'processing' );
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
				recordTracksEvent( 'calypso_oneclick_upsell_payment_success', {} );
			} )
			.catch( ( error ) => {
				recordTracksEvent( 'calypso_oneclick_upsell_payment_error', {
					error_code: error.code || error.error,
					reason: error.message,
				} );
				reduxDispatch( errorNotice( error.message ) );
				onClose();
			} );
	}, [ siteId, callPaymentProcessor, cart, storedCard, setStep, onClose, reduxDispatch ] );
}

export function formatDate( cardExpiry: string ): string {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}
