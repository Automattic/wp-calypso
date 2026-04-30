/**
 * @jest-environment jsdom
 */

import { disable, enable } from '@automattic/calypso-config';
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

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
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

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		const versionSelect = await screen.findByRole( 'combobox', { name: 'WordPress version' } );
		expect( versionSelect ).toHaveDisplayValue( '6.8.1 (Latest)' );

		await user.selectOptions( versionSelect, '6.8.1 (Beta)' );
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

	test( 'renders opt-out button for an Atomic site auto-enrolled on beta without self-serve backups', async () => {
		const user = userEvent.setup();

		const autoEnrolledSite = {
			...site,
			is_wpcom_staging_site: false,
			plan: {
				product_slug: 'value_bundle',
				product_name_short: 'Premium',
				is_free: false,
				features: { active: [ 'atomic' ] },
			},
		} as unknown as Site;

		mockApi( 'beta', autoEnrolledSite );

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect(
			await screen.findByRole( 'button', { name: 'Opt out of the WordPress beta version' } )
		).toBeVisible();
		expect(
			screen.queryByRole( 'combobox', { name: 'WordPress version' } )
		).not.toBeInTheDocument();

		const scope = mockWordPressVersionSaved( 'latest' );
		await user.click(
			screen.getByRole( 'button', { name: 'Opt out of the WordPress beta version' } )
		);

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );

		// After a successful opt-out, the rolled-back notice replaces the opt-out card.
		expect( await screen.findByText( 'WordPress version updated' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Opt out of the WordPress beta version' } )
		).not.toBeInTheDocument();
	} );

	test( 'renders the upsell (not opt-out) for an Atomic site without self-serve backups when on latest', async () => {
		mockSite( {
			...site,
			is_wpcom_staging_site: false,
			plan: {
				product_slug: 'value_bundle',
				product_name_short: 'Premium',
				is_free: false,
				features: { active: [ 'atomic' ] },
			},
		} as unknown as Site );

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( screen.getByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: /Opt out/ } ) ).not.toBeInTheDocument();
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

			render( <WordPressSettings siteSlug={ site.slug } /> );
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
