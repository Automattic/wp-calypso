import { VGS } from '@vgs/collect-js';
import { __ } from '@wordpress/i18n';

export function createVgsEbanxPaymentMethodData( tokens: VGS.TokenizedCardData ) {
	if ( ! tokens ) {
		throw new Error( __( 'Failed to receive tokens.', 'calypso' ) );
	}

	return {
		payment_instrument_tokens: JSON.stringify( [
			{
				provider_type: 'vgs',
				token_type: 'card_number',
				token_value: tokens[ 'card-number' ],
			},
			{
				provider_type: 'vgs',
				token_type: 'cvv',
				token_value: tokens[ 'card-security-code' ],
			},
			{
				provider_type: 'vgs',
				token_type: 'expiry_month',
				token_value: tokens[ 'card-expiration-date' ].month,
			},
			{
				provider_type: 'vgs',
				token_type: 'expiry_year',
				token_value: tokens[ 'card-expiration-date' ].year,
			},
		] ),
		provider_type: 'ebanx',
		payment_instrument_method: 'card',
		provider_specific_data: JSON.stringify( {
			browser_info: {
				user_agent: navigator.userAgent,
				accept_header: '*/*',
				language: navigator.language,
				screen_width: window.screen.width,
				screen_height: window.screen.height,
				color_depth: window.screen.colorDepth,
				time_zone_offset: new Date().getTimezoneOffset(),
				java_enabled: navigator.javaEnabled(),
			},
		} ),
		...( tokens[ 'card-postal-code' ] && {
			postal_code: tokens[ 'card-postal-code' ],
		} ),
		...( tokens[ 'card-country' ] && {
			country: tokens[ 'card-country' ],
		} ),
	};
}
