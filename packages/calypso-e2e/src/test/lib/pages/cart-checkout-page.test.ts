import { describe, expect, test } from 'vitest';
import { isPurchaseTransaction } from '../../../lib/pages/cart-checkout-page';

const API = 'https://public-api.wordpress.com/rest/v1.1';

describe( 'CartCheckoutPage', function () {
	describe( 'isPurchaseTransaction', function () {
		test.each`
			method      | url                                                                 | expected
			${ 'POST' } | ${ `${ API }/me/transactions?http_envelope=1` }                     | ${ true }
			${ 'POST' } | ${ `${ API }/me/transactions` }                                     | ${ true }
			${ 'GET' }  | ${ `${ API }/me/transactions/supported-countries?http_envelope=1` } | ${ false }
			${ 'GET' }  | ${ `${ API }/me/transactions/order/924259?http_envelope=1` }        | ${ false }
			${ 'GET' }  | ${ `${ API }/me/transactions?http_envelope=1` }                     | ${ false }
			${ 'POST' } | ${ `${ API }/me/transactions/paypal-express?http_envelope=1` }      | ${ false }
		`(
			'returns $expected for $method $url',
			function ( { method, url, expected }: { method: string; url: string; expected: boolean } ) {
				expect( isPurchaseTransaction( method, url ) ).toBe( expected );
			}
		);
	} );
} );
