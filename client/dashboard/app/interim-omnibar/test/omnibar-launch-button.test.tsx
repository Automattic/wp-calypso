/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import { InterimOmnibar } from '../interim-omnibar';
import type { Site, User } from '@automattic/api-core';

jest.mock( 'calypso/lib/analytics/tracks', () => ( {
	recordTracksEvent: jest.fn(),
} ) );

const user = {
	ID: 1,
	username: 'testuser',
	display_name: 'Test User',
	site_count: 1,
	primary_blog: 1,
} as User;

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	launch_status: 'unlaunched',
	is_a4a_dev_site: false,
	is_wpcom_staging_site: false,
	is_wpcom_atomic: false,
	is_deleted: false,
	jetpack: false,
	site_migration: {
		migration_status: undefined,
	},
	capabilities: {
		manage_options: true,
	},
	options: {
		admin_url: 'https://test-site.wordpress.com/wp-admin/',
	},
	plan: {
		product_slug: 'free_plan',
		product_name_short: 'Free',
		is_free: true,
	},
} as Site;

describe( '<InterimOmnibar /> launch button on non-site routes', () => {
	const originalScrollTo = window.scrollTo;

	beforeEach( () => {
		window.history.pushState( {}, '', '/me' );
		window.scrollTo = jest.fn();

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [ { blog_id: 1, domain: 'test-site.wordpress.com' } ] } );

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.1/sites/1/stats/visits' )
			.query( true )
			.reply( 200, { data: [ [ '2025-01-01 00:00:00', 3 ] ] } );
	} );

	afterEach( () => {
		window.scrollTo = originalScrollTo;
		nock.cleanAll();
	} );

	// Site launch gating: the semi-gated flow renders the button as a link
	// to /start/launch-site instead of triggering a mutation directly.
	test( 'links to the semi-gated launch flow', async () => {
		render( <InterimOmnibar user={ user } site={ site } currentRoute="/me" /> );

		const launchLink = await screen.findByRole( 'link', { name: /launch site/i } );

		const href = launchLink.getAttribute( 'href' ) ?? '';
		expect( href ).toContain( '/start/launch-site' );
		expect( href ).toContain( 'siteSlug=test-site.wordpress.com' );
	} );
} );
