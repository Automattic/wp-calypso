/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import SiteDomains from '../index';
import type { Site, User } from '@automattic/api-core';

jest.mock( '../../../app/router/sites', () => {
	const actual = jest.requireActual( '../../../app/router/sites' );
	return {
		...actual,
		siteRoute: {
			useParams: () => ( { siteSlug: 'test-site.wordpress.com' } ),
			fullPath: '/sites/$siteSlug',
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

function mockApis( {
	domains = [ domain ],
	ssl,
}: {
	domains?: unknown[];
	ssl?: { domain: string; certificate_provisioned: boolean };
} = {} ) {
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

	test( 'shows "Make primary site address" action once SSL is active', async () => {
		const user = userEvent.setup();
		nock.cleanAll();
		mockApis( {
			domains: [ primaryCandidateDomain ],
			ssl: { domain: primaryCandidateDomain.domain, certificate_provisioned: true },
		} );

		render( <SiteDomains />, { user: ownerUser } );

		await screen.findByText( 'SSL active' );

		const actionsButtons = await screen.findAllByLabelText( 'Actions' );
		await user.click( actionsButtons[ 0 ] );

		expect( screen.getByText( 'Make primary site address' ) ).toBeInTheDocument();
	} );
} );
