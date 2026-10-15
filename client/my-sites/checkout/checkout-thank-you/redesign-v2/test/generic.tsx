/**
 * @jest-environment jsdom
 */
import { PRODUCT_STUDIO_CODE_AI_CREDITS } from '@automattic/api-core';
import { render, screen } from '@testing-library/react';
import GenericThankYou from '../pages/generic';
import type { ReceiptPurchase } from 'calypso/state/receipts/types';

let mockSelectedSiteSlug: string | null = null;

jest.mock( 'calypso/state', () => ( {
	useSelector: ( selector: () => unknown ) => selector(),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteSlug: () => mockSelectedSiteSlug,
	getSelectedSiteId: () => null,
} ) );
jest.mock( 'calypso/state/selectors/get-current-route', () => () => '/checkout/thank-you' );

// A product with no thank-you page of its own, which is what falls through to the generic
// "Manage purchase" button.
const purchase = {
	productSlug: PRODUCT_STUDIO_CODE_AI_CREDITS,
	productName: 'Studio Code AI Credits',
} as ReceiptPurchase;

describe( 'GenericThankYou', () => {
	it( 'points "Manage purchase" at the site subscriptions page when a site is selected', () => {
		mockSelectedSiteSlug = 'example.wordpress.com';

		render( <GenericThankYou purchases={ [ purchase ] } /> );

		expect( screen.getByRole( 'link', { name: 'Manage purchase' } ) ).toHaveAttribute(
			'href',
			'/purchases/subscriptions/example.wordpress.com'
		);
	} );

	it( 'points "Manage purchase" at the account purchases list for siteless checkout', () => {
		mockSelectedSiteSlug = null;

		render( <GenericThankYou purchases={ [ purchase ] } /> );

		expect( screen.getByRole( 'link', { name: 'Manage purchase' } ) ).toHaveAttribute(
			'href',
			'/me/purchases'
		);
	} );
} );
