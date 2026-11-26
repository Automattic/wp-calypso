/**
 * @vitest-environment jsdom
 */

import { siteWordPressPrereleaseQuery, siteWordPressVersionQuery } from '@automattic/api-queries';
import { disable, enable } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import WordPressSettings from '..';
import { render } from '../../../../../../../test-utils';
import type { Site } from '@automattic/api-core';

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

const businessSite = { ...site, is_wpcom_staging_site: false } as Site;

const premiumSite = {
	...businessSite,
	plan: { features: { active: [ 'atomic', 'backups' ] } },
} as unknown as Site;

const EARLY_ACCESS_LABEL = 'Allow automatic early access to new WordPress versions';

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockApi( {
	mockedSite = site,
	version = 'latest',
	pendingVersion = null,
	prerelease = {},
	prereleaseStatus = 200,
}: {
	mockedSite?: Site;
	version?: string;
	pendingVersion?: string | null;
	prerelease?: nock.Body;
	prereleaseStatus?: number;
} = {} ) {
	mockSite( mockedSite );

	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version` )
		.query( true )
		.reply( 200, JSON.stringify( version ), { 'Content-Type': 'application/json' } );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/prerelease` )
		.query( true )
		.reply( prereleaseStatus, prerelease );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/pending` )
		.query( true )
		.reply( 200, JSON.stringify( pendingVersion ), { 'Content-Type': 'application/json' } );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/rest/v1.1/jetpack-blogs/${ site.ID }/rest-api/` )
		.query( ( query ) => query.path === '/wpcomsh/v1/wordpress-versions' )
		.reply( 200, { data: { latest: '6.8.1', beta: '7.0-RC2' } } );
}

function mockWordPressVersionSaved( expectedVersion: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version`, ( body ) => {
			expect( body ).toMatchObject( { version: expectedVersion } );
			return true;
		} )
		.reply( 200 );
}

// The route loader settles the version and the early access status before the screen renders.
async function renderSettings() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	await Promise.all( [
		queryClient.ensureQueryData( siteWordPressVersionQuery( site.ID ) ),
		queryClient.prefetchQuery( siteWordPressPrereleaseQuery( site.ID ) ),
	] );

	render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
	await screen.findByRole( 'heading', { name: 'WordPress' } );
}

describe( '<WordPressSettings>', () => {
	beforeAll( () => {
		enable( 'dashboard/wp-beta-program' );
	} );

	afterAll( () => {
		disable( 'dashboard/wp-beta-program' );
	} );

	describe( 'form', () => {
		test( 'renders and saves the form for a Business+ site', async () => {
			const user = userEvent.setup();

			mockApi();
			await renderSettings();

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

		test( 'shows the early access checkbox unticked for a site that opted out', async () => {
			mockApi( {
				mockedSite: premiumSite,
				prerelease: { opted_out: true, auto_enrollable: true },
			} );

			await renderSettings();

			expect(
				await screen.findByRole( 'checkbox', { name: EARLY_ACCESS_LABEL } )
			).not.toBeChecked();
		} );

		test( 'saves only the early access setting when the owner unticks its checkbox', async () => {
			const user = userEvent.setup();
			mockApi( {
				mockedSite: premiumSite,
				prerelease: { opted_out: false, auto_enrollable: true },
			} );
			const versionScope = nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version` )
				.reply( 200 );
			const optOutScope = nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/prerelease`, ( body ) => {
					expect( body ).toEqual( { opted_out: true } );
					return true;
				} )
				.reply( 200, { opted_out: true, auto_enrollable: true } );

			await renderSettings();

			const checkbox = await screen.findByRole( 'checkbox', { name: EARLY_ACCESS_LABEL } );
			expect( checkbox ).toBeChecked();

			await user.click( checkbox );
			await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

			await waitFor( () => {
				expect( optOutScope.isDone() ).toBe( true );
			} );
			expect( versionScope.isDone() ).toBe( false );
		} );

		test( 'leaves out the early access checkbox on a site enrollment never picks', async () => {
			mockApi( { mockedSite: premiumSite, prerelease: { auto_enrollable: false } } );

			await renderSettings();
			await screen.findByRole( 'combobox', { name: 'WordPress version' } );

			expect(
				screen.queryByRole( 'checkbox', { name: EARLY_ACCESS_LABEL } )
			).not.toBeInTheDocument();
		} );
	} );

	describe( 'notices', () => {
		test( 'offers to restore a backup in the beta notice on a plan with self-serve backups', async () => {
			mockApi( { mockedSite: businessSite, version: 'beta' } );

			await renderSettings();

			expect( await screen.findByText( 'Your site is running WordPress 7.0-RC2' ) ).toBeVisible();
			expect( screen.getByRole( 'link', { name: 'restore your backup' } ) ).toBeVisible();
		} );

		test( 'leaves the backup out of the beta notice on a plan without self-serve backups', async () => {
			mockApi( { mockedSite: premiumSite, version: 'beta' } );

			await renderSettings();

			expect( await screen.findByText( 'Your site is running WordPress 7.0-RC2' ) ).toBeVisible();
			expect(
				screen.queryByRole( 'link', { name: 'restore your backup' } )
			).not.toBeInTheDocument();
		} );

		test( 'shows the beta notice when the early access status fails to load', async () => {
			mockApi( { mockedSite: premiumSite, version: 'beta', prereleaseStatus: 500 } );

			await renderSettings();

			expect( await screen.findByText( 'Your site is running WordPress 7.0-RC2' ) ).toBeVisible();
		} );

		test( 'tells a site auto-enrolled in the beta which build it got early access to', async () => {
			mockApi( {
				mockedSite: premiumSite,
				version: 'beta',
				prerelease: { version: '7.0', auto_enrolled: true },
			} );

			await renderSettings();

			expect( await screen.findByText( 'Early access to WordPress 7.0' ) ).toBeVisible();
			expect( screen.getByText( /We moved your site to WordPress 7\.0-RC2/ ) ).toBeVisible();
			expect(
				screen.queryByRole( 'link', { name: 'restore your backup' } )
			).not.toBeInTheDocument();
		} );

		test.each( [
			{
				description:
					'tells a site without self-serve backups that it is getting ready to switch to the beta',
				mockedSite: premiumSite,
				version: 'latest',
				pendingVersion: 'beta',
				title: 'Switching to WordPress 7.0-RC2',
				message:
					'Getting your site ready. Once it’s switched, we’ll check that your site still loads and move it back to the stable release if it doesn’t.',
			},
			{
				description:
					'tells a site with self-serve backups that it is backing up to switch to the beta',
				mockedSite: businessSite,
				version: 'latest',
				pendingVersion: 'beta',
				title: 'Switching to WordPress 7.0-RC2',
				message:
					'Backing up your site. Once it’s switched, we’ll check that your site still loads and move it back to the stable release if it doesn’t.',
			},
			{
				description: 'leaves out the health check when switching back to the stable release',
				mockedSite: premiumSite,
				version: 'beta',
				pendingVersion: 'latest',
				title: 'Switching to WordPress 6.8.1',
				message: 'Getting your site ready.',
			},
		] )( '$description', async ( { mockedSite, version, pendingVersion, title, message } ) => {
			mockApi( { mockedSite, version, pendingVersion } );

			await renderSettings();

			expect( await screen.findByText( title ) ).toBeVisible();
			expect( screen.getByText( message ) ).toBeVisible();
		} );
	} );

	describe( 'callouts', () => {
		test( 'shows the activation callout to a Simple site on a paid plan', async () => {
			mockSite( { ...premiumSite, is_wpcom_atomic: false } as Site );

			render( <WordPressSettings siteSlug={ site.slug } /> );
			await screen.findByRole( 'heading', { name: 'WordPress' } );

			expect( screen.getByRole( 'button', { name: 'Activate' } ) ).toBeVisible();
		} );

		test( 'shows the upsell to a site on a free plan', async () => {
			mockSite( {
				...site,
				is_wpcom_atomic: false,
				is_wpcom_staging_site: false,
				plan: {
					product_slug: 'free_plan',
					product_name_short: 'Free',
					is_free: true,
					features: { active: [] },
				},
			} as unknown as Site );

			render( <WordPressSettings siteSlug={ site.slug } /> );
			await screen.findByRole( 'heading', { name: 'WordPress' } );

			expect( screen.getByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
			expect( screen.getByText( 'Available on WordPress.com paid plans.' ) ).toBeVisible();
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
			await renderSettings();

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
			expect( await screen.findByRole( 'link', { name: /Learn more/ } ) ).toBeVisible();
		} );
	} );
} );
