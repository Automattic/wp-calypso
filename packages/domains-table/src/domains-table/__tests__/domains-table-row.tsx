/**
 * @jest-environment jsdom
 */
import { DomainData } from '@automattic/data-stores';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import moment from 'moment';
import React from 'react';
import { renderWithProvider, testDomain, testPartialDomain } from '../../test-utils';
import { transferStatus } from '../../utils/constants';
import {
	DomainsTableProps,
	DomainsTableStateContext,
	useGenerateDomainsTableState,
} from '../domains-table';
import { DomainsTableRow } from '../domains-table-row';

const siteSlug = 'site123.com';

const render = ( el, props ) =>
	renderWithProvider( el, {
		wrapper: function Wrapper( { children } ) {
			return (
				<DomainsTableStateContext.Provider value={ useGenerateDomainsTableState( props ) }>
					<table>
						<tbody>{ children }</tbody>
					</table>
				</DomainsTableStateContext.Provider>
			);
		},
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

test( 'domain name links to management interface (all-domains table)', async () => {
	const partialDomain = testPartialDomain( {
		domain: 'example.com',
		blog_id: 123,
	} );

	const fetchSite = jest.fn().mockResolvedValue( {
		URL: 'https://my-site.com',
		options: { is_redirect: false },
	} );

	render( <DomainsTableRow domain={ partialDomain } />, {
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
} );

test( 'domain name links to management interface (site-specific table)', async () => {
	const partialDomain = testPartialDomain( {
		domain: 'example.com',
		blog_id: 123,
	} );

	const fetchSite = jest.fn().mockResolvedValue( {
		URL: 'https://my-site.com',
		options: { is_redirect: false },
	} );

	render( <DomainsTableRow domain={ partialDomain } />, {
		siteSlug,
		domains: [ partialDomain ],
		fetchSite,
		isAllSitesView: false,
	} );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/example.com/edit/my-site.com'
		)
	);
} );

test( `redirect links use the site's unmapped URL for the site slug (all-domains table)`, async () => {
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

	render( <DomainsTableRow domain={ partialRedirectDomain } />, {
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
} );

test( `redirect links use the site's unmapped URL for the site slug (site-specific table)`, async () => {
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

	render( <DomainsTableRow domain={ partialRedirectDomain } />, {
		siteSlug,
		domains: [ partialRedirectDomain ],
		fetchSite,
		fetchSiteDomains,
		isAllSitesView: false,
	} );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'redirect.blog' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/redirect.blog/redirect/redirect-site.wordpress.com'
		)
	);
} );

test( 'transfer domains link to the transfer management interface (all-domains table)', async () => {
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

	render( <DomainsTableRow domain={ partialDomain } />, {
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
} );

test( 'transfer domains link to the transfer management interface (site-specific table)', async () => {
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

	render( <DomainsTableRow domain={ partialDomain } />, {
		siteSlug,
		domains: [ partialDomain ],
		fetchSite,
		fetchSiteDomains,
		isAllSitesView: false,
	} );

	await waitFor( () =>
		expect( screen.getByRole( 'link', { name: 'example.com' } ) ).toHaveAttribute(
			'href',
			'/domains/manage/example.com/transfer/in/example.com'
		)
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

describe( 'selected domain', () => {
	test( 'when a domain is selected, the row should have the is-selected class', () => {
		const partialDomain = testPartialDomain( { domain: 'example1.com' } );
		render( <DomainsTableRow domain={ partialDomain } />, {
			selectedDomainName: 'example1.com',
		} );

		expect( screen.getByRole( 'row' ) ).toHaveClass( 'is-selected' );
	} );

	test( 'when a domain is not selected, the row should not have the is-selected class', () => {
		const partialDomain = testPartialDomain( { domain: 'example1.com' } );
		render( <DomainsTableRow domain={ partialDomain } />, {
			selectedDomainName: 'example2.com',
		} );

		expect( screen.getByRole( 'row' ) ).not.toHaveClass( 'is-selected' );
	} );
} );

describe( 'site linking ctas', () => {
	beforeAll( () => {
		global.ResizeObserver = require( 'resize-observer-polyfill' );
	} );

	test( 'when a site is not associated with a domain and the user has no connectable sites, display the site linking ctas targeting site creation', async () => {
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
			const createLink = screen.getByRole( 'link', { name: 'Add site' } );

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
			const connectAction = screen.getByTestId( 'add-site-menu-link' );

			// The link itself is wrapped with a span element.
			expect( connectAction.closest( '[role=menuitem]' ) ).toHaveAttribute(
				'href',
				'/start/site-selected/?siteSlug=primarydomainblog.wordpress.com&siteId=123'
			);
		} );
	} );

	test( 'when a site is not associated with a domain and the user has connectable sites, display the site linking ctas targeting site transfer', async () => {
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
			hasConnectableSites: true,
		} );

		await waitFor( () => {
			const createLink = screen.getByRole( 'link', { name: 'Add site' } );

			expect( createLink ).toBeInTheDocument();
			expect( createLink ).toHaveAttribute(
				'href',
				'/domains/manage/all/primary-domain.blog/transfer/other-site/primarydomainblog.wordpress.com'
			);
		} );

		const domainActionsButton = screen.getByLabelText( 'Domain actions' );

		expect( domainActionsButton ).toBeInTheDocument();
		fireEvent.click( domainActionsButton );

		await waitFor( () => {
			const connectAction = screen.getByTestId( 'add-site-menu-link' );

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

		const expiresRenewsOnCell = screen.getByTestId( 'expires-renews-on' );
		expect( expiresRenewsOnCell ).toHaveTextContent( '-' );
	} );
} );

describe( 'domain status cell', () => {
	const renderDomainStatusCell = (
		domain: Partial< DomainData >,
		props?: Partial< DomainsTableProps >
	) => {
		const [ partialDomain, fullDomain ] = testDomain( domain );

		const fetchSiteDomains = jest.fn().mockResolvedValue( {
			domains: [ fullDomain ],
		} );

		const fetchSite = jest.fn().mockResolvedValue( {
			ID: 123,
			URL: 'https://example.com',
			options: { is_redirect: false },
		} );

		return render( <DomainsTableRow domain={ partialDomain } />, {
			domains: [ partialDomain ],
			isAllSitesView: true,
			fetchSite,
			fetchSiteDomains,
			...props,
		} );
	};

	describe( 'mapped domain actions', () => {
		test( 'when a mapped domain is close to its expiry date and doesnt point to wpcom, refer the user to the mapping setup page', async () => {
			renderDomainStatusCell( {
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
			renderDomainStatusCell( {
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

	describe( 'expired domains actions', () => {
		let dateTimeFormatSpy;
		const OriginalTimeFormat = Intl.DateTimeFormat;

		beforeAll( () => {
			dateTimeFormatSpy = jest.spyOn( global.Intl, 'DateTimeFormat' );
			dateTimeFormatSpy.mockImplementation(
				( locale, options ) => new OriginalTimeFormat( locale, { ...options, timeZone: 'UTC' } )
			);
		} );

		afterAll( () => {
			dateTimeFormatSpy.mockClear();
		} );

		test( 'when the domain expires, display a renew now cta if the user is the owner', async () => {
			const onRenewNowClick = jest.fn();

			renderDomainStatusCell(
				{
					domain: 'example.com',
					blog_id: 123,
					wpcom_domain: false,
					expired: true,
					is_renewable: true,
					expiry: '2023-08-01T00:00:00+00:00',
					renewable_until: '2024-08-01T00:00:00+00:00',
					current_user_is_owner: true,
				},
				{
					domainStatusPurchaseActions: {
						isPurchasedDomain: () => true,
						onRenewNowClick,
					},
				}
			);

			await waitFor( () => {
				expect( screen.getByText( 'Expired' ) );
			} );

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				expect( screen.getByRole( 'tooltip' ) ).toHaveTextContent(
					'This domain expired on August 1, 2023. You can renew the domain at the regular rate until August 1, 2024.'
				);
			} );

			const renewNowButton = screen.getByText( 'Renew now' );

			expect( renewNowButton ).toBeInTheDocument();
			fireEvent.click( renewNowButton );

			expect( onRenewNowClick ).toHaveBeenCalledWith(
				'example.com',
				expect.objectContaining( {
					domain: 'example.com',
				} )
			);
		} );

		test( 'when the domain expires, display a notice if the user is not the owner', async () => {
			renderDomainStatusCell(
				{
					domain: 'example.com',
					blog_id: 123,
					wpcom_domain: false,
					expired: true,
					is_renewable: true,
					expiry: '2023-08-01T00:00:00+00:00',
					renewable_until: '2024-08-01T00:00:00+00:00',
					current_user_is_owner: false,
				},
				{
					domainStatusPurchaseActions: {
						isPurchasedDomain: () => true,
					},
				}
			);

			await waitFor( () => {
				expect( screen.getByText( 'Expired' ) );
			} );

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				expect( screen.getByRole( 'tooltip' ) ).toHaveTextContent(
					'This domain expired on August 1, 2023. The domain owner can renew the domain at the regular rate until August 1, 2024.'
				);
			} );

			const renewNowButton = screen.queryByText( 'Renew now' );

			expect( renewNowButton ).not.toBeInTheDocument();
		} );

		test( 'when the domain expires, display a renew now with credits cta if the user is the owner', async () => {
			const onRenewNowClick = jest.fn();

			renderDomainStatusCell(
				{
					domain: 'example.com',
					blog_id: 123,
					wpcom_domain: false,
					expired: true,
					is_renewable: false,
					is_redeemable: true,
					expiry: '2023-08-01T00:00:00+00:00',
					redeemable_until: '2024-08-01T00:00:00+00:00',
					current_user_is_owner: true,
				},
				{
					domainStatusPurchaseActions: {
						isPurchasedDomain: () => true,
						onRenewNowClick,
					},
				}
			);

			await waitFor( () => {
				expect( screen.getByText( 'Expired' ) );
			} );

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				expect( screen.getByRole( 'tooltip' ) ).toHaveTextContent(
					'This domain expired on August 1, 2023. You can still renew the domain until August 1, 2024 by paying an additional redemption fee.'
				);
			} );

			const renewNowButton = screen.getByText( 'Renew now' );

			expect( renewNowButton ).toBeInTheDocument();
			fireEvent.click( renewNowButton );

			expect( onRenewNowClick ).toHaveBeenCalledWith(
				'example.com',
				expect.objectContaining( {
					domain: 'example.com',
				} )
			);
		} );

		test( 'when the domain expires, display a notice if the domain is redeemable but the user is not the owner', async () => {
			renderDomainStatusCell(
				{
					domain: 'example.com',
					blog_id: 123,
					wpcom_domain: false,
					expired: true,
					is_renewable: false,
					is_redeemable: true,
					expiry: '2023-08-01T00:00:00+00:00',
					redeemable_until: '2024-08-01T00:00:00+00:00',
					current_user_is_owner: false,
				},
				{
					domainStatusPurchaseActions: {
						isPurchasedDomain: () => true,
					},
				}
			);

			await waitFor( () => {
				expect( screen.getByText( 'Expired' ) );
			} );

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				expect( screen.getByRole( 'tooltip' ) ).toHaveTextContent(
					'This domain expired on August 1, 2023. The domain owner can still renew the domain until August 1, 2024 by paying an additional redemption fee.'
				);
			} );

			const renewNowButton = screen.queryByText( 'Renew now' );

			expect( renewNowButton ).not.toBeInTheDocument();
		} );
	} );

	describe( 'domain about to expire actions', () => {
		test( 'when there is less than 30 days to expire and the viewer is the owner, display the renew now cta', async () => {
			const onRenewNowClick = jest.fn();

			renderDomainStatusCell(
				{
					domain: 'example.com',
					blog_id: 123,
					wpcom_domain: false,
					type: 'registered',
					has_registration: true,
					current_user_is_owner: true,
					expired: false,
					expiry: moment().add( 29, 'days' ).toISOString(),
				},
				{
					domainStatusPurchaseActions: {
						isPurchasedDomain: () => true,
						onRenewNowClick,
					},
				}
			);

			await waitFor( () => {
				expect( screen.getByText( 'Expiring soon' ) );
			} );

			const renewNow = screen.getByText( 'Renew now' );

			expect( renewNow ).toBeInTheDocument();
			fireEvent.click( renewNow );

			expect( onRenewNowClick ).toHaveBeenCalledWith(
				'example.com',
				expect.objectContaining( {
					domain: 'example.com',
				} )
			);

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				const tooltip = screen.getByRole( 'tooltip' );

				expect( tooltip ).toHaveTextContent( /This domain will expire on\s.+\./ );
			} );
		} );

		test( 'when there is less than 30 days to expire and the viewer is not the owner, display the renew notice', async () => {
			const onRenewNowClick = jest.fn();

			renderDomainStatusCell(
				{
					domain: 'example.com',
					blog_id: 123,
					wpcom_domain: false,
					type: 'registered',
					has_registration: true,
					current_user_is_owner: false,
					expired: false,
					expiry: moment().add( 29, 'days' ).toISOString(),
				},
				{
					domainStatusPurchaseActions: {
						isPurchasedDomain: () => true,
						onRenewNowClick,
					},
				}
			);

			await waitFor( () => {
				expect( screen.getByText( 'Expiring soon' ) );
			} );

			const renewNow = screen.queryByText( 'Renew now' );

			expect( renewNow ).not.toBeInTheDocument();

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				const tooltip = screen.getByRole( 'tooltip' );

				expect( tooltip ).toHaveTextContent(
					/This domain will expire on\s.+\. It can be renewed by the owner./
				);
			} );
		} );
	} );

	describe( 'verify domain e-mail actions', () => {
		test( 'when there domain is pending e-mail verification and the viewer is the owner, display the change email cta', async () => {
			renderDomainStatusCell( {
				domain: 'example.com',
				blog_id: 123,
				wpcom_domain: false,
				type: 'registered',
				has_registration: true,
				is_pending_icann_verification: true,
				is_icann_verification_suspended: false,
				current_user_is_owner: true,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Verify email' ) );
			} );

			const changeAddress = screen.queryByText( 'Change address' );

			expect( changeAddress ).toBeInTheDocument();
			expect( changeAddress ).toHaveAttribute(
				'href',
				'/domains/manage/example.com/edit-contact-info/example.com'
			);

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				const tooltip = screen.getByRole( 'tooltip' );

				expect( tooltip ).toHaveTextContent(
					'We sent you an email to verify your contact information. Please complete the verification or your domain will stop working.'
				);
			} );
		} );

		test( 'when there domain is pending e-mail verification and the viewer is not the owner, display a notice', async () => {
			renderDomainStatusCell( {
				domain: 'example.com',
				blog_id: 123,
				wpcom_domain: false,
				type: 'registered',
				has_registration: true,
				is_pending_icann_verification: true,
				is_icann_verification_suspended: false,
				current_user_is_owner: false,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Verify email' ) );
			} );

			const changeAddress = screen.queryByText( 'Change address' );
			expect( changeAddress ).not.toBeInTheDocument();

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				const tooltip = screen.getByRole( 'tooltip' );

				expect( tooltip ).toHaveTextContent(
					'We sent an email to the domain owner. Please complete the verification or your domain will stop working.'
				);
			} );
		} );
	} );

	test( 'when the domain is transferred but doesnt point to wpcom, display the cta so the user can point it', async () => {
		renderDomainStatusCell( {
			domain: 'example.com',
			blog_id: 123,
			wpcom_domain: false,
			type: 'registered',
			has_registration: true,
			points_to_wpcom: false,
			transfer_status: transferStatus.COMPLETED,
		} );

		await waitFor( () => {
			expect( screen.getByText( 'Active' ) );
		} );

		const changeAddress = screen.queryByText( 'Point to WordPress.com' );
		expect( changeAddress ).toBeInTheDocument();
		expect( changeAddress ).toHaveAttribute(
			'href',
			'/domains/manage/example.com/edit/example.com?nameservers=true'
		);

		fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

		await waitFor( () => {
			const tooltip = screen.getByRole( 'tooltip' );

			expect( tooltip ).toHaveTextContent(
				'Transfer successful! To make this domain work with your WordPress.com site you need to point it to WordPress.com servers.'
			);
		} );
	} );

	describe( 'transfer actions', () => {
		test( 'when the domain is ready to be transferred, offer the user a way to start it', async () => {
			renderDomainStatusCell( {
				domain: 'example.com',
				blog_id: 123,
				wpcom_domain: false,
				type: 'transfer',
				has_registration: true,
				points_to_wpcom: false,
				transfer_status: transferStatus.PENDING_START,
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Complete setup' ) );
			} );

			const changeAddress = screen.queryByText( 'Start transfer' );
			expect( changeAddress ).toBeInTheDocument();
			expect( changeAddress ).toHaveAttribute(
				'href',
				'/domains/add/use-my-domain/example.com?initialQuery=example.com&initialMode=start-pending-transfer'
			);

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				const tooltip = screen.getByRole( 'tooltip' );

				expect( tooltip ).toHaveTextContent(
					'You need to start the domain transfer for your domain.'
				);
			} );
		} );

		test( 'when the last attempt to transfer failed, offer the user a way to retry it', async () => {
			renderDomainStatusCell( {
				domain: 'example.com',
				blog_id: 123,
				wpcom_domain: false,
				type: 'transfer',
				has_registration: true,
				points_to_wpcom: true,
				last_transfer_error: 'failed',
			} );

			await waitFor( () => {
				expect( screen.getByText( 'Complete setup' ) );
			} );

			const changeAddress = screen.queryByText( 'Retry transfer' );
			expect( changeAddress ).toBeInTheDocument();
			expect( changeAddress ).toHaveAttribute(
				'href',
				'/domains/manage/example.com/transfer/example.com'
			);

			fireEvent.mouseOver( screen.getByLabelText( 'More information' ) );

			await waitFor( () => {
				const tooltip = screen.getByRole( 'tooltip' );

				expect( tooltip ).toHaveTextContent(
					'There was an error when initiating your domain transfer. Please see the details or retry.'
				);
			} );
		} );
	} );

	describe( 'renew now is in domain actions', () => {
		test( 'when a domain is renewable, check the Renew now is in the domain actions', async () => {
			const onRenewNowClick = jest.fn();

			renderDomainStatusCell(
				{
					domain: 'example.com',
					blog_id: 123,
					wpcom_domain: false,
					subscription_id: '123',
					is_renewable: true,
					current_user_can_manage: true,
					expiry: moment().add( 12, 'months' ).toISOString(),
				},
				{
					domainStatusPurchaseActions: {
						isPurchasedDomain: () => true,
						onRenewNowClick,
					},
				}
			);

			await waitFor( () => {
				expect( screen.getByText( 'Active' ) );
			} );

			const domainActionsButton = screen.getByLabelText( 'Domain actions' );

			expect( domainActionsButton ).toBeInTheDocument();
			fireEvent.click( domainActionsButton );

			await waitFor( () => {
				const renewNowAction = screen.getByText( 'Renew now' );

				expect( renewNowAction ).toBeInTheDocument();
				fireEvent.click( renewNowAction );

				expect( onRenewNowClick ).toHaveBeenCalledWith(
					'example.com',
					expect.objectContaining( {
						domain: 'example.com',
					} )
				);
			} );
		} );
	} );
} );
