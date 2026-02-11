/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import WordPressSettings from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 123,
	slug: 'test-site.wordpress.com',
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

function mockWordPressVersion( version: string ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version` )
		.query( true )
		.reply( 200, version );
}

function mockWordPressVersionSaved( expectedVersion: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version`, ( body ) => {
			expect( body ).toEqual( { version: expectedVersion } );
			return true;
		} )
		.reply( 200 );
}

describe( '<WordPressSettings>', () => {
	test( 'renders and saves the form for a staging site', async () => {
		const user = userEvent.setup();

		mockSite( { ...site, is_wpcom_staging_site: true } as Site );
		mockWordPressVersion( 'latest' );

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

	test( 'renders notice for a non-staging site', async () => {
		mockSite( { ...site, is_wpcom_staging_site: false } as Site );

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect(
			screen.getByText( /Every WordPress.com site runs the latest WordPress version/ )
		).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders staging site suggestion for Atomic non-staging sites', async () => {
		mockSite( {
			...site,
			is_wpcom_staging_site: false,
			is_wpcom_atomic: true,
		} as Site );

		render( <WordPressSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'WordPress' } );

		expect( screen.getByText( /Switch to a staging site to test a beta version/ ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );
} );
