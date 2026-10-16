import { renderTransactionQuantitySummary } from '../utils';
import type { ReceiptItem } from '@automattic/api-core';

const item = (
	wpcom_product_slug: string,
	licensed_quantity: number,
	overrides: Partial< ReceiptItem > = {}
) =>
	( {
		wpcom_product_slug,
		licensed_quantity,
		new_quantity: 0,
		type: 'new purchase',
		...overrides,
	} ) as ReceiptItem;

describe( 'renderTransactionQuantitySummary', () => {
	test( 'shows credit quantity for Studio Code AI Credits', () => {
		expect( renderTransactionQuantitySummary( item( 'studio-code-ai-credits', 500 ) ) ).toEqual(
			'Purchase of 500 AI credits'
		);
	} );

	test( 'uses the singular form for one credit', () => {
		expect( renderTransactionQuantitySummary( item( 'studio-code-ai-credits', 1 ) ) ).toEqual(
			'Purchase of 1 AI credit'
		);
	} );

	test( 'uses a separator for thousands of credits', () => {
		expect( renderTransactionQuantitySummary( item( 'studio-code-ai-credits', 30000 ) ) ).toEqual(
			'Purchase of 30,000 AI credits'
		);
	} );

	test( 'shows license quantity for Akismet Pro', () => {
		expect( renderTransactionQuantitySummary( item( 'ak_pro5h_yearly', 3 ) ) ).toEqual(
			'Purchase of 3 500 API call licenses'
		);
	} );

	test( 'shows item quantity for other products', () => {
		expect( renderTransactionQuantitySummary( item( 'jetpack_ai_yearly', 3 ) ) ).toEqual(
			'Purchase of 3 items'
		);
	} );
} );

describe( 'renderTransactionQuantitySummary for A4A Titan inboxes', () => {
	test( 'shows the inboxes bought on a first purchase', () => {
		expect( renderTransactionQuantitySummary( item( 'pressable-addon-titan-inbox', 2 ) ) ).toEqual(
			'Purchase of 2 inboxes'
		);
	} );

	test( 'uses the singular form for one inbox', () => {
		expect( renderTransactionQuantitySummary( item( 'pressable-addon-titan-inbox', 1 ) ) ).toEqual(
			'Purchase of 1 inbox'
		);
	} );

	test( 'distinguishes added inboxes from the resulting total on an increase', () => {
		expect(
			renderTransactionQuantitySummary(
				item( 'pressable-addon-titan-inbox', 5, { new_quantity: 3 } )
			)
		).toEqual( '3 added; 5 total' );
	} );

	test( 'shows the whole order on a renewal', () => {
		expect(
			renderTransactionQuantitySummary(
				item( 'pressable-addon-titan-inbox', 9, { type: 'recurring' } )
			)
		).toEqual( 'Renewal for 9 inboxes' );
	} );

	test( 'keeps the added count on a refund of an increase', () => {
		expect(
			renderTransactionQuantitySummary(
				item( 'pressable-addon-titan-inbox', 5, { type: 'refund', new_quantity: 3 } )
			)
		).toEqual( '3 added; 5 total' );
	} );

	test( 'does not call a refund a purchase', () => {
		expect(
			renderTransactionQuantitySummary(
				item( 'pressable-addon-titan-inbox', 9, { type: 'refund' } )
			)
		).toEqual( '9 inboxes' );
	} );

	test( 'tolerates a missing added count', () => {
		expect(
			renderTransactionQuantitySummary(
				item( 'pressable-addon-titan-inbox', 2, {
					new_quantity: null as unknown as number,
				} )
			)
		).toEqual( 'Purchase of 2 inboxes' );
	} );

	test( 'covers the Premium plan product', () => {
		expect(
			renderTransactionQuantitySummary(
				item( 'pressable-addon-titan-inbox-premium', 4, { new_quantity: 1 } )
			)
		).toEqual( '1 added; 4 total' );
	} );

	test( 'leaves other Pressable add-ons on the generic wording', () => {
		expect( renderTransactionQuantitySummary( item( 'pressable-addon-storage-64gb', 2 ) ) ).toEqual(
			'Purchase of 2 items'
		);
	} );
} );
