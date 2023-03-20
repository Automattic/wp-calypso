import { useProcessPayment, PaymentProcessorResponseType } from '@automattic/composite-checkout';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { errorNotice } from 'calypso/state/notices/actions';
import type { PaymentProcessorResponse } from '@automattic/composite-checkout';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';

type SetStep = ( step: string ) => void;
type OnClose = () => void;
type SubmitTransactionFunction = () => void;

export function useSubmitTransaction( {
	storedCard,
	setStep,
	onClose,
}: {
	storedCard: StoredCard | undefined;
	setStep: SetStep;
	onClose: OnClose;
} ): SubmitTransactionFunction {
	const callPaymentProcessor = useProcessPayment( 'existing-card' );
	const reduxDispatch = useDispatch();

	return useCallback( () => {
		if ( ! storedCard ) {
			throw new Error( 'No saved card found' );
		}
		setStep( 'processing' );
		callPaymentProcessor( {
			name: storedCard.name,
			storedDetailsId: storedCard.stored_details_id,
			paymentMethodToken: storedCard.mp_ref,
			paymentPartnerProcessorId: storedCard.payment_partner,
		} )
			.then( ( response: PaymentProcessorResponse ) => {
				if ( response.type === PaymentProcessorResponseType.ERROR ) {
					recordTracksEvent( 'calypso_oneclick_upsell_payment_error', {
						error_code: response.payload,
						reason: response.payload,
					} );
					reduxDispatch( errorNotice( response.payload ) );
					onClose();
					return;
				}

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
	}, [ callPaymentProcessor, storedCard, setStep, onClose, reduxDispatch ] );
}

export function formatDate( cardExpiry: string ): string {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}
