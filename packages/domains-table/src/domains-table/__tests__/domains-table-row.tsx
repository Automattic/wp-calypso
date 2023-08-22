/**
 * @jest-environment jsdom
 */
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';
import { DomainsTableRow } from '../domains-table-row';

const noop = jest.fn();

const render = ( el ) =>
	renderWithProvider( el, {
		wrapper: ( { children } ) => (
			<table>
				<tbody>{ children }</tbody>
			</table>
		),
	} );

test( 'domain name is rendered in the row', () => {
	render(
		<DomainsTableRow
			domain={ testPartialDomain( { domain: 'example1.com' } ) }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	expect( screen.queryByText( 'example1.com' ) ).toBeInTheDocument();
} );

test( 'wpcom domains do not link to management interface', async () => {
	const partialDomain = testPartialDomain( {
		domain: 'example.wordpress.com',
		blog_id: 123,
		wpcom_domain: true,
	} );

	render(
		<DomainsTableRow
			domain={ partialDomain }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	expect( screen.getByText( 'example.wordpress.com' ) ).not.toHaveAttribute( 'href' );
} );

test( 'domain name links to management interface', async () => {
	const partialDomain = testPartialDomain( {
		domain: 'example.com',
		blog_id: 123,
	} );

	const fetchSite = jest.fn().mockResolvedValue( {
		URL: 'https://my-site.com',
		options: { is_redirect: false },
	} );

	const { rerender } = render(
		<DomainsTableRow
			domain={ partialDomain }
			fetchSite={ fetchSite }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	// Expect the row to fetch detailed site data
	expect( fetchSite ).toHaveBeenCalledWith( 123 );

	// Before site data has loaded the link will use the blog ID
	expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
		'href',
		'/domains/manage/all/example.com/edit/123'
	);

	// After detailed domain data is loaded we expect the site slug to be used in the URL fragment
	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/example.com/edit/my-site.com'
		)
	);

	// Test site-specific link
	rerender(
		<DomainsTableRow
			domain={ partialDomain }
			fetchSite={ fetchSite }
			isAllSitesView={ false }
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
		'href',
		'/domains/manage/example.com/edit/my-site.com'
	);
} );

test( `redirect links use the site's unmapped URL for the site slug`, async () => {
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

	const fetchSite = jest.fn().mockResolvedValue( {
		URL: 'http://redirect.blog',
		options: { is_redirect: true, unmapped_url: 'http://redirect-site.wordpress.com' },
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ fullRedirectDomain, fullUnmappedDomain ],
	} );

	const { rerender } = render(
		<DomainsTableRow
			domain={ partialRedirectDomain }
			fetchSiteDomains={ fetchSiteDomains }
			fetchSite={ fetchSite }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'redirect.blog' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/redirect.blog/redirect/redirect-site.wordpress.com'
		)
	);

	// Test site-specific link
	rerender(
		<DomainsTableRow
			domain={ partialRedirectDomain }
			fetchSiteDomains={ fetchSiteDomains }
			isAllSitesView={ false }
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	expect( screen.getByRole( 'link', { name: 'redirect.blog' } ) ).toHaveAttribute(
		'href',
		'/domains/manage/redirect.blog/redirect/redirect-site.wordpress.com'
	);
} );

test( 'transfer domains link to the transfer management interface', async () => {
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

	const fetchSite = jest.fn().mockResolvedValue( {
		URL: 'http://example.com',
		options: { is_redirect: false },
	} );

	const { rerender } = render(
		<DomainsTableRow
			domain={ partialDomain }
			fetchSiteDomains={ fetchSiteDomains }
			fetchSite={ fetchSite }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/example.com/transfer/in/example.com'
		)
	);

	// Test site-specific link
	rerender(
		<DomainsTableRow
			domain={ partialDomain }
			fetchSiteDomains={ fetchSiteDomains }
			isAllSitesView={ false }
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
		'href',
		'/domains/manage/example.com/transfer/in/example.com'
	);
} );
