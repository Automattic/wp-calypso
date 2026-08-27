/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
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

const nonPrimaryDomain = {
	...domain,
	domain: 'second-domain.com',
	primary_domain: false,
	can_set_as_primary: true,
};

// A site whose primary address is still its included one, so WordPress.com may
// still set a registered domain as primary on its own.
const siteAddressIsPrimary = [
	nonPrimaryDomain,
	{ ...defaultAddressDomain, primary_domain: true },
];

function mockDomainDetails( domainName: string, overrides = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.2/domain-details/${ domainName }` )
		.query( true )
		.reply( 200, {
			...nonPrimaryDomain,
			domain: domainName,
			points_to_wpcom: false,
			ssl_status: 'newly_registered',
			registration_date: new Date().toISOString(),
			...overrides,
		} );
}

function mockApis( domains = [ domain, defaultAddressDomain ] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );

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
		.reply( 200, { calypso_preferences: {} } );
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

	test( 'does not announce a new primary address when the site already has one', async () => {
		nock.cleanAll();
		mockApis( [ domain, nonPrimaryDomain, defaultAddressDomain ] );
		mockDomainDetails( nonPrimaryDomain.domain );

		render( <SiteDomains />, { user: ownerUser } );

		// The site gets the primary address picker, not the "setting one up" notice.
		expect(
			await screen.findByRole( 'link', { name: 'Upgrade to an annual paid plan' } )
		).toBeVisible();
		expect( screen.queryByText( 'Setting up your custom domain' ) ).not.toBeInTheDocument();
	} );

	test( 'does not announce a primary address the job has given up on', async () => {
		nock.cleanAll();
		mockApis( siteAddressIsPrimary );
		mockDomainDetails( nonPrimaryDomain.domain, {
			registration_date: '2023-07-10T00:00:00+00:00',
		} );

		render( <SiteDomains />, { user: ownerUser } );

		expect(
			await screen.findByRole( 'link', { name: 'Upgrade to an annual paid plan' } )
		).toBeVisible();
		expect( screen.queryByText( 'Setting up your custom domain' ) ).not.toBeInTheDocument();
	} );

	test( 'announces a primary address that is still being set up', async () => {
		nock.cleanAll();
		mockApis( siteAddressIsPrimary );
		mockDomainDetails( nonPrimaryDomain.domain );

		render( <SiteDomains />, { user: ownerUser } );

		expect( await screen.findByText( 'Setting up your custom domain' ) ).toBeVisible();
	} );

	test( 'does not open a modal without the deep link', async () => {
		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByRole( 'heading', { name: 'Domains' } );

		expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument();
	} );
} );
