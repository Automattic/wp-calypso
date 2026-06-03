/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import Snackbars from '../../snackbars';
import { InterimOmnibar } from '../interim-omnibar';
import type { Site, User } from '@automattic/api-core';

jest.mock( 'calypso/lib/explat', () => ( {
	useExperiment: () => [ false, { variationName: 'ungated_site_launch' } ],
} ) );

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
	const originalLocation = window.location;
	const originalScrollTo = window.scrollTo;
	const assignMock = jest.fn();

	beforeEach( () => {
		delete ( window as unknown as { location?: Location } ).location;
		( window as unknown as { location: Partial< Location > } ).location = {
			...originalLocation,
			assign: assignMock,
		};
		window.history.pushState( {}, '', '/me' );
		window.scrollTo = jest.fn();

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [ { blog_id: 1, domain: 'test-site.wordpress.com' } ] } );

		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/1/launch' )
			.reply( 200, { ID: 1, launch_status: 'launched' } );
	} );

	afterEach( () => {
		assignMock.mockReset();
		( window as unknown as { location: Location } ).location = originalLocation;
		window.scrollTo = originalScrollTo;
		nock.cleanAll();
	} );

	test( 'returns to the site overview with the celebration flag', async () => {
		const testUser = userEvent.setup();

		render( <InterimOmnibar user={ user } site={ site } currentRoute="/me" /> );

		const launchButton = await screen.findByRole( 'button', { name: /launch site/i } );

		await waitFor( () => expect( launchButton ).toBeEnabled() );
		await testUser.click( launchButton );

		await waitFor( () => {
			expect( assignMock ).toHaveBeenCalledWith(
				'/sites/test-site.wordpress.com?celebrateLaunch=true'
			);
		} );
	} );

	test( 'surfaces launch failures through dashboard snackbars', async () => {
		nock.cleanAll();
		const testUser = userEvent.setup();

		nock( 'https://public-api.wordpress.com' )
			.get( '/rest/v1.2/all-domains' )
			.query( true )
			.reply( 200, { domains: [ { blog_id: 1, domain: 'test-site.wordpress.com' } ] } );

		const launchScope = nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/1/launch' )
			.reply( 500, { message: 'Launch failed.' } );

		render(
			<>
				<Snackbars />
				<InterimOmnibar user={ user } site={ site } currentRoute="/me" />
			</>
		);

		const launchButton = await screen.findByRole( 'button', { name: /launch site/i } );

		await waitFor( () => expect( launchButton ).toBeEnabled() );
		await testUser.click( launchButton );

		await waitFor( () => expect( launchScope.isDone() ).toBe( true ) );
		expect( await screen.findAllByText( 'Failed to launch site.' ) ).not.toHaveLength( 0 );
	} );
} );
