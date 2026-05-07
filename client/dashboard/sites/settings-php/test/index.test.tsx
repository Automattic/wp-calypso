/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PHPVersionSettings from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
	is_wpcom_atomic: true,
	plan: {
		product_slug: 'business-bundle',
		product_name_short: 'Business',
		is_free: false,
		features: {
			active: [ 'atomic', 'sftp' ],
		},
	},
} as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockPHPVersion( version: string ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/hosting/php-version` )
		.query( true )
		.reply( 200, version );
}

function mockPHPVersionSaved( expectedVersion: string ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( `/wpcom/v2/sites/${ site.ID }/hosting/php-version`, ( body ) => {
			expect( body ).toEqual( { version: expectedVersion } );
			return true;
		} )
		.reply( 200 );
}

describe( '<PHPVersionSettings>', () => {
	test( 'renders and saves the form for a site that has the hosting feature', async () => {
		const user = userEvent.setup();

		mockSite( site );
		mockPHPVersion( '8.2' );

		render( <PHPVersionSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'PHP' } );

		const versionSelect = await screen.findByRole( 'combobox', { name: 'PHP version' } );
		expect( versionSelect ).toHaveDisplayValue( '8.2' );

		await user.selectOptions( versionSelect, '8.3' );
		const scope = mockPHPVersionSaved( '8.3' );

		const saveButton = screen.getByRole( 'button', { name: 'Save' } );
		await user.click( saveButton );

		await waitFor( () => {
			expect( scope.isDone() ).toBe( true );
		} );
	} );

	test( 'renders upsell when the site does not have the plan feature', async () => {
		mockSite( {
			...site,
			plan: {
				product_slug: 'personal-bundle',
				product_name_short: 'Personal',
				is_free: false,
				features: { active: [] },
			},
		} as unknown as Site );

		render( <PHPVersionSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'PHP' } );

		expect(
			screen.getByText( 'Sites on the Personal plan run on our recommended PHP version.' )
		).toBeVisible();
		expect( screen.getByRole( 'button', { name: 'Upgrade plan' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );

	test( 'renders activation callout when the site has the plan feature but is not Atomic', async () => {
		mockSite( { ...site, is_wpcom_atomic: false } as Site );

		render( <PHPVersionSettings siteSlug={ site.slug } /> );
		await screen.findByRole( 'heading', { name: 'PHP' } );

		expect( screen.getByRole( 'button', { name: 'Activate' } ) ).toBeVisible();
		expect( screen.queryByRole( 'button', { name: 'Save' } ) ).not.toBeInTheDocument();
	} );
} );
