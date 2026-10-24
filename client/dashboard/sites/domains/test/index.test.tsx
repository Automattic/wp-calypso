/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { SITE_CONTEXT_VIEW } from '../../../domains/dataviews/views';
import { render } from '../../../test-utils';
import SiteDomains from '../index';
import type { Site, User } from '@automattic/api-core';

let mockSearchParams: { action?: string } = {};

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

const siteWithCustomDomainPlan = {
	...site,
	plan: { is_free: false, features: { active: [ 'set-primary-custom-domain' ] } },
} as unknown as Site;

const newlyRegisteredDomain = {
	...domain,
	domain: 'mynewdomain.blog',
	primary_domain: false,
	can_set_as_primary: true,
	set_primary_domain_pending: false,
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
			.get( `/wpcom/v2/domains/ssl/${ ssl.domain }` )
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
		mockApis();
	} );

	afterEach( () => {
		nock.cleanAll();
	} );

	test( 'shows "Add domain name" button for site owner', async () => {
		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.getByRole( 'button', { name: 'Add domain name' } ) ).toBeVisible();
	} );

	test( 'shows "Add domain name" button for non-owner', async () => {
		render( <SiteDomains />, { user: nonOwnerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.getByRole( 'button', { name: 'Add domain name' } ) ).toBeVisible();
	} );

	test( 'opens the change site address modal when deep linked', async () => {
		mockSearchParams = { action: 'change-site-address' };

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByRole( 'dialog', { name: 'Change site address' } ) ).toBeVisible();
	} );

	test( 'shows "Change site address" action for the default address', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( { domains: [ defaultAddressDomain ] } );

		render( <SiteDomains />, { user: ownerUser } );

		await user.click( await screen.findByLabelText( 'Actions' ) );

		expect( screen.getByText( 'Change site address' ) ).toBeVisible();
	} );

	test( 'hides "Change site address" action when the site is suspended', async () => {
		nock.cleanAll();
		mockApis( { domains: [ { ...defaultAddressDomain, is_suspended_site: true } ] } );

		render( <SiteDomains />, { user: ownerUser } );

		const table = await screen.findByRole( 'table' );
		expect( within( table ).getByText( 'test-site.wordpress.com' ) ).toBeVisible();

		expect( screen.queryByLabelText( 'Actions' ) ).not.toBeInTheDocument();
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

	test( 'offers to make the only custom domain the site address in one click', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( {
			domains: [ { ...defaultAddressDomain, primary_domain: true }, newlyRegisteredDomain ],
			siteResponse: siteWithCustomDomainPlan,
		} );

		const setPrimaryRequest = nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v1.1/sites/${ SITE_ID }/domains/primary`, { domain: 'mynewdomain.blog' } )
			.reply( 200, {} );

		render( <SiteDomains />, { user: ownerUser } );

		expect(
			await screen.findByText( 'mynewdomain.blog isn’t your site address yet' )
		).toBeVisible();
		expect( screen.queryByText( 'Change primary site address' ) ).not.toBeInTheDocument();

		await user.click(
			screen.getByRole( 'button', { name: 'Make mynewdomain.blog my site address' } )
		);

		await waitFor( () => expect( setPrimaryRequest.isDone() ).toBe( true ) );
	} );

	test( 'keeps the dropdown when several domains could become the site address', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [
				{ ...defaultAddressDomain, primary_domain: true },
				newlyRegisteredDomain,
				{ ...newlyRegisteredDomain, domain: 'second.camera' },
			],
			siteResponse: siteWithCustomDomainPlan,
		} );

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByText( 'Change primary site address' ) ).toBeVisible();
		expect( screen.queryByText( /isn’t your site address yet/ ) ).not.toBeInTheDocument();
	} );

	test( 'hides "Make primary site address" action while SSL is still pending', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain ],
			ssl: { domain: primaryCandidateDomain.domain, certificate_provisioned: false },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByText( 'SSL pending' );

		const actionsButtons = await screen.findAllByLabelText( 'Actions' );
		await user.click( actionsButtons[ 0 ] );

		expect( screen.queryByText( 'Make primary site address' ) ).not.toBeInTheDocument();
	} );

	test( 'shows "Make primary site address" as an inline row action once SSL is active', async () => {
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain ],
			ssl: { domain: primaryCandidateDomain.domain, certificate_provisioned: true },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByText( 'SSL active' );

		expect(
			await screen.findByRole( 'button', { name: 'Make primary site address' } )
		).toBeVisible();
	} );
} );
