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
	shouldShowPersistentErrors,
}: {
	cart: ResponseCart;
	isLoadingCart: boolean;
	showSuccessMessages: ShowMessages;
	showErrorMessages: ShowMessages;

	/**
	 * Persistent errors like "Purchases are disabled for this site" are returned
	 * during cart fetch (regular cart errors are transient and only are returned
	 * when changing the cart). We want to display these errors only in certain
	 * contexts where they will make sense (like checkout), not in every place
	 * that happens to render this component (like the plans page).
	 */
	shouldShowPersistentErrors: boolean;
} ): void {
	const previousCart = useRef< ResponseCart | null >( null );

	useEffect( () => {
		if ( previousCart.current === cart ) {
			return;
		}
		displayCartMessages( {
			cart,
			isLoadingCart,
			previousCart: previousCart.current,
			showErrorMessages,
			showSuccessMessages,
			shouldShowPersistentErrors,
		} );
		previousCart.current = cart;
	}, [ cart, isLoadingCart, showErrorMessages, showSuccessMessages, shouldShowPersistentErrors ] );
}

function displayCartMessages( {
	cart,
	isLoadingCart,
	previousCart,
	showErrorMessages,
	showSuccessMessages,
	shouldShowPersistentErrors,
}: {
	cart: ResponseCart;
	isLoadingCart: boolean;
	previousCart: ResponseCart | null;
	showErrorMessages: ShowMessages;
	showSuccessMessages: ShowMessages;
	shouldShowPersistentErrors: boolean;
} ) {
	const newCart = cart;
	if ( isLoadingCart ) {
		return;
	}
	const messages = getNewMessages( previousCart, newCart );

	if ( messages.errors?.length ) {
		showErrorMessages( messages.errors );
	}

	if ( messages.success?.length ) {
		showSuccessMessages( messages.success );
	}

	if ( messages.persistent_errors?.length && shouldShowPersistentErrors ) {
		showErrorMessages( messages.persistent_errors );
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
