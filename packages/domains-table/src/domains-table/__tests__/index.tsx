/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React from 'react';
import { DomainsTable } from '..';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';

const render = ( el ) => renderWithProvider( el );

test( 'all domain names are rendered in the table', () => {
	const { rerender } = render(
		<DomainsTable
			columns={ [
				{
					name: 'domain',
					label: 'Domain',
				},
			] }
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

	rerender(
		<DomainsTable
			domains={ [] }
			columns={ [
				{
					name: 'domain',
					label: 'Domain',
				},
			] }
		/>
	);

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
			columns={ [
				{
					name: 'domain',
					label: 'Domain',
				},
			] }
			domains={ [ primaryPartial, notPrimaryPartial, differentSitePartial ] }
			fetchSiteDomains={ fetchSiteDomains }
		/>
	);

	expect( fetchSiteDomains ).toHaveBeenCalledTimes( 2 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 1337 );
} );
