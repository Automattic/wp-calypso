/**
 * @vitest-environment jsdom
 */

import { disable, enable } from '@automattic/calypso-config';
import { QueryClient } from '@tanstack/react-query';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import WordPressSettings from '../index';
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

const premiumSite = {
	...site,
	is_wpcom_staging_site: false,
	plan: {
		product_slug: 'value_bundle',
		product_name_short: 'Premium',
		is_free: false,
		features: { active: [ 'atomic', 'backups' ] },
	},
} as unknown as Site;

const OPT_OUT_LABEL = 'Keep my site out of early access to new WordPress versions';

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

function mockApi(
	versionTag: string = 'latest',
	mockedSite: Site = site,
	prerelease: { status: number; body?: nock.Body } = {
		status: 200,
		body: { version: '7.0', auto_enrolled: false, opted_out: false, auto_enrollable: true },
	},
	pendingVersion: string | null = null
) {
	mockSite( mockedSite );

	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version` )
		.query( true )
		.reply( 200, JSON.stringify( versionTag ), { 'Content-Type': 'application/json' } );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/prerelease` )
		.query( true )
		.reply( prerelease.status, prerelease.body );

	nock( 'https://public-api.wordpress.com' )
		.persist()
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/pending` )
		.query( true )
		.reply( 200, JSON.stringify( pendingVersion ), { 'Content-Type': 'application/json' } );

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

	test( 'renders and saves the form for an Atomic site on a Personal or Premium plan', async () => {
		const user = userEvent.setup();

		mockApi( 'latest', premiumSite );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		const versionSelect = await screen.findByRole( 'combobox', { name: 'WordPress version' } );
		await user.selectOptions( versionSelect, 'Beta (7.0-RC2)' );
		const scope = mockWordPressVersionSaved( 'beta' );

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'renders the beta notice without the backup restore link on a Personal or Premium plan', async () => {
		mockApi( 'beta', premiumSite );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Your site is running WordPress 7.0-RC2' ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'WordPress version' } ) ).toBeVisible();
		expect( screen.queryByRole( 'link', { name: 'restore your backup' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders the early access notice for a site auto-enrolled in the beta', async () => {
		mockApi( 'beta', premiumSite, {
			status: 200,
			body: { version: '7.0', auto_enrolled: true, opted_out: false, auto_enrollable: true },
		} );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Early access to WordPress 7.0' ) ).toBeVisible();
		expect( screen.getByText( /We moved your site to WordPress 7\.0-RC2/ ) ).toBeVisible();
		expect( screen.getByRole( 'combobox', { name: 'WordPress version' } ) ).toHaveDisplayValue(
			'Beta (7.0-RC2)'
		);
		expect(
			screen.queryByText( 'Your site is running WordPress 7.0-RC2' )
		).not.toBeInTheDocument();
		expect( screen.queryByRole( 'link', { name: 'restore your backup' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders the generic beta notice when the early access status fails to load', async () => {
		mockApi( 'beta', premiumSite, { status: 500 } );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Your site is running WordPress 7.0-RC2' ) ).toBeVisible();
		expect( screen.queryByText( 'Early access to WordPress 7.0' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'checkbox', { name: OPT_OUT_LABEL } ) ).not.toBeInTheDocument();
	} );

	test( 'hides the early access opt-out when the status leaves it out', async () => {
		mockApi( 'beta', premiumSite, {
			status: 200,
			body: { version: '7.0', auto_enrolled: true },
		} );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Early access to WordPress 7.0' ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox', { name: OPT_OUT_LABEL } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Save' } ) ).toBeDisabled();
	} );

	test( 'hides the early access opt-out on a site enrollment never picks', async () => {
		mockApi( 'latest', premiumSite, {
			status: 200,
			body: { version: '7.0', auto_enrolled: false, opted_out: false, auto_enrollable: false },
		} );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByRole( 'combobox', { name: 'WordPress version' } ) ).toBeVisible();
		expect( screen.queryByRole( 'checkbox', { name: OPT_OUT_LABEL } ) ).not.toBeInTheDocument();
	} );

	test( 'tells a site without self-serve backups that it is getting ready to switch to the beta', async () => {
		mockApi( 'latest', premiumSite, undefined, 'beta' );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Switching to WordPress 7.0-RC2' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Getting your site ready. Once it’s switched, we’ll check that your site still loads and move it back to the stable release if it doesn’t.'
			)
		).toBeVisible();
	} );

	test( 'tells a site with self-serve backups that it is backing up to switch to the beta', async () => {
		mockApi( 'latest', { ...site, is_wpcom_staging_site: false } as Site, undefined, 'beta' );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Switching to WordPress 7.0-RC2' ) ).toBeVisible();
		expect(
			screen.getByText(
				'Backing up your site. Once it’s switched, we’ll check that your site still loads and move it back to the stable release if it doesn’t.'
			)
		).toBeVisible();
	} );

	test( 'leaves out the health check when switching back to the stable release', async () => {
		mockApi( 'beta', premiumSite, undefined, 'latest' );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Switching to WordPress 6.8.1' ) ).toBeVisible();
		expect( screen.getByText( 'Getting your site ready.' ) ).toBeVisible();
	} );

	test( 'checks the early access opt-out for a site that opted out', async () => {
		mockApi( 'latest', premiumSite, {
			status: 200,
			body: { version: '7.0', auto_enrolled: false, opted_out: true, auto_enrollable: true },
		} );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByRole( 'checkbox', { name: OPT_OUT_LABEL } ) ).toBeChecked();
	} );

	test( 'saves only the early access opt-out when only the checkbox changes', async () => {
		const user = userEvent.setup();

		mockApi( 'beta', premiumSite, {
			status: 200,
			body: { version: '7.0', auto_enrolled: true, opted_out: false, auto_enrollable: true },
		} );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		const checkbox = await screen.findByRole( 'checkbox', { name: OPT_OUT_LABEL } );
		expect( checkbox ).not.toBeChecked();
		await user.click( checkbox );

		const versionScope = mockWordPressVersionSaved( 'latest' );
		const optOutScope = nock( 'https://public-api.wordpress.com' )
			.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version/prerelease`, ( body ) => {
				expect( body ).toEqual( { opted_out: true } );
				return true;
			} )
			.reply( 200, {
				version: '7.0',
				auto_enrolled: true,
				opted_out: true,
				auto_enrollable: true,
			} );

		await user.click( screen.getByRole( 'button', { name: 'Save' } ) );

		await waitFor( () => {
			expect( optOutScope.isDone() ).toBe( true );
		} );
		expect( screen.getByRole( 'checkbox', { name: OPT_OUT_LABEL } ) ).toBeChecked();
		expect( screen.getByRole( 'combobox', { name: 'WordPress version' } ) ).toHaveDisplayValue(
			'Beta (7.0-RC2)'
		);
		expect( versionScope.isDone() ).toBe( false );
		nock.cleanAll();
	} );

	test( 'renders the beta notice with the backup restore link on a Business+ plan', async () => {
		mockApi( 'beta', { ...site, is_wpcom_staging_site: false } as Site );
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		mockTrackVersions();

		render( <WordPressSettings siteSlug={ site.slug } />, { queryClient } );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( await screen.findByText( 'Your site is running WordPress 7.0-RC2' ) ).toBeVisible();
		expect( screen.getByRole( 'link', { name: 'restore your backup' } ) ).toBeVisible();
	} );

	test( 'renders activation callout when a Simple site has a paid plan', async () => {
		mockSite( {
			...premiumSite,
			is_wpcom_atomic: false,
		} as Site );

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( screen.getByRole( 'button', { name: 'Activate' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders upsell when the site is on a free plan', async () => {
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
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
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
			expect( await screen.findByRole( 'link', { name: /Learn more/ } ) ).toBeVisible();
		} );
	} );
} );
