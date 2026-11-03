/**
 * @jest-environment jsdom
 */

import { queryClient as appQueryClient } from '@automattic/api-queries';
import { disable, enable } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import WordPressSettings from '../index';
import type { Site, WordPressPrerelease } from '@automattic/api-core';

const site = {
	ID: 123,
	slug: 'test-site.wordpress.com',
	is_wpcom_atomic: true,
	is_wpcom_staging_site: true,
	plan: {
		product_slug: 'business-bundle',
		product_name_short: 'Business',
		is_free: false,
		features: {
			active: [ 'atomic', 'sftp', 'backups', 'backups-self-serve' ],
		},
	},
	options: {
		software_version: '6.8.1',
	},
} as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockTrackVersions() {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/jetpack-blogs/${ site.ID }/rest-api/` )
		.query( ( query ) => query.path === '/wpcomsh/v1/wordpress-versions' )
		.reply( 200, { data: { latest: '6.8.1', beta: '7.0-RC2' } } );
}

function mockPrerelease( prerelease: Partial< WordPressPrerelease > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/prerelease` )
		.query( true )
		.reply( 200, { version: '7.0', enrolled_this_cycle: false, opted_out: false, ...prerelease } );
}

function mockApi( versionTag: string = 'latest', mockedSite: Site = site ) {
	mockSite( mockedSite );

	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version` )
		.query( true )
		.reply( 200, JSON.stringify( versionTag ), { 'Content-Type': 'application/json' } );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/pending` )
		.query( true )
		.reply( 200, null as unknown as nock.Body );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ site.ID }/rewind/backups` )
		.query( true )
		.reply( 200, [] );
}

function mockWordPressVersionSaved( expectedVersion: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version`, ( body ) => {
			expect( body ).toMatchObject( { version: expectedVersion } );
			return true;
		} )
		.reply( 200 );
}

describe( '<WordPressSettings>', () => {
	beforeAll( () => {
		enable( 'dashboard/wp-beta-program' );
	} );

	afterAll( () => {
		disable( 'dashboard/wp-beta-program' );
	} );

	test( 'renders and saves the form for a Business+ site', async () => {
		const user = userEvent.setup();

		mockApi();
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		const versionSelect = await screen.findByRole( 'combobox', { name: 'WordPress version' } );
		expect( versionSelect ).toHaveDisplayValue( 'Stable (6.8.1)' );

		await user.selectOptions( versionSelect, 'Beta (7.0-RC2)' );
		const scope = mockWordPressVersionSaved( 'beta' );

		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'renders activation callout when a Simple site has the plan feature but is not Atomic', async () => {
		mockSite( {
			...site,
			is_wpcom_atomic: false,
			is_wpcom_staging_site: false,
		} as Site );

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( screen.getByRole( 'button', { name: 'Activate' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders upsell when the site does not have the plan feature', async () => {
		mockSite( {
			...site,
			is_wpcom_atomic: false,
			is_wpcom_staging_site: false,
			plan: {
				product_slug: 'personal-bundle',
				product_name_short: 'Personal',
				is_free: false,
				features: { active: [] },
			},
		} as unknown as Site );

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( screen.getByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );

	describe( 'for a production site', () => {
		const productionSite = { ...site, is_wpcom_staging_site: false } as Site;
		const personalSite = {
			...productionSite,
			plan: {
				product_slug: 'personal-bundle',
				product_name_short: 'Personal',
				is_free: false,
				features: { active: [ 'atomic' ] },
			},
		} as unknown as Site;

		// The page's mutations update the app's query client, so render with it.
		afterEach( () => appQueryClient.clear() );

		test( 'saves the early access checkbox for a Business+ site', async () => {
			const user = userEvent.setup();
			mockApi( 'latest', productionSite );
			mockTrackVersions();
			mockPrerelease();
			const scope = nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/prerelease`, {
					opted_out: true,
				} )
				.reply( 200, { version: '7.0', enrolled_this_cycle: false, opted_out: true } );

			render( <WordPressSettings siteSlug={ site.slug } />, { queryClient: appQueryClient } );

			const checkbox = await screen.findByRole( 'checkbox', {
				name: 'Let my site be picked for early access to new WordPress versions',
			} );
			expect( checkbox ).toBeChecked();
			expect( screen.getByRole( 'combobox', { name: 'WordPress version' } ) ).toBeVisible();

			await user.click( checkbox );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
			await waitFor( () => {
				expect( checkbox ).toBeEnabled();
			} );
			expect( checkbox ).not.toBeChecked();
		} );

		test( 'renders the form for a site without self-serve backups picked for early access', async () => {
			const user = userEvent.setup();
			mockSite( personalSite );
			mockTrackVersions();
			mockPrerelease( { enrolled_this_cycle: true } );
			nock( 'https://public-api.wordpress.com' )
				.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version` )
				.query( true )
				.reply( 200, JSON.stringify( 'beta' ), { 'Content-Type': 'application/json' } );
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/wpcom/v2/sites/${ site.ID }/rewind/backups` )
				.query( true )
				.reply( 200, [] );
			// The switch waits for a backup, so it stays pending once saved.
			let pendingVersion: string | null = null;
			nock( 'https://public-api.wordpress.com' )
				.persist()
				.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/pending` )
				.query( true )
				.reply( () => [
					200,
					JSON.stringify( pendingVersion ),
					{ 'Content-Type': 'application/json' },
				] );

			render( <WordPressSettings siteSlug={ site.slug } />, { queryClient: appQueryClient } );

			expect( await screen.findByText( 'Your site is running WordPress 7.0-RC2' ) ).toBeVisible();
			expect(
				screen.getByRole( 'checkbox', {
					name: 'Let my site be picked for early access to new WordPress versions',
				} )
			).toBeChecked();
			expect( screen.queryByRole( 'button', { name: 'Upgrade plan' } ) ).not.toBeInTheDocument();

			const versionSelect = screen.getByRole( 'combobox', { name: 'WordPress version' } );
			expect( versionSelect ).toHaveDisplayValue( 'Beta (7.0-RC2)' );
			await user.selectOptions( versionSelect, 'Stable (6.8.1)' );

			const scope = nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version`, {
					version: 'latest',
					defer_until_backup_complete: true,
				} )
				.reply( () => {
					pendingVersion = 'latest';
					return [ 200 ];
				} );
			await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

			await waitFor( () => {
				expect( scope.isDone() ).toBe( true );
			} );
			expect( await screen.findByText( 'Switching to WordPress 6.8.1' ) ).toBeVisible();
			expect( await screen.findByText( 'Backing up your site.' ) ).toBeVisible();
		} );

		test( 'renders the upsell for a site without self-serve backups not picked for early access', async () => {
			mockSite( personalSite );
			mockPrerelease();

			render( <WordPressSettings siteSlug={ site.slug } />, { queryClient: appQueryClient } );
			await screen.findByRole( 'heading', { name: 'WordPress' } );

			expect( await screen.findByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
			expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
			expect(
				screen.queryByRole( 'combobox', { name: 'WordPress version' } )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'with beta program disabled', () => {
		beforeAll( () => {
			disable( 'dashboard/wp-beta-program' );
		} );

		afterAll( () => {
			enable( 'dashboard/wp-beta-program' );
		} );

		test( 'renders the form for a staging site', async () => {
			mockApi();
			const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
			mockTrackVersions();

			render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
			await screen.findByRole( 'heading', { name: 'WordPress' } );

			expect( await screen.findByRole( 'combobox', { name: 'WordPress version' } ) ).toBeVisible();
		} );

		test( 'renders the latest-version notice for a non-staging site', async () => {
			mockSite( { ...site, is_wpcom_staging_site: false } as Site );

			render( <WordPressSettings siteSlug={ site.slug } /> );
			await screen.findByRole( 'heading', { name: 'WordPress' } );

			expect(
				screen.getByText( /Every WordPress\.com site runs the latest WordPress version/ )
			).toBeVisible();
			expect(
				screen.queryByRole( 'combobox', { name: 'WordPress version' } )
			).not.toBeInTheDocument();
		} );
	} );
} );
