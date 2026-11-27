/**
 * @vitest-environment jsdom
 */
import { getEmptyResponseCart } from '@automattic/shopping-cart';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { select } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import nock from 'nock';
import DomainUpsellCard from '..';
import { render } from '../../../../../test-utils';
import type { DomainSuggestion, Site } from '@automattic/api-core';

const site = {
	ID: 123,
	slug: 'example.wordpress.com',
} as unknown as Site;

function mockDomainCreditAndSuggestions( {
	hasDomainCredit = true,
	suggestions = [ { domain_name: 'example.com', product_slug: 'domain_reg' } ],
}: {
	hasDomainCredit?: boolean;
	suggestions?: Partial< DomainSuggestion >[];
} = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.4/sites/${ site.ID }/plans` )
		.query( true )
		.reply( 200, {
			plans: {
				1: {
					current_plan: true,
					has_domain_credit: hasDomainCredit,
					original_price: { amount: 0 },
					cost_overrides: [],
				},
			},
		} );
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/domains/suggestions' )
		.query( true )
		.reply( 200, suggestions );
}

function mockCart( updatedCart: object = {} ) {
	const cart = { ...getEmptyResponseCart(), blog_id: site.ID, cart_key: site.ID };
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/me/shopping-cart/${ site.ID }` )
		.reply( 200, cart );
	return nock( 'https://public-api.wordpress.com' )
		.post( `/rest/v1.1/me/shopping-cart/${ site.ID }`, ( body ) =>
			body.products.some(
				( product: { product_slug: string; meta: string } ) =>
					product.product_slug === 'domain_reg' && product.meta === 'example.com'
			)
		)
		.reply( 200, { ...cart, ...updatedCart } );
}

function waitForDescription( text: string ) {
	return waitFor( () => expect( screen.getByRole( 'article' ) ).toHaveTextContent( text ) );
}

const originalLocation = window.location;

beforeEach( () => {
	Object.defineProperty( window, 'location', {
		value: { href: '' },
		writable: true,
	} );
} );

afterEach( () => {
	Object.defineProperty( window, 'location', { value: originalLocation, writable: true } );
} );

describe( '<DomainUpsellCard>', () => {
	test( 'asks a free site to choose a plan', async () => {
		mockDomainCreditAndSuggestions( { hasDomainCredit: false } );

		render( <DomainUpsellCard site={ { ...site, plan: { is_free: true } } as Site } /> );

		expect( await screen.findByRole( 'button', { name: 'Choose a plan' } ) ).toBeVisible();
		expect( screen.getByText( /Upgrade to an annual paid plan/ ) ).toBeVisible();
	} );

	test( 'asks a monthly-billed paid site to switch to annual billing', async () => {
		mockDomainCreditAndSuggestions( { hasDomainCredit: false } );

		render(
			<DomainUpsellCard
				site={
					{
						...site,
						plan: { is_free: false, billing_period: 'Monthly', product_name_short: 'Personal' },
					} as Site
				}
			/>
		);

		const button = await screen.findByRole( 'button', { name: 'Switch to annual billing' } );
		await waitForDescription( 'example.com free for one year' );

		expect( button ).toBeVisible();
		expect( screen.getByRole( 'article' ) ).toHaveTextContent(
			'Switch your Personal plan to annual billing to get example.com free for one year.'
		);
	} );

	test( 'offers the domain itself to an annual paid site that has used its domain credit', async () => {
		mockDomainCreditAndSuggestions( { hasDomainCredit: false } );

		render(
			<DomainUpsellCard
				site={ { ...site, plan: { is_free: false, billing_period: 'Yearly' } } as Site }
			/>
		);

		expect( await screen.findByRole( 'button', { name: 'Get this domain' } ) ).toBeVisible();
	} );

	test( 'shows generic copy when the vendor returns no trustworthy suggestion', async () => {
		mockDomainCreditAndSuggestions( {
			hasDomainCredit: false,
			suggestions: [ { domain_name: 'ex-am-ple.com', product_slug: 'domain_reg' } ],
		} );

		render( <DomainUpsellCard site={ { ...site, plan: { is_free: true } } as Site } /> );

		await waitForDescription( 'a custom domain' );

		expect( screen.getByRole( 'article' ) ).toHaveTextContent(
			'Upgrade to an annual paid plan to get a custom domain free for one year. You can also choose your own domain name.'
		);
		expect( screen.getByRole( 'link', { name: 'choose your own domain name' } ) ).toBeVisible();
	} );

	test( 'shows an error notice when adding an unavailable domain to the cart fails', async () => {
		const user = userEvent.setup();
		const errorMessage = 'Sorry, the domain you are trying to add is no longer available.';
		mockDomainCreditAndSuggestions();
		mockCart( {
			messages: { errors: [ { code: 'domain_unavailable', message: errorMessage } ] },
		} );

		render( <DomainUpsellCard site={ site } /> );

		const button = await screen.findByRole( 'button', { name: 'Claim this domain' } );
		await waitForDescription( 'example.com is included' );
		await user.click( button );

		await waitFor( () =>
			expect( select( noticesStore ).getNotices() ).toEqual( [
				expect.objectContaining( { status: 'error', type: 'snackbar', content: errorMessage } ),
			] )
		);
	} );

	test( 'claims the suggested domain and continues to checkout', async () => {
		const user = userEvent.setup();
		mockDomainCreditAndSuggestions();
		const cartUpdate = mockCart();

		render( <DomainUpsellCard site={ site } /> );

		const button = await screen.findByRole( 'button', { name: 'Claim this domain' } );
		await waitForDescription( 'example.com is included' );
		await user.click( button );

		await waitFor( () => expect( window.location.href ).toContain( '/checkout/' ) );
		expect( cartUpdate.isDone() ).toBe( true );
	} );

	test( 'sends the user to pick a domain when there is no trustworthy suggestion', async () => {
		const user = userEvent.setup();
		mockDomainCreditAndSuggestions( { suggestions: [] } );

		render(
			<DomainUpsellCard
				site={ { ...site, plan: { is_free: false, billing_period: 'Yearly' } } as Site }
			/>
		);

		const button = await screen.findByRole( 'button', { name: 'Claim this domain' } );
		await waitForDescription( 'A custom domain is included' );
		await user.click( button );

		await waitFor( () =>
			expect( window.location.href ).toBe(
				screen.getByRole( 'link', { name: 'choose your own' } ).getAttribute( 'href' )
			)
		);
	} );
} );
