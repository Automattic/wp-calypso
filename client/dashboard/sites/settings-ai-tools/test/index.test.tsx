/**
 * @jest-environment jsdom
 */

import config from '@automattic/calypso-config';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

function mockReaderChatSettings( enabled: boolean ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/wpcom/v2/sites/${ site.ID }/reader-chat-settings` )
		.query( true )
		.reply( 200, { enabled } );
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

		test( 'renders toggle reflecting the current stored value', async () => {
			jest
				.spyOn( config, 'isEnabled' )
				.mockImplementation( ( key: string ) => key === 'reader-chat-settings' );

			mockSite( site );
			mockBigSkyPlugin( false, true );
			mockUserSettings();
			mockReaderChatSettings( true );

			render( <AIToolsSettings siteSlug={ site.slug } /> );

			expect( await screen.findByRole( 'heading', { name: /Reader Chat/i } ) ).toBeVisible();

			const toggle = await screen.findByRole( 'checkbox', {
				name: /Enable Reader Chat on your blog/i,
			} );
			await waitFor( () => expect( toggle ).toBeChecked() );
		} );

		test( 'posts the new value when the toggle is flipped', async () => {
			jest
				.spyOn( config, 'isEnabled' )
				.mockImplementation( ( key: string ) => key === 'reader-chat-settings' );

			mockSite( site );
			mockBigSkyPlugin( false, true );
			mockUserSettings();
			mockReaderChatSettings( false );

			const saved = nock( 'https://public-api.wordpress.com' )
				.post( `/wpcom/v2/sites/${ site.ID }/reader-chat-settings`, ( body ) => {
					expect( body ).toEqual( { enabled: true } );
					return true;
				} )
				.reply( 200, { enabled: true } );

			render( <AIToolsSettings siteSlug={ site.slug } /> );

			const toggle = await screen.findByRole( 'checkbox', {
				name: /Enable Reader Chat on your blog/i,
			} );
			await userEvent.click( toggle );

			await waitFor( () => expect( saved.isDone() ).toBe( true ) );
		} );
	} );
} );
