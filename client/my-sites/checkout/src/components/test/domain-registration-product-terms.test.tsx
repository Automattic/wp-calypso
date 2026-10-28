/**
 * @jest-environment jsdom
 */
import { getEmptyResponseCart } from '@automattic/shopping-cart';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import nock from 'nock';
import { domainTransferProduct, planWithoutDomain } from 'calypso/my-sites/checkout/src/test/util';
import DomainRegistrationDotGay from '../domain-registration-dot-gay';
import DomainRegistrationHsts from '../domain-registration-hsts';
import type { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import type { ReactNode } from 'react';

const devDomain: ResponseCartProduct = {
	...domainTransferProduct,
	product_slug: 'dotdev_domain',
	meta: 'example.dev',
	is_domain_registration: true,
};

const gayDomain: ResponseCartProduct = {
	...domainTransferProduct,
	product_slug: 'dotgay_domain',
	meta: 'example.gay',
	is_domain_registration: true,
};

function makeProduct( slug: string, flags: Record< string, boolean > ) {
	return {
		product_slug: slug,
		product_id: 1,
		cost: 10,
		cost_smallest_unit: 1000,
		price_tier_list: [],
		price_tier_usage_quantity: null,
		...flags,
	};
}

function mockProductsEndpoint() {
	return nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/products/' )
		.reply( 200, {
			dotdev_domain: makeProduct( 'dotdev_domain', { is_hsts_required: true } ),
			dotgay_domain: makeProduct( 'dotgay_domain', {
				is_hsts_required: false,
				is_dot_gay_notice_required: true,
			} ),
		} );
}

function makeCart( products: ResponseCartProduct[] ): ResponseCart {
	return { ...getEmptyResponseCart(), products };
}

function renderWithClient( ui: ReactNode ) {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return render( <QueryClientProvider client={ queryClient }>{ ui }</QueryClientProvider> );
}

describe( 'domain registration product terms', () => {
	afterEach( () => {
		nock.cleanAll();
	} );

	it( 'shows the HSTS notice for TLDs whose product requires it', async () => {
		mockProductsEndpoint();
		renderWithClient(
			<DomainRegistrationHsts cart={ makeCart( [ devDomain, gayDomain, devDomain ] ) } />
		);

		expect( await screen.findByText( '.dev' ) ).toBeVisible();
		expect( screen.queryByText( /\.gay/ ) ).not.toBeInTheDocument();
	} );

	it( 'shows the .gay notice for TLDs whose product requires it', async () => {
		mockProductsEndpoint();
		renderWithClient( <DomainRegistrationDotGay cart={ makeCart( [ devDomain, gayDomain ] ) } /> );

		expect( await screen.findByText( /anti-LGBTQ content is prohibited/ ) ).toBeVisible();
	} );

	it( 'does not fetch products when the cart has no domain registrations or transfers', () => {
		const scope = mockProductsEndpoint();
		const { container } = renderWithClient(
			<>
				<DomainRegistrationHsts cart={ makeCart( [ planWithoutDomain ] ) } />
				<DomainRegistrationDotGay cart={ makeCart( [ planWithoutDomain ] ) } />
			</>
		);

		expect( container ).toBeEmptyDOMElement();
		expect( scope.isDone() ).toBe( false );
	} );
} );
