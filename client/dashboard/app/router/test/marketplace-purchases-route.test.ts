/**
 * @jest-environment jsdom
 */

import { defaultParseSearch } from '@tanstack/react-router';
import { marketplacePurchasesRoute } from '../agency';

type ValidateSearch = ( search: Record< string, unknown > ) => { receipt_id?: string };

const validateSearch = marketplacePurchasesRoute.options
	.validateSearch as unknown as ValidateSearch;

describe( 'marketplacePurchasesRoute', () => {
	it( 'keeps the receipt id a finished checkout returns with', () => {
		const search = validateSearch( defaultParseSearch( '?receipt_id=123' ) );

		expect( search.receipt_id ).toBe( '123' );
	} );
} );
