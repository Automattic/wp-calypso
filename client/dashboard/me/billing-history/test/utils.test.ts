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
	test( 'names Studio Code AI Credits in credits', () => {
		expect( renderTransactionQuantitySummary( item( 'studio-code-ai-credits', 500 ) ) ).toEqual(
			'Purchase of 500 credits'
		);
	} );

	test( 'separates thousands', () => {
		expect( renderTransactionQuantitySummary( item( 'studio-code-ai-credits', 30000 ) ) ).toEqual(
			'Purchase of 30,000 credits'
		);
	} );

	test( 'leaves Akismet Pro unchanged', () => {
		expect( renderTransactionQuantitySummary( item( 'ak_pro5h_yearly', 3 ) ) ).toEqual(
			'Purchase of 3 500 API call licenses'
		);
	} );

	test( 'leaves unmatched products on the generic summary', () => {
		expect( renderTransactionQuantitySummary( item( 'jetpack_ai_yearly', 3 ) ) ).toEqual(
			'Purchase of 3 items'
		);
	} );
} );
