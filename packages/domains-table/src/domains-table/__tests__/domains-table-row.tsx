/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
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

test( 'when a site is associated with a domain, display its name', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ primaryFull ],
	} );

	const fetchSite = jest.fn().mockResolvedValue( { ID: 123, name: 'Primary Domain Blog' } );

	render(
		<DomainsTableRow
			domain={ primaryPartial }
			fetchSiteDomains={ fetchSiteDomains }
			fetchSite={ fetchSite }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	await waitFor( () => expect( screen.queryByText( 'Primary Domain Blog' ) ).toBeInTheDocument() );
} );

test( 'Parenthetical username is removed from owner column', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'Joe Blogs (joeblogs)',
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ primaryFull ],
	} );

	const fetchSite = jest.fn().mockResolvedValue( { ID: 123, name: 'Primary Domain Blog' } );

	render(
		<DomainsTableRow
			domain={ primaryPartial }
			fetchSiteDomains={ fetchSiteDomains }
			fetchSite={ fetchSite }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	await waitFor( () => expect( screen.queryByText( 'Joe Blogs' ) ).toBeInTheDocument() );
} );

test( `Doesn't strip parentheses used in the name portion of the owner field`, async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'Joe (Danger) Blogs (joeblogs)',
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ primaryFull ],
	} );

	const fetchSite = jest.fn().mockResolvedValue( { ID: 123, name: 'Primary Domain Blog' } );

	render(
		<DomainsTableRow
			domain={ primaryPartial }
			fetchSiteDomains={ fetchSiteDomains }
			fetchSite={ fetchSite }
			isAllSitesView
			isSelected={ false }
			onSelect={ noop }
		/>
	);

	await waitFor( () => expect( screen.queryByText( 'Joe (Danger) Blogs' ) ).toBeInTheDocument() );
} );

describe( 'site linking ctas', () => {
	beforeAll( () => {
		global.ResizeObserver = require( 'resize-observer-polyfill' );
	} );

	test( 'when a site is not associated with a domain, display the site linking ctas', async () => {
		const [ primaryPartial, primaryFull ] = testDomain( {
			domain: 'primary-domain.blog',
			blog_id: 123,
			primary_domain: true,
			current_user_can_create_site_from_domain_only: true,
		} );

		const fetchSiteDomains = jest.fn().mockResolvedValue( {
			domains: [ primaryFull ],
		} );

		const fetchSite = jest.fn().mockResolvedValue( {
			ID: 123,
			URL: 'https://primarydomainblog.wordpress.com',
			options: { is_redirect: false },
		} );

		render(
			<DomainsTableRow
				domain={ primaryPartial }
				fetchSiteDomains={ fetchSiteDomains }
				fetchSite={ fetchSite }
				isAllSitesView
				isSelected={ false }
				onSelect={ noop }
			/>
		);

		await waitFor( () => {
			const createLink = screen.queryByText( 'Add site' );

			expect( createLink ).toBeInTheDocument();
			expect( createLink ).toHaveAttribute(
				'href',
				'/start/site-selected/?siteSlug=primarydomainblog.wordpress.com&siteId=123'
			);
		} );

		const domainActionsButton = screen.getByLabelText( 'Domain actions' );

		expect( domainActionsButton ).toBeInTheDocument();
		fireEvent.click( domainActionsButton );

		await waitFor( () => {
			const connectAction = screen.getByText( 'Connect to an existing site' );

			// The link itself is wrapped with a span element.
			expect( connectAction.closest( '[role=menuitem]' ) ).toHaveAttribute(
				'href',
				'/domains/manage/all/primary-domain.blog/transfer/other-site/primarydomainblog.wordpress.com'
			);
		} );
	} );
} );

describe( 'registered until cell', () => {
	let dateTimeFormatSpy;

	beforeAll( () => {
		const OriginalTimeFormat = Intl.DateTimeFormat;
		dateTimeFormatSpy = jest.spyOn( global.Intl, 'DateTimeFormat' );
		dateTimeFormatSpy.mockImplementation(
			( locale, options ) => new OriginalTimeFormat( locale, { ...options, timeZone: 'UTC' } )
		);
	} );

	afterAll( () => {
		dateTimeFormatSpy.mockClear();
	} );

	test( 'when a domain is registered, display its expiration date', () => {
		const partialDomain = testPartialDomain( {
			domain: 'example.com',
			blog_id: 123,
			wpcom_domain: false,
			has_registration: true,
			expiry: '2024-08-01T00:00:00+00:00',
		} );

		render(
			<DomainsTableRow
				domain={ partialDomain }
				isAllSitesView
				isSelected={ false }
				onSelect={ noop }
			/>
		);

		expect( screen.getByText( 'Aug 1, 2024' ) ).toBeInTheDocument();
	} );

	test( 'when its not a registered domain, do not display an expiration date', () => {
		const partialDomain = testPartialDomain( {
			domain: 'example.wordpress.com',
			blog_id: 123,
			wpcom_domain: true,
			has_registration: false,
		} );

		render(
			<DomainsTableRow
				domain={ partialDomain }
				isAllSitesView
				isSelected={ false }
				onSelect={ noop }
			/>
		);

		expect( screen.getByText( '-' ) ).toBeInTheDocument();
	} );
} );
