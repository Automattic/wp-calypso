/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { DomainsTable } from '..';
import type { PartialDomainData } from '@automattic/data-stores';

function render( ui, renderOptions = {} ) {
	const queryClient = new QueryClient();

	const Wrapper = ( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	return rtlRender( ui, { wrapper: Wrapper, ...renderOptions } );
}

function testDomain( defaults: Partial< PartialDomainData > = {} ): PartialDomainData {
	return {
		domain: 'example.com',
		blog_id: 113,
		type: 'mapping',
		is_wpcom_staging_domain: false,
		has_registration: true,
		registration_date: '2020-03-11T22:23:58+00:00',
		expiry: '2026-03-11T00:00:00+00:00',
		wpcom_domain: false,
		current_user_is_owner: true,
		...defaults,
	};
}

test( 'all domain names are rendered in the table', () => {
	const { rerender } = render(
		<DomainsTable
			domains={ [
				testDomain( { domain: 'example1.com' } ),
				testDomain( { domain: 'example2.com' } ),
				testDomain( { domain: 'example3.com' } ),
			] }
		/>
	);

	expect( screen.queryByText( 'example1.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'example2.com' ) ).toBeInTheDocument();
	expect( screen.queryByText( 'example3.com' ) ).toBeInTheDocument();

	rerender( <DomainsTable domains={ [] } /> );

	expect( screen.queryByText( 'example1.com' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'example2.com' ) ).not.toBeInTheDocument();
	expect( screen.queryByText( 'example3.com' ) ).not.toBeInTheDocument();
} );

test( 'domain name links to management interface', async () => {
	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [
			{
				domain: 'example.com',
				primary_domain: true,
			},
		],
	} );

	render(
		<DomainsTable
			domains={ [ testDomain( { domain: 'example.com', blog_id: 123 } ) ] }
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	// Expect the row to fetch detailed domain data
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	// Before detailed domain data has loaded the link will use the blog ID
	expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
		'href',
		expect.stringContaining( '/domains/manage/all/example.com/edit/123' )
	);

	// After detailed domain data is loaded we expect the site's primary domain to be used in the URL fragment
	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/domains/manage/all/example.com/edit/example.com' )
		)
	);
} );

test( 'all domains use the primary domain as the site slug in their link URLs', async () => {
	const fetchSiteDomains = jest.fn( ( siteId ) =>
		Promise.resolve( {
			domains:
				siteId === 123
					? [
							{
								domain: 'not-primary-domain.blog',
								primary_domain: false,
							},
							{
								domain: 'primary-domain.blog',
								primary_domain: true,
							},
					  ]
					: [ { domain: 'a-different-site.com', primary_domain: true } ],
		} )
	);

	render(
		<DomainsTable
			domains={ [
				testDomain( { domain: 'primary-domain.blog', blog_id: 123 } ),
				testDomain( { domain: 'not-primary-domain.blog', blog_id: 123 } ),
				testDomain( { domain: 'a-different-site.com', blog_id: 1337 } ),
			] }
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	expect( fetchSiteDomains ).toHaveBeenCalledTimes( 2 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 1337 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'primary-domain.blog' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining( '/domains/manage/all/primary-domain.blog/edit/primary-domain.blog' )
		)
	);
	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'not-primary-domain.blog' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining(
				'/domains/manage/all/not-primary-domain.blog/edit/primary-domain.blog'
			)
		)
	);
	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'a-different-site.com' } ) ).toHaveAttribute(
			'href',
			expect.stringContaining(
				'/domains/manage/all/a-different-site.com/edit/a-different-site.com'
			)
		)
	);
} );
