/**
 * @vitest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { mockPreferences, renderRoute } from '../../../test-utils/render-route';
import '../critical-error';
import '../site-building-in-progress';
import '../../../../../sites/migration-overview';
import '..';
import '../layout';
import '../error';
import '../trial-ended';
import type { Site, User } from '@automattic/api-core';

const user = { ID: 1, site_count: 1 } as User;

const site = {
	ID: 1,
	name: 'Test Site',
	slug: 'test-site.wordpress.com',
	URL: 'https://test-site.wordpress.com',
	site_migration: {},
	capabilities: { manage_options: true },
	plan: {
		product_slug: 'free_plan',
		product_name_short: 'Free',
		is_free: true,
		features: { active: [] },
	},
} as unknown as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

describe( '/sites/$siteSlug', () => {
	beforeEach( () => {
		mockPreferences();
	} );

	test( 'renders', async () => {
		mockSite( site );

		await renderRoute( `/sites/${ site.slug }`, { user } );

		expect( await screen.findByRole( 'heading', { name: 'Test Site' } ) ).toBeVisible();
	} );

	test( 'shows the not found page when the user is not a member of the site', async () => {
		mockSite( { ...site, capabilities: undefined } as unknown as Site );

		await renderRoute( `/sites/${ site.slug }`, { user } );

		expect( await screen.findByRole( 'heading', { name: '404 Not Found' } ) ).toBeVisible();
	} );

	test( 'shows a permission error when the user is a member who can’t manage the site', async () => {
		mockSite( { ...site, capabilities: { manage_options: false } } as unknown as Site );

		await renderRoute( `/sites/${ site.slug }`, { user } );

		expect( await screen.findByText( 'Administrators only' ) ).toBeVisible();
	} );

	test( 'redirects to /critical-error when the site’s Jetpack has a critical error', async () => {
		mockSite( {
			...site,
			__inaccessible_jetpack_error: true,
			options: { jetpack_recovery_mode_status: { recovery_mode_email_last_sent: 100 } },
		} as unknown as Site );

		const { router } = await renderRoute( `/sites/${ site.slug }`, { user } );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ site.slug }/critical-error` )
		);
	} );

	test( 'redirects to /trial-ended when the site’s trial has ended', async () => {
		mockSite( { ...site, was_hosting_trial: true } as Site );

		const { router } = await renderRoute( `/sites/${ site.slug }`, { user } );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ site.slug }/trial-ended` )
		);
	} );

	test( 'redirects to /site-building-in-progress while the site is being built for the user', async () => {
		mockSite( { ...site, options: { is_difm_lite_in_progress: true } } as unknown as Site );

		const { router } = await renderRoute( `/sites/${ site.slug }`, { user } );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe(
				`/sites/${ site.slug }/site-building-in-progress`
			)
		);
	} );

	test( 'redirects to /migration-overview while the site is being migrated', async () => {
		mockSite( {
			...site,
			site_migration: { type: 'wordpress', status_v2: 'pending' },
		} as unknown as Site );

		const { router } = await renderRoute( `/sites/${ site.slug }`, { user } );

		await waitFor( () =>
			expect( router.state.location.pathname ).toBe( `/sites/${ site.slug }/migration-overview` )
		);
	} );

	test( 'redirects self-hosted Jetpack sites from other site pages to /sites/$siteSlug', async () => {
		mockSite( { ...site, jetpack_connection: true } as Site );

		const { router } = await renderRoute( `/sites/${ site.slug }/settings`, { user } );

		await waitFor( () => expect( router.state.location.pathname ).toBe( `/sites/${ site.slug }` ) );
	} );

	describe( 'with a static site import session', () => {
		beforeEach( () => {
			mockSite( site );
		} );

		test( 'loads the session before showing the overview', async () => {
			const sessionRequest = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/static-site-import-session/abc123' )
				.query( true )
				.reply( 200, { session_id: 'abc123', state: 'capturing' } );

			await renderRoute( `/sites/${ site.slug }?importSessionId=abc123`, { user } );

			expect( sessionRequest.isDone() ).toBe( true );
		} );

		test( 'renders when the import session can’t be read', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/static-site-import-session/abc123' )
				.query( true )
				.reply( 403, { code: 'static_site_import_session_forbidden', message: 'Not yours.' } );

			await renderRoute( `/sites/${ site.slug }?importSessionId=abc123`, { user } );

			expect( await screen.findByRole( 'heading', { name: 'Test Site' } ) ).toBeVisible();
		} );
	} );

	describe( 'while the site turns Atomic', () => {
		const ownedSite = {
			...site,
			site_owner: user.ID,
			is_wpcom_atomic: true,
			capabilities: { manage_options: false },
		} as unknown as Site;

		function mockLatestTransfer() {
			return nock( 'https://public-api.wordpress.com' )
				.get( `/wpcom/v2/sites/${ site.ID }/atomic/transfers/latest` )
				.query( true );
		}

		test( 'renders for the site owner while the transfer runs', async () => {
			mockSite( ownedSite );
			mockLatestTransfer().reply( 200, { status: 'active' } );

			await renderRoute( `/sites/${ site.slug }`, { user } );

			expect( await screen.findByRole( 'heading', { name: 'Test Site' } ) ).toBeVisible();
		} );

		test( 'renders for the site owner until their capabilities reach the transferred site', async () => {
			mockSite( ownedSite );
			mockLatestTransfer().reply( 200, { status: 'completed' } );

			await renderRoute( `/sites/${ site.slug }`, { user } );

			expect( await screen.findByRole( 'heading', { name: 'Test Site' } ) ).toBeVisible();
		} );

		test( 'shows a permission error to the site owner when the transfer failed', async () => {
			mockSite( ownedSite );
			mockLatestTransfer().reply( 200, { status: 'error' } );

			await renderRoute( `/sites/${ site.slug }`, { user } );

			expect( await screen.findByText( 'Administrators only' ) ).toBeVisible();
		} );

		test( 'shows a permission error to the site owner when the transfer can’t be read', async () => {
			mockSite( ownedSite );
			mockLatestTransfer().reply( 403, { code: 'unauthorized', message: 'Not allowed.' } );

			await renderRoute( `/sites/${ site.slug }`, { user } );

			expect( await screen.findByText( 'Administrators only' ) ).toBeVisible();
		} );

		test( 'shows a permission error to someone else without asking for the transfer', async () => {
			mockSite( ownedSite );
			const transferRequest = mockLatestTransfer().reply( 200, { status: 'active' } );

			await renderRoute( `/sites/${ site.slug }`, { user: { ID: 2 } as User } );

			expect( await screen.findByText( 'Administrators only' ) ).toBeVisible();
			expect( transferRequest.isDone() ).toBe( false );
		} );
	} );
} );
