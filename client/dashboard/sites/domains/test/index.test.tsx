/**
 * @jest-environment jsdom
 */

import { domainsQuery, sslDetailsQuery } from '@automattic/api-queries';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { SITE_CONTEXT_VIEW } from '../../../domains/dataviews/views';
import { render } from '../../../test-utils';
import SiteDomains from '../index';
import type { Site, User } from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';

let mockSearchParams: { action?: string } = {};
let mockHasEnTranslation = true;

jest.mock( '@automattic/i18n-utils', () => ( {
	...jest.requireActual( '@automattic/i18n-utils' ),
	useHasEnTranslation: () => () => mockHasEnTranslation,
} ) );

jest.mock( '../../../app/router/sites', () => {
	const actual = jest.requireActual( '../../../app/router/sites' );
	return {
		...actual,
		siteRoute: {
			useParams: () => ( { siteSlug: 'test-site.wordpress.com' } ),
			fullPath: '/sites/$siteSlug',
		},
		siteDomainsRoute: {
			...actual.siteDomainsRoute,
			useSearch: () => mockSearchParams,
			fullPath: '/sites/$siteSlug/domains',
		},
	};
} );

const SITE_ID = 1;
const OWNER_USER_ID = 10;
const NON_OWNER_USER_ID = 99;

const site = {
	ID: SITE_ID,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	site_owner: OWNER_USER_ID,
} as unknown as Site;

const defaultAddressDomain = {
	domain: 'test-site.wordpress.com',
	blog_id: SITE_ID,
	blog_name: 'Test Site',
	site_slug: 'test-site.wordpress.com',
	subtype: { id: 'default_address', label: 'Default Address' },
	domain_status: { id: 'active', label: 'Active', type: 'success' },
	auto_renewing: false,
	current_user_is_owner: true,
	is_domain_only_site: false,
	expiry: null,
	expired: false,
	primary_domain: false,
	can_set_as_primary: false,
	subscription_id: null,
	tags: [],
};

const domain = {
	domain: 'test-site.com',
	blog_id: SITE_ID,
	blog_name: 'Test Site',
	site_slug: 'test-site.wordpress.com',
	subtype: { id: 'domain_registration', label: 'Domain Registration' },
	domain_status: { id: 'active', label: 'Active', type: 'success' },
	auto_renewing: true,
	current_user_is_owner: true,
	is_domain_only_site: false,
	expiry: null,
	expired: false,
	primary_domain: true,
	can_set_as_primary: false,
	subscription_id: null,
	tags: [],
};

const primaryCandidateDomain = {
	...domain,
	domain: 'candidate.com',
	subtype: { id: 'domain_connection', label: 'Domain Connection' },
	domain_status: { id: 'active', label: 'Active', type: 'success' },
	primary_domain: false,
	can_set_as_primary: true,
};

const expiredDomain = {
	...domain,
	domain: 'expired.blog',
	domain_status: { id: 'expired', label: 'Expired', type: 'error' },
	expiry: '2026-09-04T00:00:00+00:00',
	expired: true,
	primary_domain: false,
	subscription_id: '123',
};

const ownerUser = {
	ID: OWNER_USER_ID,
	username: 'owner',
	email: 'owner@example.com',
	language: 'en',
	meta: { data: { flags: { active_flags: [] } } },
} as unknown as User;

const nonOwnerUser = {
	ID: NON_OWNER_USER_ID,
	username: 'non-owner',
	email: 'nonowner@example.com',
	language: 'en',
	meta: { data: { flags: { active_flags: [] } } },
} as unknown as User;

const siteWithPrimaryDomainFeature = {
	...site,
	plan: { is_free: false, features: { active: [ 'set-primary-custom-domain' ] } },
} as unknown as Site;

function mockApis( {
	domains = [ domain, defaultAddressDomain ],
	ssl,
	preferences = {},
	siteResponse = site,
}: {
	domains?: unknown[];
	ssl?: { domain: string; certificate_provisioned: boolean; is_newly_registered?: boolean };
	preferences?: Record< string, unknown >;
	siteResponse?: Site;
} = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, siteResponse );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/all-domains' )
		.query( true )
		.reply( 200, { domains } );

	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ SITE_ID }/domains/redirect` )
		.query( true )
		.reply( 200, {} );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );

	if ( ssl ) {
		nock( 'https://public-api.wordpress.com' )
			.get( `/wpcom/v2/domains/ssl/${ ssl.domain }/` )
			.query( true )
			.reply( 200, {
				data: {
					certificate_provisioned: ssl.certificate_provisioned,
					is_newly_registered: ssl.is_newly_registered ?? false,
					is_expired: false,
				},
			} )
			.persist();
	}
}

const SAVED_TABLE_VIEW = {
	...SITE_CONTEXT_VIEW,
	type: 'table',
	layout: { density: 'balanced' },
};

// The action and status checks below only mean something once the SSL details have arrived.
const waitForSslDetails = ( queryClient: QueryClient, domainName: string ) =>
	waitFor( () =>
		expect( queryClient.getQueryData( sslDetailsQuery( domainName ).queryKey ) ).toBeDefined()
	);

describe( '<SiteDomains>', () => {
	beforeEach( () => {
		mockSearchParams = {};
		mockHasEnTranslation = true;
		mockApis();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'shows "Use a domain name I own" and "Add new domain" buttons for site owner', async () => {
		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.getByRole( 'button', { name: 'Use a domain name I own' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add new domain' } ) ).toBeVisible();
	} );

	test( 'shows "Use a domain name I own" and "Add new domain" buttons for non-owner', async () => {
		render( <SiteDomains />, { user: nonOwnerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.getByRole( 'button', { name: 'Use a domain name I own' } ) ).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Add new domain' } ) ).toBeVisible();
	} );

	test( 'falls back to the previous copy until the new strings are translated', async () => {
		mockHasEnTranslation = false;

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.getByRole( 'button', { name: 'Add domain name' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Add new domain' } ) ).not.toBeInTheDocument();
	} );

	test( 'opens the change site address modal when deep linked', async () => {
		mockSearchParams = { action: 'change-site-address' };

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByRole( 'dialog', { name: 'Change site address' } ) ).toBeVisible();
	} );

	test( 'sorts domains by whether they are primary', async () => {
		nock.cleanAll();
		mockApis( {
			preferences: {
				'hosting-dashboard-dataviews-view-site-domains': {
					...SITE_CONTEXT_VIEW,
					sort: { field: 'is_primary_domain', direction: 'desc' },
				},
			},
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'group', { name: 'test-site.com' } );
		expect(
			screen.getAllByRole( 'heading', { level: 3 } ).map( ( heading ) => heading.textContent )
		).toEqual( [ 'test-site.wordpress.com', 'test-site.com' ] );
	} );

	test( 'does not show an SSL status on the cards', async () => {
		nock.cleanAll();
		mockApis( {
			ssl: { domain: domain.domain, certificate_provisioned: true },
		} );

		const { queryClient } = render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'group', { name: domain.domain } );
		await waitForSslDetails( queryClient, domain.domain );
		expect( screen.queryByText( /^SSL/ ) ).not.toBeInTheDocument();
	} );

	test( 'shows the cards by default, with the actions on them', async () => {
		render( <SiteDomains />, { user: ownerUser } );

		const card = await screen.findByRole( 'group', { name: domain.domain } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Layout' } ) ).not.toBeInTheDocument();
		expect( within( card ).getByRole( 'button', { name: 'Settings' } ) ).toBeVisible();
		expect( within( card ).getByRole( 'button', { name: 'DNS' } ) ).toBeVisible();
	} );

	test( 'shows cards with the layout switch when the site has 16 domains', async () => {
		nock.cleanAll();
		mockApis( {
			domains: Array.from( { length: 16 }, ( _, index ) => ( {
				...domain,
				domain: `domain${ index }.com`,
				primary_domain: index === 0,
			} ) ),
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'group', { name: 'domain0.com' } );
		expect( screen.queryByRole( 'table' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'shows a table by default when the site has 17 domains', async () => {
		nock.cleanAll();
		mockApis( {
			domains: Array.from( { length: 17 }, ( _, index ) => ( {
				...domain,
				domain: `domain${ index }.com`,
				primary_domain: index === 0,
			} ) ),
		} );

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByRole( 'table' ) ).toBeVisible();
		expect( screen.queryByRole( 'group', { name: 'domain0.com' } ) ).not.toBeInTheDocument();
	} );

	test( 'marks the primary address on its card, with its www prefix', async () => {
		nock.cleanAll();
		mockApis( { domains: [ { ...domain, primary_domain: true, primary_is_www: true } ] } );

		render( <SiteDomains />, { user: ownerUser } );

		const card = await screen.findByRole( 'group', { name: /test-site\.com$/ } );
		expect( within( card ).getByRole( 'heading', { level: 3 } ) ).toHaveTextContent(
			`www.${ domain.domain }`
		);
		expect( within( card ).getByText( 'Primary site address' ) ).toBeVisible();
	} );

	test.each( [
		[ 'domain_registration', 'Registered with us' ],
		[ 'domain_connection', 'Connected domain name' ],
	] )( 'says a primary %s is the primary address, not its type', async ( id, typeLabel ) => {
		nock.cleanAll();
		mockApis( {
			domains: [ { ...domain, primary_domain: true, subtype: { id, label: 'From the API' } } ],
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const card = await screen.findByRole( 'group', { name: domain.domain } );
		expect( within( card ).getByText( 'Primary site address' ) ).toBeVisible();
		expect( within( card ).queryByText( typeLabel ) ).not.toBeInTheDocument();
	} );

	test.each( [
		[ 'domain_registration', 'Registered with us' ],
		[ 'domain_connection', 'Connected domain name' ],
	] )( 'shows the type of a %s that is not primary', async ( id, typeLabel ) => {
		nock.cleanAll();
		mockApis( {
			domains: [ { ...domain, primary_domain: false, subtype: { id, label: 'From the API' } } ],
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const card = await screen.findByRole( 'group', { name: domain.domain } );
		expect( within( card ).getByText( typeLabel ) ).toBeVisible();
		expect( within( card ).queryByText( 'Primary site address' ) ).not.toBeInTheDocument();
	} );

	test( 'keeps the table’s subtitle the same as the cards', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [
				{ ...domain, primary_domain: true },
				{ ...domain, domain: 'second.com', primary_domain: false },
			],
			preferences: { 'hosting-dashboard-dataviews-view-site-domains': SAVED_TABLE_VIEW },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getByText( 'Primary site address' ) ).toBeVisible();
		expect( within( table ).getAllByText( 'Registered with us' ) ).toHaveLength( 1 );
	} );

	test( 'keeps the way back to this list when opening a domain’s settings', async () => {
		const user = userEvent.setup();
		const { router } = render( <SiteDomains />, { user: ownerUser } );
		const navigate = jest.spyOn( router, 'navigate' );

		const card = await screen.findByRole( 'group', { name: domain.domain } );
		await user.click( within( card ).getByRole( 'button', { name: 'Settings' } ) );

		expect( navigate ).toHaveBeenCalledWith(
			expect.objectContaining( {
				params: { domainName: domain.domain },
				search: { back_to: 'site-domains' },
			} )
		);
	} );

	test( 'keeps a saved table view, with Settings and no actions menu or bulk selection', async () => {
		nock.cleanAll();
		mockApis( {
			preferences: { 'hosting-dashboard-dataviews-view-site-domains': SAVED_TABLE_VIEW },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		expect(
			within( table ).queryByRole( 'columnheader', { name: 'SSL' } )
		).not.toBeInTheDocument();
		expect( within( table ).queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		expect( within( table ).getByRole( 'button', { name: 'View settings' } ) ).toBeVisible();
		expect( within( table ).queryByRole( 'button', { name: 'Actions' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'keeps the layout switch for a layout choice', async () => {
		nock.cleanAll();
		mockApis( {
			preferences: { 'hosting-dashboard-dataviews-layout-chosen-site-domains': true },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'group', { name: domain.domain } );
		expect( screen.getByRole( 'button', { name: 'Layout' } ) ).toBeVisible();
	} );

	test( 'does not leave a blank column for a saved view that lists the SSL field', async () => {
		nock.cleanAll();
		mockApis( {
			preferences: { 'hosting-dashboard-dataviews-view-site-domains': SAVED_TABLE_VIEW },
		} );
		const { unmount } = render( <SiteDomains />, { user: ownerUser } );
		const defaultHeaderCount = within( await screen.findByRole( 'table' ) ).getAllByRole(
			'columnheader'
		).length;
		unmount();

		nock.cleanAll();
		mockApis( {
			preferences: {
				'hosting-dashboard-dataviews-view-site-domains': {
					...SAVED_TABLE_VIEW,
					fields: [ 'ssl_status', 'expiry', 'domain_status' ],
				},
			},
		} );
		render( <SiteDomains />, { user: ownerUser } );

		expect(
			within( await screen.findByRole( 'table' ) ).getAllByRole( 'columnheader' )
		).toHaveLength( defaultHeaderCount );
	} );

	test( 'does not open a modal without the deep link', async () => {
		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	describe( 'primary site address modal', () => {
		async function openModal() {
			const user = userEvent.setup();
			nock.cleanAll();
			mockApis( {
				domains: [ primaryCandidateDomain, domain, defaultAddressDomain ],
				siteResponse: siteWithPrimaryDomainFeature,
			} );

			const { recordTracksEvent } = render( <SiteDomains />, { user: ownerUser } );

			await user.click(
				await screen.findByRole( 'button', { name: 'Change primary site address' } )
			);

			const dialog = await screen.findByRole( 'dialog', { name: 'Primary site address' } );
			return { user, dialog, recordTracksEvent };
		}

		test( 'opens from the notice with the current address selected', async () => {
			const { dialog } = await openModal();

			expect(
				within( dialog ).getByRole( 'combobox', { name: 'Primary site address' } )
			).toHaveValue( 'test-site.com' );
			expect( within( dialog ).getByRole( 'button', { name: 'Change address' } ) ).toBeDisabled();
		} );

		test( 'closes without saving when cancelled', async () => {
			const { user, dialog, recordTracksEvent } = await openModal();

			await user.click( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) );

			expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
			expect( recordTracksEvent ).not.toHaveBeenCalledWith(
				'calypso_dashboard_site_domains_primary_domain_selector_submit',
				expect.anything()
			);
		} );

		test( 'closes from the close button', async () => {
			const { user, dialog } = await openModal();

			await user.click( within( dialog ).getByRole( 'button', { name: 'Close' } ) );

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
		} );

		test( 'changes the address, disabling the select while saving', async () => {
			const { user, dialog, recordTracksEvent } = await openModal();

			let finishSaving = () => {};
			const saving = new Promise< void >( ( resolve ) => {
				finishSaving = resolve;
			} );
			const saveRequest = nock( 'https://public-api.wordpress.com' )
				.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'candidate.com' } )
				.reply( async () => {
					await saving;
					return [ 200, {} ];
				} );

			const select = within( dialog ).getByRole( 'combobox', { name: 'Primary site address' } );
			await user.selectOptions( select, 'candidate.com' );
			await user.click( within( dialog ).getByRole( 'button', { name: 'Change address' } ) );

			await waitFor( () => expect( select ).toBeDisabled() );
			expect( recordTracksEvent ).toHaveBeenCalledWith(
				'calypso_dashboard_site_domains_primary_domain_selector_submit',
				{ site: site.slug, domain: 'candidate.com', www: false }
			);

			finishSaving();

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
			expect( saveRequest.isDone() ).toBe( true );
		} );
	} );

	test( 'shows a newly registered domain as activating until its certificate is issued', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [ { ...domain, primary_domain: false }, defaultAddressDomain ],
			ssl: { domain: domain.domain, certificate_provisioned: false, is_newly_registered: true },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByText( 'Preparing your new domain name' ) ).toBeVisible();
		expect( screen.getByText( 'Activating' ) ).toBeVisible();
		expect( screen.getByRole( 'img', { name: 'Can take up to 15 minutes' } ) ).toBeVisible();
	} );

	test( 'shows the activation time when hovering the activating status', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [ { ...domain, primary_domain: false }, defaultAddressDomain ],
			ssl: { domain: domain.domain, certificate_provisioned: false, is_newly_registered: true },
		} );
		const user = userEvent.setup();

		render( <SiteDomains />, { user: ownerUser } );

		await user.hover( await screen.findByText( 'Activating' ) );

		expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent( 'Can take up to 15 minutes' );
	} );

	test( 'shows a new domain as activating while it is set as the primary address', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [
				{ ...domain, primary_domain: false, set_primary_domain_pending: true },
				defaultAddressDomain,
			],
			ssl: { domain: domain.domain, certificate_provisioned: false, is_newly_registered: false },
		} );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.2/domain-details/${ domain.domain }/` )
			.reply( 200, { ...domain, primary_domain: false, set_primary_domain_pending: true } )
			.persist();

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByText( 'Preparing your new domain name' ) ).toBeVisible();
		expect( screen.getByText( 'Activating' ) ).toBeVisible();
		expect( screen.getByRole( 'img', { name: 'Can take up to 15 minutes' } ) ).toBeVisible();
	} );

	test( 'shows a working domain as active while the backend still reports it as pending primary', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [
				{ ...domain, primary_domain: false, set_primary_domain_pending: true },
				defaultAddressDomain,
			],
			ssl: { domain: domain.domain, certificate_provisioned: true, is_newly_registered: true },
		} );
		nock( 'https://public-api.wordpress.com' )
			.get( `/rest/v1.2/domain-details/${ domain.domain }/` )
			.reply( 200, { ...domain, primary_domain: false, set_primary_domain_pending: true } )
			.persist();

		const { queryClient } = render( <SiteDomains />, { user: ownerUser } );

		await waitForSslDetails( queryClient, domain.domain );
		const card = await screen.findByRole( 'group', { name: domain.domain } );
		expect( within( card ).getByText( 'Active' ) ).toBeVisible();
		expect( screen.queryByText( 'Activating' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Preparing your new domain name' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Setting up your custom domain' ) ).not.toBeInTheDocument();
	} );

	test( 'shows a new domain as active once its certificate is issued', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [
				{
					...domain,
					domain_status: { id: 'active', label: 'Activating', type: 'success' },
				},
				defaultAddressDomain,
			],
			ssl: { domain: domain.domain, certificate_provisioned: true, is_newly_registered: false },
		} );

		const { queryClient } = render( <SiteDomains />, { user: ownerUser } );

		await waitForSslDetails( queryClient, domain.domain );
		const card = await screen.findByRole( 'group', { name: domain.domain } );
		expect( within( card ).getByText( 'Active' ) ).toBeVisible();
		expect( screen.queryByText( 'Activating' ) ).not.toBeInTheDocument();
	} );

	test( 'shows a registered domain with an issued certificate as active', async () => {
		nock.cleanAll();
		mockApis( {
			ssl: { domain: domain.domain, certificate_provisioned: true, is_newly_registered: true },
		} );

		const { queryClient } = render( <SiteDomains />, { user: ownerUser } );

		await waitForSslDetails( queryClient, domain.domain );
		const card = await screen.findByRole( 'group', { name: domain.domain } );
		expect( within( card ).getByText( 'Active' ) ).toBeVisible();
		expect( screen.queryByText( 'Activating' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Preparing your new domain name' ) ).not.toBeInTheDocument();
	} );

	describe( 'www address in the primary site address modal', () => {
		const atomicSite = { ...siteWithPrimaryDomainFeature, is_wpcom_atomic: true } as Site;

		async function openModal( domains: unknown[], siteResponse: Site = atomicSite ) {
			nock.cleanAll();
			mockApis( { domains, siteResponse } );
			const user = userEvent.setup();
			const { recordTracksEvent, queryClient } = render( <SiteDomains />, { user: ownerUser } );
			await user.click(
				await screen.findByRole( 'button', { name: 'Change primary site address' } )
			);
			const dialog = await screen.findByRole( 'dialog', { name: 'Primary site address' } );
			const select = within( dialog ).getByRole( 'combobox', { name: 'Primary site address' } );
			const submit = async ( value: string ) => {
				await user.selectOptions( select, value );
				await user.click( within( dialog ).getByRole( 'button', { name: 'Change address' } ) );
			};
			return { dialog, select, submit, user, recordTracksEvent, queryClient };
		}

		function optionValues( select: HTMLElement ) {
			return within( select )
				.getAllByRole( 'option' )
				.map( ( option ) => ( option as HTMLOptionElement ).value );
		}

		test( 'offers www right after each custom domain on an Atomic site', async () => {
			const { select } = await openModal( [ primaryCandidateDomain, domain ] );

			expect( optionValues( select ) ).toEqual( [
				'test-site.com',
				'www.test-site.com',
				'candidate.com',
				'www.candidate.com',
			] );
			expect( select ).toHaveValue( 'test-site.com' );
		} );

		test( 'does not offer www on a Simple site', async () => {
			const { select } = await openModal(
				[ primaryCandidateDomain, domain ],
				siteWithPrimaryDomainFeature
			);

			expect( optionValues( select ) ).toEqual( [ 'test-site.com', 'candidate.com' ] );
		} );

		test( 'does not offer www for the default address', async () => {
			const { select } = await openModal( [
				primaryCandidateDomain,
				{ ...defaultAddressDomain, primary_domain: true },
			] );

			expect( optionValues( select ) ).toEqual( [
				'test-site.wordpress.com',
				'candidate.com',
				'www.candidate.com',
			] );
		} );

		test( 'does not offer www for a subdomain', async () => {
			const { select } = await openModal( [
				primaryCandidateDomain,
				{ ...domain, domain: 'blog.test-site.com' },
			] );

			expect( optionValues( select ) ).toEqual( [
				'blog.test-site.com',
				'candidate.com',
				'www.candidate.com',
			] );
		} );

		test( 'shows www as the current address when www is on', async () => {
			const { dialog, select } = await openModal( [
				primaryCandidateDomain,
				{ ...domain, primary_is_www: true },
			] );

			expect( select ).toHaveValue( 'www.test-site.com' );
			expect( dialog ).toHaveTextContent(
				'The current primary site address for this site is www.test-site.com.'
			);
			expect( within( dialog ).getByRole( 'button', { name: 'Change address' } ) ).toBeDisabled();
		} );

		test.each( [
			{ primary_is_www: false, value: 'www.test-site.com', enabled: true },
			{ primary_is_www: true, value: 'test-site.com', enabled: false },
		] )(
			'sends enabled: $enabled when $value is submitted',
			async ( { primary_is_www, value, enabled } ) => {
				const { submit, recordTracksEvent } = await openModal( [
					primaryCandidateDomain,
					{ ...domain, primary_is_www },
				] );
				const wwwRequest = nock( 'https://public-api.wordpress.com' )
					.post( '/wpcom/v2/domains/www-primary/test-site.com', { enabled } )
					.reply( 200, { success: true } );

				await submit( value );

				await waitFor( () => expect( wwwRequest.isDone() ).toBe( true ) );
				await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
				expect( recordTracksEvent ).toHaveBeenCalledWith(
					'calypso_dashboard_site_domains_primary_domain_selector_submit',
					{ site: site.slug, domain: 'test-site.com', www: enabled }
				);
			}
		);

		test( 'still sets another domain as primary', async () => {
			const { submit } = await openModal( [ primaryCandidateDomain, domain ] );
			const primaryRequest = nock( 'https://public-api.wordpress.com' )
				.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'candidate.com' } )
				.reply( 200, {} );

			await submit( 'candidate.com' );

			await waitFor( () => expect( primaryRequest.isDone() ).toBe( true ) );
		} );

		test( 'sets another domain as primary, then turns www on, for its www address', async () => {
			const { submit } = await openModal( [ primaryCandidateDomain, domain ] );
			const requests: string[] = [];
			nock( 'https://public-api.wordpress.com' )
				.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'candidate.com' } )
				.reply( 200, () => {
					requests.push( 'primary' );
					return {};
				} )
				.post( '/wpcom/v2/domains/www-primary/candidate.com', { enabled: true } )
				.reply( 200, () => {
					requests.push( 'www' );
					return { success: true };
				} );

			await submit( 'www.candidate.com' );

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
			expect( requests ).toEqual( [ 'primary', 'www' ] );
		} );

		test( 'explains that the primary changed when turning www on fails, and retries only www', async () => {
			const { dialog, submit, user, queryClient } = await openModal( [
				primaryCandidateDomain,
				domain,
			] );
			const api = nock( 'https://public-api.wordpress.com' );
			api
				.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'candidate.com' } )
				.reply( 200, {} )
				.post( '/wpcom/v2/domains/www-primary/candidate.com', { enabled: true } )
				.reply( 400, { code: 'www_dns_record_missing', message: 'Add a CNAME record for www.' } );

			await submit( 'www.candidate.com' );

			await waitFor( () =>
				expect( dialog ).toHaveTextContent(
					'candidate.com is now the primary site address, but it could not be changed to www.candidate.com.'
				)
			);
			expect( dialog ).toHaveTextContent( 'Add a CNAME record for www.' );

			// The mutations refresh the app's own query client, so the test refreshes its client here.
			api
				.get( '/rest/v1.2/all-domains' )
				.query( true )
				.reply( 200, {
					domains: [
						{ ...primaryCandidateDomain, primary_domain: true },
						{ ...domain, primary_domain: false, can_set_as_primary: true },
					],
				} );
			await queryClient.invalidateQueries( domainsQuery() );
			await waitFor( () =>
				expect( dialog ).toHaveTextContent(
					'The current primary site address for this site is candidate.com.'
				)
			);

			const retryPrimaryRequest = nock( 'https://public-api.wordpress.com' )
				.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary` )
				.reply( 200, {} );
			const retryWwwRequest = nock( 'https://public-api.wordpress.com' )
				.post( '/wpcom/v2/domains/www-primary/candidate.com', { enabled: true } )
				.reply( 200, { enabled: true, primary_domain: 'www.candidate.com' } );

			await user.click( within( dialog ).getByRole( 'button', { name: 'Change address' } ) );

			await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
			expect( retryWwwRequest.isDone() ).toBe( true );
			expect( retryPrimaryRequest.isDone() ).toBe( false );
		} );

		test( 'offers www from "Change primary" on the primary domain row', async () => {
			nock.cleanAll();
			mockApis( { domains: [ primaryCandidateDomain, domain ], siteResponse: atomicSite } );
			const user = userEvent.setup();
			render( <SiteDomains />, { user: ownerUser } );

			const primaryCard = await screen.findByRole( 'group', { name: domain.domain } );
			await user.click(
				await within( primaryCard ).findByRole( 'button', { name: 'Change primary' } )
			);

			const dialog = await screen.findByRole( 'dialog', { name: 'Primary site address' } );
			expect(
				optionValues( within( dialog ).getByRole( 'combobox', { name: 'Primary site address' } ) )
			).toEqual( [ 'test-site.com', 'www.test-site.com', 'candidate.com', 'www.candidate.com' ] );
		} );
	} );

	test( 'shows an expired domain notice instead of the primary site address notice', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [ expiredDomain, primaryCandidateDomain, domain, defaultAddressDomain ],
			siteResponse: siteWithPrimaryDomainFeature,
		} );

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByText( 'Expired domain' ) ).toBeVisible();
		expect( screen.getByText( /will be released if it is not renewed/ ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Change primary site address' } )
		).not.toBeInTheDocument();

		expect( screen.getByText( /^Expired on / ) ).toBeVisible();

		const primaryCard = screen.getByRole( 'group', { name: domain.domain } );
		expect( within( primaryCard ).getByRole( 'button', { name: 'Change primary' } ) ).toBeVisible();
	} );

	test( 'opens the primary site address modal from "Change primary" on the primary domain row', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( {
			domains: [ expiredDomain, primaryCandidateDomain, domain, defaultAddressDomain ],
			siteResponse: siteWithPrimaryDomainFeature,
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const primaryCard = await screen.findByRole( 'group', { name: domain.domain } );
		await user.click(
			await within( primaryCard ).findByRole( 'button', { name: 'Change primary' } )
		);

		const dialog = await screen.findByRole( 'dialog', { name: 'Primary site address' } );
		expect(
			within( dialog ).getByRole( 'combobox', { name: 'Primary site address' } )
		).toHaveValue( 'test-site.com' );
	} );

	test( 'dismisses the expired domain notice', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( { domains: [ expiredDomain, domain, defaultAddressDomain ] } );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByText( 'Expired domain' );
		await user.click( screen.getByRole( 'button', { name: 'Dismiss' } ) );

		expect( screen.queryByText( 'Expired domain' ) ).not.toBeInTheDocument();
	} );
} );
