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

	it( 'sends WordPress.com purchases to the needs setup page with the purchased plan', () => {
		expect(
			getSuccessRedirectUrl( 'https://agencies.automattic.com', false, 'wpcom-hosting-business' )
		).toBe(
			'https://agencies.automattic.com/sites/need-setup?wpcom_creator_purchased=wpcom-hosting-business'
		);
	} );

	it( 'keeps the receipt ID placeholder alongside the purchased plan', () => {
		expect(
			getSuccessRedirectUrl( 'https://agencies.automattic.com', true, 'wpcom-hosting-business' )
		).toBe(
			'https://agencies.automattic.com/sites/need-setup?wpcom_creator_purchased=wpcom-hosting-business&receipt_id=:receiptId'
		);
	} );

	it( 'falls back to the licenses URL when no WordPress.com plan was purchased', () => {
		expect( getSuccessRedirectUrl( 'https://agencies.automattic.com', false, null ) ).toBe(
			'https://agencies.automattic.com/purchases/licenses'
		);
	} );
} );
