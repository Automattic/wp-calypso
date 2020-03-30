/**
 * External dependencies
 */
import { useEffect } from 'react';

export default function useShowStripeLoadingErrors( showErrorMessage, stripeLoadingError ) {
	useEffect( () => {
		if ( stripeLoadingError ) {
			showErrorMessage( stripeLoadingError );
		}
	}, [ showErrorMessage, stripeLoadingError ] );
}
