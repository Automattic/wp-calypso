/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../../test-utils';
import { PurchaseNotice } from '../purchase-notice';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn( () => false ),
	} );
} );

type Search = Record< string, unknown >;

let mockSearch: Search = {};

jest.mock( '../../../../app/router/me', () => {
	const { useReducer } = jest.requireActual( 'react' );
	const actual = jest.requireActual( '../../../../app/router/me' );
	return {
		...actual,
		purchaseSettingsRoute: {
			...actual.purchaseSettingsRoute,
			useSearch: () => mockSearch,
			// Updates the search and re-renders, like the real router.
			useNavigate: () => {
				const [ , rerender ] = useReducer( ( count: number ) => count + 1, 0 );
				return ( { search }: { search: ( prev: Search ) => Search } ) => {
					mockSearch = search( mockSearch );
					rerender();
				};
			},
		},
	};
} );

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
		mockSearch = {};
		mockRequests();
	} );

	test( 'shows the cancelled notice with the expiry date after a cancel', async () => {
		mockSearch = { cancelled: true };
		render( <PurchaseNotice purchase={ makePurchase() } /> );

		expect(
			await screen.findByText(
				'Your subscription is cancelled and you won’t be billed again. You’ll continue to have access to the plan until April 6, 2027.'
			)
		).toBeVisible();
	} );

	test( 'shows the backup link in the cancelled notice for an Atomic site', async () => {
		mockSearch = { cancelled: true };
		render(
			<PurchaseNotice purchase={ makePurchase( { will_atomic_revert_after_removal: true } ) } />
		);

		expect(
			await screen.findByText(
				'Your subscription is cancelled and you won’t be billed again. Your site stays live until April 6, 2027. Download a backup to save your content, themes, and plugins.'
			)
		).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Download backup' } ) ).toHaveAttribute(
			'href',
			'https://example.wordpress.com/wp-admin/export.php'
		);
		expect( screen.getByRole( 'link', { name: 'Download backup' } ) ).toHaveAttribute(
			'target',
			'_blank'
		);
	} );

	test( 'keeps the cancelled notice after the param is cleared from the URL', async () => {
		mockSearch = { cancelled: true };
		render( <PurchaseNotice purchase={ makePurchase() } /> );

		await screen.findByText( /Your subscription is cancelled/ );
		await waitFor( () => expect( mockSearch ).toEqual( {} ) );

		expect( screen.getByText( /Your subscription is cancelled/ ) ).toBeVisible();
	} );

	test( 'hides the cancelled notice when it is closed', async () => {
		const user = userEvent.setup();
		mockSearch = { cancelled: true };
		render( <PurchaseNotice purchase={ makePurchase() } /> );

		await screen.findByText( /Your subscription is cancelled/ );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( /Your subscription is cancelled/ ) ).not.toBeInTheDocument();
	} );
} );
