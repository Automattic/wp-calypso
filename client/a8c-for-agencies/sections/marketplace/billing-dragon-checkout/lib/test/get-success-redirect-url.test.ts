import getSuccessRedirectUrl, { RECEIPT_ID_PLACEHOLDER } from '../get-success-redirect-url';

describe( 'getSuccessRedirectUrl', () => {
	it( 'appends the receipt ID placeholder when the cart should be cleared on success', () => {
		expect( getSuccessRedirectUrl( 'https://agencies.automattic.com', true ) ).toBe(
			'https://agencies.automattic.com/purchases/licenses?receipt_id=:receiptId'
		);
	} );

	it( 'returns the plain licenses URL when the cart should not be cleared', () => {
		expect( getSuccessRedirectUrl( 'https://agencies.automattic.com', false ) ).toBe(
			'https://agencies.automattic.com/purchases/licenses'
		);
	} );

	it( 'uses the literal placeholder the checkout pending page interpolates', () => {
		// The pending page replaces the raw `:receiptId` string; a URL-encoded
		// placeholder would never be interpolated.
		expect( getSuccessRedirectUrl( 'https://agencies.automattic.com', true ) ).toContain(
			`receipt_id=${ RECEIPT_ID_PLACEHOLDER }`
		);
	} );
} );
