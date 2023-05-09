import debugFactory from 'debug';
import { useRef, useEffect } from 'react';
import type {
	ResponseCart,
	ResponseCartMessages,
	ResponseCartMessage,
} from '@automattic/shopping-cart';

const debug = debugFactory( 'wpcom-checkout:use-display-cart-messages' );

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
		debug( 'showing errors', messages.errors );
		showErrorMessages( messages.errors );
	}

	if ( messages.success?.length ) {
		debug( 'showing success', messages.errors );
		showSuccessMessages( messages.success );
	}

	if ( messages.persistent_errors?.length && shouldShowPersistentErrors ) {
		debug( 'showing persistent errors', messages.persistent_errors );
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
	debug( 'comparing previous cart', previousCartTimestamp, 'to new cart', nextCartTimestamp );

	// If there is no previous cart then just return the messages for the new cart
	if ( ! previousCartTimestamp || ! nextCartTimestamp ) {
		debug( 'no previous cart; just returning new messages' );
		return nextCartMessages;
	}

	const doesNextCartHaveDifferentMessages = ( () => {
		const nextCartErrorCodes = nextCartMessages?.errors
			?.map( ( message ) => message.code )
			.join( ';' );
		const previousCartErrorCodes = previousCartValue.messages?.errors
			?.map( ( message ) => message.code )
			.join( ';' );
		if ( nextCartErrorCodes !== previousCartErrorCodes ) {
			return true;
		}
		const nextCartSuccessCodes = nextCartMessages?.success
			?.map( ( message ) => message.code )
			.join( ';' );
		const previousCartSuccessCodes = previousCartValue.messages?.success
			?.map( ( message ) => message.code )
			.join( ';' );
		if ( nextCartSuccessCodes !== previousCartSuccessCodes ) {
			return true;
		}
		return false;
	} )();
	const nextCartHasNewData = ( () => {
		const isNextCartNewer = new Date( nextCartTimestamp ) > new Date( previousCartTimestamp );
		if ( isNextCartNewer ) {
			return true;
		}
		// We need to actually check the messages themselves when the timestamp is
		// the same because if the cart endpoint is fast enough you could get two
		// different carts with the same timestamp.
		if ( nextCartTimestamp === previousCartTimestamp ) {
			return doesNextCartHaveDifferentMessages;
		}
		return false;
	} )();
	debug( 'does cart have new data?', nextCartHasNewData );

	return nextCartHasNewData ? nextCartMessages : {};
}
