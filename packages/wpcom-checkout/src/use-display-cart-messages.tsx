/**
 * External dependencies
 */
import { useRef, useEffect } from 'react';
import type {
	ResponseCart,
	ResponseCartMessages,
	ResponseCartMessage,
} from '@automattic/shopping-cart';

export type ShowMessages = ( messages: ResponseCartMessage[] ) => void;

export default function useDisplayCartMessages( {
	cart,
	isLoadingCart,
	showErrorMessages,
	showSuccessMessages,
}: {
	cart: ResponseCart;
	isLoadingCart: boolean;
	showSuccessMessages: ShowMessages;
	showErrorMessages: ShowMessages;
} ): void {
	const previousCart = useRef< ResponseCart | null >( null );

	useEffect( () => {
		displayCartMessages( {
			cart,
			isLoadingCart,
			previousCart: previousCart.current,
			showErrorMessages,
			showSuccessMessages,
		} );
		previousCart.current = cart;
	}, [ cart, isLoadingCart, showErrorMessages, showSuccessMessages ] );
}

function displayCartMessages( {
	cart,
	isLoadingCart,
	previousCart,
	showErrorMessages,
	showSuccessMessages,
}: {
	cart: ResponseCart;
	isLoadingCart: boolean;
	previousCart: ResponseCart | null;
	showErrorMessages: ShowMessages;
	showSuccessMessages: ShowMessages;
} ) {
	const newCart = cart;
	if ( isLoadingCart ) {
		return;
	}
	const messages = getNewMessages( previousCart, newCart );

	const errorMessageCount = messages.errors?.length ?? 0;
	const errorMessages = messages.errors;
	if ( errorMessages && errorMessageCount > 0 ) {
		showErrorMessages( errorMessages );
		return;
	}

	const successMessageCount = messages.success?.length ?? 0;
	const successMessages = messages.success;
	if ( successMessages && successMessageCount > 0 ) {
		showSuccessMessages( successMessages );
		return;
	}
}

// Compare two different cart objects and get the messages of newest one
function getNewMessages(
	previousCartValue: ResponseCart | null,
	nextCartValue: ResponseCart
): ResponseCartMessages {
	const nextCartMessages = nextCartValue.messages || {};
	const previousCartTimestamp = previousCartValue?.cart_generated_at_timestamp;
	const nextCartTimestamp = nextCartValue.cart_generated_at_timestamp;

	// If there is no previous cart then just return the messages for the new cart
	if ( ! previousCartTimestamp || ! nextCartTimestamp ) {
		return nextCartMessages;
	}

	const hasNewServerData = new Date( nextCartTimestamp ) > new Date( previousCartTimestamp );

	return hasNewServerData ? nextCartMessages : {};
}
