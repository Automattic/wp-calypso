import { getDeleteSiteRedirectIntent } from '../delete-site-redirect';
import type { Purchase } from '@automattic/api-core';

describe( 'getDeleteSiteRedirectIntent', () => {
	it( 'returns remove when the purchase is cancelable', () => {
		const purchase = {
			is_cancelable: true,
			is_removable: false,
		} as Purchase;

		expect( getDeleteSiteRedirectIntent( purchase ) ).toBe( 'remove' );
	} );

	it( 'returns remove when the purchase is removable but not cancelable', () => {
		const purchase = {
			is_cancelable: false,
			is_removable: true,
		} as Purchase;

		expect( getDeleteSiteRedirectIntent( purchase ) ).toBe( 'remove' );
	} );

	it( 'returns remove when both cancel and remove are available', () => {
		const purchase = {
			is_cancelable: true,
			is_removable: true,
		} as Purchase;

		expect( getDeleteSiteRedirectIntent( purchase ) ).toBe( 'remove' );
	} );

	it( 'returns null when the purchase cannot be cancelled or removed', () => {
		const purchase = {
			is_cancelable: false,
			is_removable: false,
		} as Purchase;

		expect( getDeleteSiteRedirectIntent( purchase ) ).toBeNull();
	} );
} );
