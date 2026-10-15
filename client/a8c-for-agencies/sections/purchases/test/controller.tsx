/**
 * @jest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { licensesContext } from '../controller';
import type { Context } from '@automattic/calypso-router';

jest.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: jest.fn(), show: jest.fn(), redirect: jest.fn() },
} ) );

jest.mock( 'calypso/a8c-for-agencies/components/sidebar-menu/purchases', () => () => null );
jest.mock( 'calypso/a8c-for-agencies/components/a4a-page-view-tracker', () => () => null );
jest.mock( '../licenses/licenses-overview', () => () => null );
jest.mock( '../billing/billing-dashboard', () => () => null );
jest.mock( '../invoices/invoices-overview', () => () => null );
jest.mock( '../payment-methods/payment-method-add', () => () => null );
jest.mock( '../payment-methods/payment-method-overview', () => () => null );
jest.mock( '../crm-downloads', () => () => null );

function buildContext( canonicalPath: string, query: Record< string, string > ): Context {
	return { canonicalPath, path: canonicalPath, params: {}, query } as unknown as Context;
}

describe( 'licensesContext', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	// Changing the router's path mid-dispatch makes Calypso Router abandon the
	// remaining callbacks, so `makeLayout`/`clientRender` never run.
	it( 'renders and continues the chain without touching the router when receipt_id is present', () => {
		const context = buildContext( '/purchases/licenses?receipt_id=12345', {
			receipt_id: '12345',
		} );
		const next = jest.fn();

		licensesContext( context, next );

		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( context.primary ).toBeTruthy();
		expect( page.replace ).not.toHaveBeenCalled();
		expect( page.show ).not.toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );
} );
