/**
 * @jest-environment jsdom
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';
import { DomainsTable } from '../domains-table';
import { DomainsTableRow } from '../domains-table-row';

const render = ( el, props ) =>
	renderWithProvider( el, {
		wrapper: ( { children } ) => (
			<DomainsTable { ...props }>
				<tbody>{ children }</tbody>
			</DomainsTable>
		),
	} );

test( 'domain name is rendered in the row', () => {
	const partialDomain = testPartialDomain( { domain: 'example1.com' } );
	render( <DomainsTableRow domain={ partialDomain } />, {
		domains: [ partialDomain ],
		isAllSitesView: true,
	} );

	expect( screen.queryByText( 'example1.com' ) ).toBeInTheDocument();
} );

test( 'wpcom domains do not link to management interface', async () => {
	const partialDomain = testPartialDomain( {
		domain: 'example.wordpress.com',
		blog_id: 123,
		wpcom_domain: true,
	} );

	render( <DomainsTableRow domain={ partialDomain } />, {
		domains: [ partialDomain ],
		isAllSitesView: true,
	} );

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

	const { rerender } = render( <DomainsTableRow domain={ partialDomain } />, {
		domains: [ partialDomain ],
		isAllSitesView: true,
		fetchSite,
	} );

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
		<DomainsTable domains={ [ partialDomain ] } fetchSite={ fetchSite } isAllSitesView={ false }>
			<tbody>
				<DomainsTableRow domain={ partialDomain } />
			</tbody>
		</DomainsTable>
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

	const { rerender } = render( <DomainsTableRow domain={ partialRedirectDomain } />, {
		domains: [ partialRedirectDomain ],
		fetchSite,
		fetchSiteDomains,
		isAllSitesView: true,
	} );

	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'redirect.blog' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/redirect.blog/redirect/redirect-site.wordpress.com'
		)
	);

	// Test site-specific link
	rerender(
		<DomainsTable
			domains={ [ partialRedirectDomain ] }
			fetchSiteDomains={ fetchSiteDomains }
			isAllSitesView={ false }
		>
			<tbody>
				<DomainsTableRow domain={ partialRedirectDomain } />
			</tbody>
		</DomainsTable>
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

	const { rerender } = render( <DomainsTableRow domain={ partialDomain } />, {
		domains: [ partialDomain ],
		fetchSite,
		fetchSiteDomains,
		isAllSitesView: true,
	} );

	expect( fetchSiteDomains ).toHaveBeenCalledWith( 123 );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/all/example.com/transfer/in/example.com'
		)
	);

	// Test site-specific link
	rerender(
		<DomainsTable
			domains={ [ partialDomain ] }
			fetchSiteDomains={ fetchSiteDomains }
			isAllSitesView={ false }
		>
			<tbody>
				<DomainsTableRow domain={ partialDomain } />
			</tbody>
		</DomainsTable>
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

	render( <DomainsTableRow domain={ primaryPartial } />, {
		domains: [ primaryPartial ],
		fetchSite,
		fetchSiteDomains,
		isAllSitesView: true,
	} );

	await waitFor( () => expect( screen.queryByText( 'Primary Domain Blog' ) ).toBeInTheDocument() );
} );

test( 'Parenthetical username is removed from owner column', async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'Joe Blogs (joeblogs)',
		current_user_is_owner: false,
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ primaryFull ],
	} );

	const fetchSite = jest.fn().mockResolvedValue( { ID: 123, name: 'Primary Domain Blog' } );

	render( <DomainsTableRow domain={ primaryPartial } />, {
		domains: [ primaryPartial ],
		isAllSitesView: true,
		fetchSite,
		fetchSiteDomains,
	} );

	await waitFor( () => expect( screen.queryByText( 'Joe Blogs' ) ).toBeInTheDocument() );
} );

test( `Doesn't strip parentheses used in the name portion of the owner field`, async () => {
	const [ primaryPartial, primaryFull ] = testDomain( {
		domain: 'primary-domain.blog',
		blog_id: 123,
		primary_domain: true,
		owner: 'Joe (Danger) Blogs (joeblogs)',
		current_user_is_owner: false,
	} );

	const fetchSiteDomains = jest.fn().mockResolvedValue( {
		domains: [ primaryFull ],
	} );

	const fetchSite = jest.fn().mockResolvedValue( { ID: 123, name: 'Primary Domain Blog' } );

	render( <DomainsTableRow domain={ primaryPartial } />, {
		domains: [ primaryPartial ],
		fetchSite,
		fetchSiteDomains,
		isAllSitesView: true,
	} );

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

		render( <DomainsTableRow domain={ primaryPartial } />, {
			domains: [ primaryPartial ],
			fetchSite,
			fetchSiteDomains,
			isAllSitesView: true,
		} );

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

describe( 'expires or renew on cell', () => {
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

		render( <DomainsTableRow domain={ partialDomain } />, {
			domains: [ partialDomain ],
			isAllSitesView: true,
		} );

		expect( screen.getByText( /Aug 1, 2024/ ) ).toBeInTheDocument();
	} );

	test( 'when its not a registered domain, do not display an expiration date', () => {
		const partialDomain = testPartialDomain( {
			domain: 'example.wordpress.com',
			blog_id: 123,
			wpcom_domain: true,
			has_registration: false,
		} );

		render( <DomainsTableRow domain={ partialDomain } />, {
			domains: [ partialDomain ],
			isAllSitesView: true,
		} );

		expect( screen.getByText( '-' ) ).toBeInTheDocument();
	} );
} );

describe( 'domain status cell', () => {
	describe( 'mapped domain actions', () => {
		test( 'when a mapped domain is close to its expiry date and doesnt point to wpcom, refer the user to the mapping setup page', async () => {
			const [ partialDomain, fullDomain ] = testDomain( {
				domain: 'example.com',
				blog_id: 123,
				wpcom_domain: false,
				type: 'mapping',
				has_registration: false,
				expired: false,
				expiry: moment().add( 3, 'days' ).toISOString(),
				points_to_wpcom: false,
				auto_renewing: false,
			} );

			const fetchSiteDomains = jest.fn().mockResolvedValue( {
				domains: [ fullDomain ],
			} );

			const fetchSite = jest.fn().mockResolvedValue( {
				ID: 123,
				URL: 'https://example.com',
				options: { is_redirect: false },
			} );

			render( <DomainsTableRow domain={ partialDomain } />, {
				domains: [ partialDomain ],
				isAllSitesView: true,
				fetchSite,
				fetchSiteDomains,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Expiring soon' ) );
			} );

			const goToSetup = screen.getByText( 'Go to setup' );

			expect( goToSetup ).toBeInTheDocument();
			expect( goToSetup ).toHaveAttribute(
				'href',
				'/domains/mapping/example.com/setup/example.com?step=&show-errors=false&firstVisit=false'
			);

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				expect(
					screen.queryByText( "We noticed that something wasn't updated correctly." )
				).toBeInTheDocument();
			} );
		} );

		test( 'when a mapped domain has mapping errors, refer the user to the mapping setup page', async () => {
			const [ partialDomain, fullDomain ] = testDomain( {
				domain: 'example.com',
				blog_id: 123,
				wpcom_domain: false,
				type: 'mapping',
				has_registration: false,
				expired: false,
				registration_date: moment().subtract( 5, 'days' ).toISOString(),
				expiry: moment().add( 60, 'days' ).toISOString(),
				points_to_wpcom: false,
			} );

			const fetchSiteDomains = jest.fn().mockResolvedValue( {
				domains: [ fullDomain ],
			} );

			const fetchSite = jest.fn().mockResolvedValue( {
				ID: 123,
				URL: 'https://example.com',
				options: { is_redirect: false },
			} );

			render( <DomainsTableRow domain={ partialDomain } />, {
				domains: [ partialDomain ],
				isAllSitesView: true,
				fetchSite,
				fetchSiteDomains,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Error' ) );
			} );

			const goToSetup = screen.getByText( 'Go to setup' );

			expect( goToSetup ).toBeInTheDocument();
			expect( goToSetup ).toHaveAttribute(
				'href',
				'/domains/mapping/example.com/setup/example.com?step=&show-errors=false&firstVisit=false'
			);

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				expect(
					screen.queryByText( "We noticed that something wasn't updated correctly." )
				).toBeInTheDocument();
			} );
		} );
	} );
} );
