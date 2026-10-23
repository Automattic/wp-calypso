/**
 * @jest-environment jsdom
 */

import { screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PurchasesList from '../index';
import type { Purchase } from '@automattic/api-core';

jest.mock( '@automattic/calypso-config', () => {
	const fn = jest.fn( () => '' );
	return Object.assign( fn, {
		__esModule: true,
		default: fn,
		isEnabled: jest.fn( () => false ),
	} );
} );

jest.mock( '../../../app/router/me', () => {
	const actual = jest.requireActual( '../../../app/router/me' );
	return {
		...actual,
		purchasesRoute: {
			...actual.purchasesRoute,
			useSearch: () => ( {} ),
		},
		purchasesIndexRoute: {
			...actual.purchasesIndexRoute,
			// Reads the live URL like the real router, so the params are gone once the list strips them.
			useSearch: () => {
				const params = new URLSearchParams( globalThis.location.search );
				return {
					removed: params.get( 'removed' ) ?? undefined,
					removedDomain: params.get( 'removedDomain' ) ?? undefined,
					removedId: params.has( 'removedId' ) ? Number( params.get( 'removedId' ) ) : undefined,
				};
			},
		},
	};
} );

const REMOVED_NOTICE =
	'Your plan has been removed. Your site will revert to its previous state — download a backup to save your content, themes, and plugins. You’ll receive a confirmation email shortly.';

function setSearch( search: string ) {
	window.history.replaceState( null, '', `/${ search }` );
}

function mockRequests( purchases: Partial< Purchase >[] = [] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: {} } );
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( ( query ) => ! query.type )
		.reply( 200, purchases );
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/upgrades' )
		.query( { type: 'transferred' } )
		.reply( 200, [] );
	nock( 'https://public-api.wordpress.com' )
		.get( /\/me\/sites/ )
		.query( true )
		.reply( 200, { sites: [] } );
	nock( 'https://public-api.wordpress.com' )
		.get( /\/me\/payment-methods/ )
		.query( true )
		.reply( 200, [] );
}

describe( '<PurchasesList />', () => {
	beforeEach( () => {
		setSearch( '' );
	} );

	test( 'shows the removed notice with a backup link after an Atomic plan removal', async () => {
		mockRequests();
		setSearch( '?removed=plan&removedDomain=example.wpcomstaging.com&removedId=1245242' );
		render( <PurchasesList /> );

		expect( await screen.findByText( REMOVED_NOTICE ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'Download backup' } ) ).toHaveAttribute(
			'href',
			'https://example.wpcomstaging.com/wp-admin/export.php'
		);
	} );

	test( 'keeps the removed notice after the params are stripped from the URL', async () => {
		mockRequests( [ { ID: 1, product_name: 'Other Plan', product_type: 'bundle' } ] );
		setSearch( '?removed=plan&removedDomain=example.wpcomstaging.com&removedId=1245242' );
		render( <PurchasesList /> );

		await screen.findByText( REMOVED_NOTICE );
		await waitFor( () => expect( window.location.search ).toBe( '' ) );
		// Wait for a re-render after the URL is cleared.
		expect( await screen.findByText( 'Other Plan' ) ).toBeVisible();

		expect( screen.getByText( REMOVED_NOTICE ) ).toBeVisible();
	} );

	test( 'hides the removed notice when it is dismissed', async () => {
		const user = userEvent.setup();
		mockRequests();
		setSearch( '?removed=plan&removedDomain=example.wpcomstaging.com' );
		render( <PurchasesList /> );

		await screen.findByText( REMOVED_NOTICE );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.getByRole( 'heading', { name: 'Active upgrades' } ) ).toBeVisible();
		expect( screen.queryByText( REMOVED_NOTICE ) ).not.toBeInTheDocument();
	} );

	test( 'hides the removed notice when the removal failed and the purchase is back', async () => {
		mockRequests( [
			{ ID: 1245242, product_name: 'WordPress.com Personal', product_type: 'bundle' },
		] );
		setSearch( '?removed=plan&removedDomain=example.wpcomstaging.com&removedId=1245242' );
		render( <PurchasesList /> );

		await screen.findByText( REMOVED_NOTICE );
		await waitForElementToBeRemoved( () => screen.queryByText( REMOVED_NOTICE ) );
		expect( screen.getByRole( 'heading', { name: 'Active upgrades' } ) ).toBeVisible();
		expect( screen.getByText( 'WordPress.com Personal' ) ).toBeVisible();
	} );

	test( 'shows only the list on a regular visit', async () => {
		mockRequests();
		render( <PurchasesList /> );

		expect( await screen.findByRole( 'heading', { name: 'Active upgrades' } ) ).toBeVisible();
		expect( screen.queryByText( /has been removed/ ) ).not.toBeInTheDocument();
	} );
} );
