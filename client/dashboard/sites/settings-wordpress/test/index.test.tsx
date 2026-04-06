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
	is_wpcom_atomic: true,
	is_wpcom_staging_site: true,
	plan: {
		product_slug: 'business-bundle',
		product_name_short: 'Business',
		is_free: false,
		features: {
			active: [ 'atomic', 'sftp', 'backups' ],
		},
	},
	options: {
		software_version: '6.8.1',
	},
} as Site;

function mockApi() {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.slug }` )
		.query( true )
		.reply( 200, site );

	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/wp-version` )
		.query( true )
		.reply( 200, 'latest' );

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
} );
