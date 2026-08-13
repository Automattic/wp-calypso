/**
 * @jest-environment jsdom
 */

import {
	allSitesQuery,
	rawUserPreferencesQuery,
	userPaymentMethodsQuery,
	userPurchasesQuery,
	userTransferredPurchasesQuery,
} from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test-utils';
import PurchasesList from '../index';
import type { Purchase } from '@automattic/api-core';

jest.mock( '../../../app/router/me', () => {
	const actual = jest.requireActual( '../../../app/router/me' );
	return {
		...actual,
		purchasesRoute: { ...actual.purchasesRoute, useSearch: () => ( {} ) },
		purchasesIndexRoute: { ...actual.purchasesIndexRoute, useSearch: () => ( {} ) },
	};
} );

const createPurchase = ( overrides: Partial< Purchase > ): Purchase =>
	( {
		ID: 1,
		blog_id: 100,
		blogname: 'Example',
		site_slug: 'example.wordpress.com',
		domain: 'example.wordpress.com',
		user_id: 1,
		product_name: 'Jetpack Social',
		product_slug: 'jetpack_social_basic_yearly',
		product_type: 'jetpack',
		expiry_status: 'auto-renewing',
		subscription_status: 'active',
		expiry_date: '2027-01-01T00:00:00+00:00',
		...overrides,
	} ) as Purchase;

// The page reads several queries beyond the purchase list; seeding them all
// keeps the render offline, and `staleTime` stops them refetching.
function renderPurchasesList( purchases: Purchase[] ) {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false, staleTime: Infinity } },
	} );

	queryClient.setQueryData( userPurchasesQuery().queryKey, purchases );
	queryClient.setQueryData( userTransferredPurchasesQuery().queryKey, [] );
	queryClient.setQueryData( allSitesQuery().queryKey, [] );
	queryClient.setQueryData( userPaymentMethodsQuery( {} ).queryKey, [] );
	// The view is persisted as a user preference, read through a suspense query.
	queryClient.setQueryData( rawUserPreferencesQuery().queryKey, {} );

	return render( <PurchasesList />, { queryClient } );
}

describe( '<PurchasesList>', () => {
	test( 'leaves a removed subscription out of the active upgrades', async () => {
		renderPurchasesList( [
			createPurchase( { ID: 1, product_name: 'Jetpack Growth' } ),
			createPurchase( {
				ID: 2,
				product_name: 'Jetpack Social',
				// Cancelled by support: removed on the spot, with the expiry date
				// backdated to the cancellation rather than to a lapse.
				expiry_status: 'expired',
				subscription_status: 'inactive',
				expiry_date: new Date().toISOString(),
			} ),
		] );

		await waitFor( () => expect( screen.getByText( 'Jetpack Growth' ) ).toBeVisible() );
		expect( screen.queryByText( 'Jetpack Social' ) ).toBeNull();
	} );

	test( 'still lists a purchase that has lapsed but can be renewed', async () => {
		renderPurchasesList( [
			createPurchase( {
				ID: 1,
				product_name: 'Jetpack Growth',
				expiry_status: 'expired',
				subscription_status: 'active',
				expiry_date: '2026-01-01T00:00:00+00:00',
			} ),
		] );

		await waitFor( () => expect( screen.getByText( 'Jetpack Growth' ) ).toBeVisible() );
	} );
} );
