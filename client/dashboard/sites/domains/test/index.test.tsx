/**
 * @jest-environment jsdom
 */

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { SITE_CONTEXT_VIEW } from '../../../domains/dataviews/views';
import { render } from '../../../test-utils';
import SiteDomains from '../index';
import type { Site, User } from '@automattic/api-core';

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
	ssl?: { domain: string; certificate_provisioned: boolean };
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
					is_newly_registered: false,
					is_expired: false,
				},
			} )
			.persist();
	}
}

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
		expect( await screen.findByRole( 'button', { name: 'Change site address' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Rename address' } ) ).not.toBeInTheDocument();
	} );

	test( 'labels the expiry column "Renews on"', async () => {
		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByRole( 'button', { name: 'Renews on' } ) ).toBeVisible();
	} );

	test( 'opens the change site address modal when deep linked', async () => {
		mockSearchParams = { action: 'change-site-address' };

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByRole( 'dialog', { name: 'Change site address' } ) ).toBeVisible();
	} );

	test( 'shows "Rename address" on the default address row and opens the change site address modal', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( { domains: [ defaultAddressDomain ] } );

		render( <SiteDomains />, { user: ownerUser } );

		await user.click( await screen.findByRole( 'button', { name: 'Rename address' } ) );

		expect( await screen.findByRole( 'dialog', { name: 'Change site address' } ) ).toBeVisible();
	} );

	test( 'hides "Rename address" when the site is suspended', async () => {
		nock.cleanAll();
		mockApis( { domains: [ { ...defaultAddressDomain, is_suspended_site: true } ] } );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getByText( 'test-site.wordpress.com' ) ).toBeVisible();

		expect( screen.queryByRole( 'button', { name: 'Rename address' } ) ).not.toBeInTheDocument();
	} );

	test( 'shows "Settings" as the only row action, without an actions menu or bulk selection', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain ],
			ssl: { domain: primaryCandidateDomain.domain, certificate_provisioned: true },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		await screen.findByText( 'SSL active' );

		expect( within( table ).getByRole( 'button', { name: 'Settings' } ) ).toBeVisible();
		expect( screen.queryByLabelText( 'Actions' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Make primary site address' ) ).not.toBeInTheDocument();
		expect( screen.queryAllByRole( 'checkbox' ) ).toHaveLength( 0 );
	} );

	test( 'lists the free address first and the primary site address second', async () => {
		nock.cleanAll();
		mockApis( { domains: [ primaryCandidateDomain, domain, defaultAddressDomain ] } );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		expect(
			within( table )
				.getAllByText( /^(test-site\.|candidate\.)/ )
				.map( ( element ) => element.textContent )
		).toEqual( [ 'test-site.wordpress.com', 'test-site.com', 'candidate.com' ] );
	} );

	test( 'keeps the free address and the primary site address on top when sorting', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain, domain, defaultAddressDomain ],
			preferences: {
				'hosting-dashboard-dataviews-view-site-domains': {
					...SITE_CONTEXT_VIEW,
					sort: { field: 'is_primary_domain', direction: 'asc' },
				},
			},
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		expect(
			within( table )
				.getAllByText( /^(test-site\.|candidate\.)/ )
				.map( ( element ) => element.textContent )
		).toEqual( [ 'test-site.wordpress.com', 'test-site.com', 'candidate.com' ] );
	} );

	test( 'changes the primary site address from a modal that can be dismissed', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain, domain, defaultAddressDomain ],
			siteResponse: siteWithPrimaryDomainFeature,
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await user.click(
			await screen.findByRole( 'button', { name: 'Change primary site address' } )
		);

		const dialog = await screen.findByRole( 'dialog', { name: 'Primary site address' } );
		expect(
			within( dialog ).getByRole( 'combobox', { name: 'Primary site address' } )
		).toHaveValue( 'test-site.com' );
		expect( within( dialog ).getByRole( 'button', { name: 'Change address' } ) ).toBeDisabled();

		await user.click( within( dialog ).getByRole( 'button', { name: 'Cancel' } ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'closes the primary site address modal from its close button', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain, domain, defaultAddressDomain ],
			siteResponse: siteWithPrimaryDomainFeature,
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await user.click(
			await screen.findByRole( 'button', { name: 'Change primary site address' } )
		);

		const dialog = await screen.findByRole( 'dialog', { name: 'Primary site address' } );
		await user.click( within( dialog ).getByRole( 'button', { name: 'Close' } ) );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );

	test( 'opens the primary site address modal from "Change primary" on the primary domain row', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain, domain, defaultAddressDomain ],
			siteResponse: siteWithPrimaryDomainFeature,
		} );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		const changePrimaryButtons = await within( table ).findAllByRole( 'button', {
			name: 'Change primary',
		} );
		expect( changePrimaryButtons ).toHaveLength( 1 );
		expect( changePrimaryButtons[ 0 ].closest( 'tr' ) ).toHaveTextContent( 'test-site.com' );

		await user.click( changePrimaryButtons[ 0 ] );

		expect( await screen.findByRole( 'dialog', { name: 'Primary site address' } ) ).toBeVisible();
	} );

	test( 'hides "Change primary" when the plan does not allow a custom primary site address', async () => {
		nock.cleanAll();
		mockApis( { domains: [ primaryCandidateDomain, domain, defaultAddressDomain ] } );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'table' );
		expect( screen.queryByRole( 'button', { name: 'Change primary' } ) ).not.toBeInTheDocument();
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

		const table = await screen.findByRole( 'table' );
		expect(
			within( table )
				.getAllByText( /^test-site\./ )
				.map( ( element ) => element.textContent )
		).toEqual( [ 'test-site.wordpress.com', 'test-site.com' ] );
	} );

	test( 'does not open a modal without the deep link', async () => {
		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
