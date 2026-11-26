/**
 * @vitest-environment jsdom
 */

import page from '@automattic/calypso-router';
import { vi } from 'vitest';
import { licensesContext } from '../controller';
import type { Context } from '@automattic/calypso-router';

vi.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { replace: vi.fn(), show: vi.fn(), redirect: vi.fn() },
} ) );

vi.mock( 'calypso/a8c-for-agencies/components/sidebar-menu/purchases', () => ( {
	default: () => null,
} ) );
vi.mock( 'calypso/a8c-for-agencies/components/a4a-page-view-tracker', () => ( {
	default: () => null,
} ) );
vi.mock( '../licenses/licenses-overview', () => ( { default: () => null } ) );
vi.mock( '../billing/billing-dashboard', () => ( { default: () => null } ) );
vi.mock( '../invoices/invoices-overview', () => ( { default: () => null } ) );
vi.mock( '../payment-methods/payment-method-add', () => ( { default: () => null } ) );
vi.mock( '../payment-methods/payment-method-overview', () => ( { default: () => null } ) );
vi.mock( '../crm-downloads', () => ( { default: () => null } ) );

function buildContext( canonicalPath: string, query: Record< string, string > ): Context {
	return { canonicalPath, path: canonicalPath, params: {}, query } as unknown as Context;
}

describe( 'licensesContext', () => {
	beforeEach( () => {
		vi.clearAllMocks();
	} );

	// Changing the router's path mid-dispatch makes Calypso Router abandon the
	// remaining callbacks, so `makeLayout`/`clientRender` never run.
	it( 'renders and continues the chain without touching the router when receipt_id is present', () => {
		const context = buildContext( '/purchases/licenses?receipt_id=12345', {
			receipt_id: '12345',
		} );
		const next = vi.fn();

		licensesContext( context, next );

		expect( next ).toHaveBeenCalledTimes( 1 );
		expect( context.primary ).toBeTruthy();
		expect( page.replace ).not.toHaveBeenCalled();
		expect( page.show ).not.toHaveBeenCalled();
		expect( page.redirect ).not.toHaveBeenCalled();
	} );
} );
