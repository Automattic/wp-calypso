/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';
import { DomainsTableRow } from '../domains-table-row';

const render = ( el ) =>
	renderWithProvider(
		<table>
			<tbody>{ el }</tbody>
		</table>
	);

test( 'domain name is rendered in the row', () => {
	render( <DomainsTableRow domain={ testPartialDomain( { domain: 'example1.com' } ) } /> );

	expect( screen.queryByText( 'example1.com' ) ).toBeInTheDocument();
} );

test( 'wpcom domains do not link to management interface', async () => {
	const [ partialDomain, fullDomain ] = testDomain( {
		domain: 'example.wordpress.com',
		blog_id: 123,
		primary_domain: false,
		wpcom_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ fullDomain ],
	} );

	render( <DomainsTableRow domain={ partialDomain } fetchSiteDomains={ fetchSiteDomains } /> );

	expect( screen.getByText( 'example.wordpress.com' ) ).not.toHaveAttribute( 'href' );
} );

test( 'domain name links to management interface', async () => {
	const [ partialDomain, fullDomain ] = testDomain( {
		domain: 'example.com',
		blog_id: 123,
		primary_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ fullDomain ],
	} );

	render( <DomainsTableRow domain={ partialDomain } fetchSiteDomains={ fetchSiteDomains } /> );

	// Expect the row to fetch detailed domain data
	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	// Before detailed domain data has loaded the link will use the blog ID
	expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
		'href',
		'/domains/manage/all/example.com/edit/123'
	);

	// After detailed domain data is loaded we expect the site's primary domain to be used in the URL fragment
	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/example.com/edit/example.com'
		)
	);
} );

test( 'non primary domain uses the primary domain as the site slug in its link URL', async () => {
	const [ partialDomain, fullDomain ] = testDomain( {
		domain: 'not-primary-domain.blog',
		blog_id: 123,
		primary_domain: false,
	} );
	const [ , primaryDomain ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ fullDomain, primaryDomain ],
	} );

	render( <DomainsTableRow domain={ partialDomain } fetchSiteDomains={ fetchSiteDomains } /> );

	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'not-primary-domain.blog' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/not-primary-domain.blog/edit/primary-domain.blog'
		)
	);
} );

test( 'redirect links use the unmapped domain for the site slug', async () => {
	const [ partialRedirectDomain, fullRedirectDomain ] = testDomain( {
		domain: 'redirect.blog',
		primary_domain: true,
		wpcom_domain: false,
		type: 'redirect',
		blog_id: 123,
	} );
	const [ , fullUnmappedDomain ] = testDomain( {
		domain: 'redirect-site.wordpress.com',
		primary_domain: false,
		wpcom_domain: true,
		type: 'wpcom',
		blog_id: 123,
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ fullRedirectDomain, fullUnmappedDomain ],
	} );

	render(
		<DomainsTableRow domain={ partialRedirectDomain } fetchSiteDomains={ fetchSiteDomains } />
	);

	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'redirect.blog' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/redirect.blog/redirect/redirect-site.wordpress.com'
		)
	);
} );

test( 'transfer links use the unmapped domain for the site slug', async () => {
	const [ partialDomain, fullDomain ] = testDomain( {
		domain: 'example.com',
		blog_id: 123,
		primary_domain: true,
		wpcom_domain: false,
		type: 'transfer',
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ fullDomain ],
	} );

	render( <DomainsTableRow domain={ partialDomain } fetchSiteDomains={ fetchSiteDomains } /> );

	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/example.com/transfer/in/example.com'
		)
	);
} );
