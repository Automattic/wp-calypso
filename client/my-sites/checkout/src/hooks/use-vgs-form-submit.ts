/**
 * Hook to submit VGS form and retrieve tokenized card data
 * This hook provides access to the VGS form submission functionality
 */

import { useCallback, useRef } from '@wordpress/element';
import debugFactory from 'debug';
import type { VgsTokens } from '../lib/create-ebanx-token-vgs';

const debug = debugFactory( 'calypso:vgs-form-submit' );

interface VGSFormElement extends HTMLFormElement {
	submit: () => Promise< {
		data: VgsTokens;
	} >;
}

/**
 * Hook that provides a function to submit the VGS form and get tokens
 * @returns Function to submit VGS form and return tokens
 * @example
 * ```typescript
 * const submitVgsForm = useVgsFormSubmit();
 *
 * const handleClick = async () => {
 *   const tokens = await submitVgsForm();
 *   // Use tokens for payment processing
 * };
 * ```
 */
export function useVgsFormSubmit() {
	const formRef = useRef< VGSFormElement | null >( null );

	const submitVgsForm = useCallback( async (): Promise< VgsTokens > => {
		debug( 'attempting to submit VGS form' );

		// Find the VGS form element
		if ( ! formRef.current ) {
			const formElement = document.querySelector(
				'.vgs-credit-card-fields form'
			) as VGSFormElement | null;

			if ( ! formElement ) {
				throw new Error( 'VGS form not found. Please ensure the form is loaded.' );
			}

			formRef.current = formElement;
		}

		try {
			debug( 'submitting VGS form to generate tokens' );

			// VGS form submit returns a promise with tokenized data
			const result = await formRef.current.submit();

			debug( 'VGS form submission successful', {
				hasData: !! result.data,
				fields: Object.keys( result.data || {} ),
			} );

			// Validate that we have all required tokens
			const tokens = result.data;
			if (
				! tokens ||
				! tokens.card_number ||
				! tokens.card_holder ||
				! tokens.card_exp ||
				! tokens.card_cvc
			) {
				throw new Error( 'Incomplete token data received from VGS' );
			}

			return tokens;
		} catch ( error ) {
			debug( 'VGS form submission failed', error );

			// Provide user-friendly error message
			const errorMessage =
				error instanceof Error
					? error.message
					: 'Failed to process card information. Please check your details and try again.';

			throw new Error( errorMessage );
		}
	}, [] );

	return submitVgsForm;
}

