import { renderTransactionQuantitySummary } from '../utils';
import type { ReceiptItem } from '@automattic/api-core';

const item = ( wpcom_product_slug: string, licensed_quantity: number ) =>
	( {
		wpcom_product_slug,
		licensed_quantity,
		new_quantity: 0,
		type: 'new purchase',
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
