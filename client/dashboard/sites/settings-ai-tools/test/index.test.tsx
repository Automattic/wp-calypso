/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { screen } from '@testing-library/react';
import nock from 'nock';
import { render } from '../../../test-utils';
import AIToolsSettings from '../index';
import type { Site } from '@automattic/api-core';

const site = {
	ID: 1,
	slug: 'test-site.wordpress.com',
} as Site;

function mockSite( mockedSite: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ mockedSite.slug }` )
		.query( true )
		.reply( 200, mockedSite );
}

function mockBigSkyPlugin( enabled: boolean, available: boolean ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }/big-sky-plugin` )
		.query( true )
		.reply( 200, {
			blog_id: site.ID,
			enabled,
			available,
			on_free_trial: false,
		} );
}

function mockUserSettings() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, {} );
}

describe( '<AIToolsSettings>', () => {
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	describe( 'Reader Chat card', () => {
		test( 'is hidden when feature flag is disabled', async () => {
			jest.spyOn( config, 'isEnabled' ).mockReturnValue( false );

			mockSite( site );
			mockBigSkyPlugin( false, true );
			mockUserSettings();

			render( <AIToolsSettings siteSlug={ site.slug } /> );

			expect( await screen.findByRole( 'heading', { name: /AI tools/i } ) ).toBeVisible();
			expect( screen.queryByRole( 'heading', { name: /Reader Chat/i } ) ).toBeNull();
		} );
	} );
} );
