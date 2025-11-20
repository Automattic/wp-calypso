/**
 * Hook to submit VGS form and retrieve tokenized card data
 * Uses the official useVGSCollectFormInstance hook from VGS React library
 */

import { useVGSCollectFormInstance } from '@vgs/collect-js-react';
import { useCallback } from '@wordpress/element';
import debugFactory from 'debug';
import type { VgsTokens } from '../lib/create-ebanx-token-vgs';

const debug = debugFactory( 'calypso:vgs-form-submit' );

/**
 * VGS response structure from the echo endpoint
 */
interface VgsEchoResponse {
	json?: VgsTokens;
	data?: string;
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
	// Get the VGS form instance using the official hook
	const [ form ] = useVGSCollectFormInstance();

	const submitVgsForm = useCallback( async (): Promise< VgsTokens > => {
		debug( 'attempting to submit VGS form' );

		if ( ! form ) {
			throw new Error( 'VGS form not ready. Please wait for the form to load.' );
		}

		return new Promise( ( resolve, reject ) => {
			form.submit(
				'/post',
				{
					data: ( formValues: Record< string, string > ) => ( {
						card_number: formValues.card_number,
						card_exp: formValues.card_exp,
						card_cvc: formValues.card_cvc,
					} ),
				},
				( status: number, data: VgsEchoResponse | null ) => {
					if ( status >= 200 && status < 300 && data ) {
						// Extract tokens from the VGS echo response
						let tokens: VgsTokens | null = null;

						if ( data.json ) {
							tokens = data.json;
						} else if ( data.data && typeof data.data === 'string' ) {
							try {
								tokens = JSON.parse( data.data );
							} catch ( e ) {
								debug( '=== VGS FORM SUBMIT: Failed to parse data ===', e );
							}
						}

						if ( tokens && tokens.card_number && tokens.card_exp && tokens.card_cvc ) {
							resolve( tokens );
						} else {
							reject( new Error( 'Incomplete token data received from VGS' ) );
						}
					} else {
						reject( new Error( `VGS submission failed with status ${ status }` ) );
					}
				}
			);
		} );
	}, [ form ] );

	return submitVgsForm;
}
