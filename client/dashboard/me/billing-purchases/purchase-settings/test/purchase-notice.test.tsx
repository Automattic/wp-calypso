/**
 * @vitest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { vi } from 'vitest';
import { render } from '../../../../test-utils';
import { PurchaseNotice } from '../purchase-notice';
import type { Purchase } from '@automattic/api-core';

vi.mock( '@automattic/calypso-config', () => {
	const fn = vi.fn( () => '' );
	return {
		...Object.assign( fn, {
			__esModule: true,
			default: fn,
			isEnabled: vi.fn( () => false ),
		} ),
	};
} );

vi.mock( '../../../../app/router/me', async () => {
	const { useRouterState } =
		await vi.importActual< typeof import( '@tanstack/react-router' ) >( '@tanstack/react-router' );
	const actual = await vi.importActual< typeof import( '../../../../app/router/me' ) >(
		'../../../../app/router/me'
	);
	return {
		...actual,
		purchaseSettingsRoute: {
			...actual.purchaseSettingsRoute,
			// The test router has only a root route, so read its parsed search directly.
			useSearch: () =>
				useRouterState( {
					select: ( state: { location: { search: unknown } } ) => state.location.search,
				} ),
		},
	};
} );

function setSearch( search: string ) {
	window.history.replaceState( null, '', `/me/billing/purchases/1245242${ search }` );
}

function makePurchase( overrides: Partial< Purchase > = {} ): Purchase {
	return {
		ID: 1245242,
		user_id: 1,
		blog_id: 253964809,
		product_name: 'WordPress.com Personal',
		product_slug: 'personal-bundle',
		is_plan: true,
		domain: 'example.wordpress.com',
		expiry_date: '2027-04-06T12:00:00+00:00',
		...overrides,
	} as Purchase;
}

function mockRequests() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( true )
		.reply( 200, [] );
}

describe( '<PurchaseNotice />', () => {
	beforeEach( () => {
		setSearch( '' );
		mockRequests();
	} );

	test( 'shows the cancelled notice with the expiry date after a cancel', async () => {
		setSearch( '?cancelled=true' );
		render( <PurchaseNotice purchase={ makePurchase() } /> );

		expect(
			await screen.findByText(
				'Your subscription is cancelled and you won’t be billed again. You’ll continue to have access to the plan until April 6, 2027.'
			)
		).toBeVisible();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
	} );

	test( 'shows the backup link in the cancelled notice for an Atomic site', async () => {
		setSearch( '?cancelled=true' );
		render(
			<PurchaseNotice purchase={ makePurchase( { will_atomic_revert_after_removal: true } ) } />
		);

		expect(
			await screen.findByText(
				'Your subscription is cancelled and you won’t be billed again. Your site stays live until April 6, 2027. Download a backup to save your content, themes, and plugins.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: /^Download backup/ } ) ).toHaveAttribute(
			'href',
			'https://example.wordpress.com/wp-admin/export.php'
		);
		expect( screen.getByRole( 'link', { name: /^Download backup/ } ) ).toHaveAttribute(
			'target',
			'_blank'
		);
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
	} );

	test( 'shows the cancelled notice after the param is cleared from the URL', async () => {
		setSearch( '?cancelled=true' );
		render( <PurchaseNotice purchase={ makePurchase() } /> );

		await screen.findByText( /Your subscription is cancelled/ );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );

		expect( screen.getByText( /Your subscription is cancelled/ ) ).toBeVisible();
	} );

	test( 'hides the cancelled notice when it is dismissed', async () => {
		const user = userEvent.setup();
		setSearch( '?cancelled=true' );
		render( <PurchaseNotice purchase={ makePurchase() } /> );

		await screen.findByText( /Your subscription is cancelled/ );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( /Your subscription is cancelled/ ) ).not.toBeInTheDocument();
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
	} );

	test( 'removes the notice params it shows and keeps the rest', async () => {
		setSearch(
			'?cancelled=true&intent=auto-renew&downgraded=true&plan_changed=true&delayed_downgrade_scheduled=true&upgraded=true&keep=1'
		);
		render( <PurchaseNotice purchase={ makePurchase() } /> );

		await waitFor( () => expect( window.location.search ).toBe( '?keep=1' ) );
	} );
} );
