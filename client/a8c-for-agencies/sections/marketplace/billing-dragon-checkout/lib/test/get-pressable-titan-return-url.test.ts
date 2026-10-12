import getPressableTitanReturnUrl, {
	PRESSABLE_TITAN_CHECKOUT_RETURN_URL,
} from '../get-pressable-titan-return-url';
import { RECEIPT_ID_PLACEHOLDER } from '../get-success-redirect-url';

describe( 'getPressableTitanReturnUrl', () => {
	it( 'returns the Pressable checkout return URL with the receipt ID placeholder', () => {
		expect( getPressableTitanReturnUrl() ).toBe(
			'https://my.pressable.com/titan_email/checkout_return?receipt_id=:receiptId'
		);
	} );

	it( 'uses the literal placeholder the checkout pending page interpolates', () => {
		// The pending page replaces the raw `:receiptId` string; a URL-encoded
		// placeholder would never be interpolated.
		expect( getPressableTitanReturnUrl() ).toContain( `receipt_id=${ RECEIPT_ID_PLACEHOLDER }` );
		expect( getPressableTitanReturnUrl() ).not.toContain( '%3A' );
	} );

	it( 'starts from the Pressable return endpoint', () => {
		expect( getPressableTitanReturnUrl().startsWith( PRESSABLE_TITAN_CHECKOUT_RETURN_URL ) ).toBe(
			true
		);
	} );
} );
