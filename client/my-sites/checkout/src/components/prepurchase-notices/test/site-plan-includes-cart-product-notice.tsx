/**
 * @jest-environment jsdom
 */
import { sitePurchasesQuery } from '@automattic/api-queries';
import { getEmptyResponseCartProduct } from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import SitePlanIncludesCartProductNotice from '../site-plan-includes-cart-product-notice';
import type { Purchase } from '@automattic/api-core';

const SITE = { ID: 123, slug: 'example.wordpress.com' };
const PLAN = {
	product_id: 2014,
	product_slug: 'jetpack_complete',
	product_name_short: 'Complete',
	expired: false,
};
const PRODUCT = { ...getEmptyResponseCartProduct(), product_slug: 'jetpack_backup_t1_yearly' };

function renderNotice( purchases: Partial< Purchase >[] ) {
	const queryClient = new QueryClient();
	queryClient.setQueryData( sitePurchasesQuery( SITE.ID ).queryKey, purchases as Purchase[] );
	render(
		<QueryClientProvider client={ queryClient }>
			<SitePlanIncludesCartProductNotice plan={ PLAN } product={ PRODUCT } selectedSite={ SITE } />
		</QueryClientProvider>
	);
}

describe( 'SitePlanIncludesCartProductNotice', () => {
	it( 'links to the purchase of the plan on the site', () => {
		renderNotice( [
			{ ID: 1, product_slug: 'jetpack_backup_t1_yearly' },
			{ ID: 2, product_slug: 'jetpack_complete' },
		] );

		expect( screen.getByRole( 'link', { name: 'Manage subscription' } ) ).toHaveAttribute(
			'href',
			'/me/purchases/example.wordpress.com/2'
		);
	} );

	it( 'links to all purchases when the plan purchase is not found', () => {
		renderNotice( [ { ID: 1, product_slug: 'jetpack_backup_t1_yearly' } ] );

		expect( screen.getByRole( 'link', { name: 'Manage subscription' } ) ).toHaveAttribute(
			'href',
			'/me/purchases/'
		);
	} );
} );
