/**
 * @jest-environment jsdom
 */
import { screen, waitFor, within } from '@testing-library/react';
import React from 'react';
import { DomainsTable } from '..';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';

const render = ( el ) => renderWithProvider( el );

test( 'all domain names are rendered in the table', () => {
	const { rerender } = render(
		<DomainsTable
			domains={ [
				testPartialDomain( { domain: 'example1.com' } ),
				testPartialDomain( { domain: 'example2.com' } ),
				testPartialDomain( { domain: 'example3.com' } ),
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

test( 'when two domains share the same underlying site, there is only one fetch for detailed domain info for that site', () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
	} );
	const [ notPrimaryPartial, notPrimaryFull ] = testDomain( {
		domain: 'not-primary-domain.blog',
		blog_id: 123,
		primary_domain: false,
	} );
	const [ differentSitePartial, differentSiteFull ] = testDomain( {
		domain: 'a-different-site.com',
		blog_id: 1337,
		primary_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( ( siteId ) =>
		Promise.resolve( {
			domains: siteId === 123 ? [ primaryFull, notPrimaryFull ] : [ differentSiteFull ],
		} )
	);

	render(
		<DomainsTable
			domains={ [ primaryPartial, notPrimaryPartial, differentSitePartial ] }
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	expect( fetchSiteDomains ).toHaveBeenCalledTimes( 2 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 1337 );
} );

test( 'when shouldDisplayPrimaryDomainLabel is true, the primary domain label is displayed if a domain is marked as primary', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'example.com',
		blog_id: 123,
		primary_domain: true,
		wpcom_domain: false,
	} );

	const [ notPrimaryPartial, notPrimaryFull ] = testDomain( {
		domain: 'example.wordpress.com',
		blog_id: 123,
		primary_domain: false,
		wpcom_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockImplementation( ( siteId ) =>
		Promise.resolve( {
			domains: siteId === 123 ? [ primaryFull, notPrimaryFull ] : [],
		} )
	);

	const { rerender } = render(
		<DomainsTable
			domains={ [ primaryPartial, notPrimaryPartial ] }
			fetchSiteDomains={ fetchSiteDomains }
			displayPrimaryDomainLabel
		/>
	);

	await waitFor( () => {
		const [ , rowOne, rowTwo ] = screen.getAllByRole( 'row' );

		expect( within( rowOne ).queryByText( 'example.com' ) ).toBeInTheDocument();
		expect( within( rowOne ).queryByText( 'Primary domain' ) ).toBeInTheDocument();

		expect( within( rowTwo ).queryByText( 'example.wordpress.com' ) ).toBeInTheDocument();
		expect( within( rowTwo ).queryByText( 'Primary domain' ) ).not.toBeInTheDocument();
	} );

	// Test that the label is not displayed when displayPrimaryDomainLabel is false
	rerender(
		<DomainsTable
			domains={ [ primaryPartial, notPrimaryPartial ] }
			fetchSiteDomains={ fetchSiteDomains }
			displayPrimaryDomainLabel={ false }
		/>
	);

	expect( screen.queryByText( 'Primary domain' ) ).not.toBeInTheDocument();
} );
