/**
 * @jest-environment jsdom
 */

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PreferencesDefaults from '../index';
import type { Site, User, UserPreferences } from '@automattic/api-core';

// The suggestions list scrolls the highlighted option into view, which JSDOM lacks.
Element.prototype.scrollIntoView = jest.fn();

const PRIMARY_SITE_ID = 123;

const primarySite = {
	ID: PRIMARY_SITE_ID,
	name: 'Primary Site',
	URL: 'https://primary.example.com',
	slug: 'primary.example.com',
	site_migration: { migration_status: '' },
} as Site;

const otherSite = {
	ID: 456,
	name: 'Other Site',
	URL: 'https://other.example.com',
	slug: 'other.example.com',
	site_migration: { migration_status: '' },
} as Site;

const user = { ID: 1, visible_site_count: 2 } as User;

function mockPreferences( preferences: Partial< UserPreferences > = {} ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, { calypso_preferences: preferences } );
}

function mockUserSettings( primarySiteId: number | null = PRIMARY_SITE_ID ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/settings' )
		.query( true )
		.reply( 200, { primary_site_ID: primarySiteId } );
}

function mockSites( sites: Site[] ) {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites } );
}

function mockSite( site: Site ) {
	nock( 'https://public-api.wordpress.com' )
		.get( `/rest/v1.1/sites/${ site.ID }` )
		.query( true )
		.reply( 200, site );
}

function mockPreferencesSaved() {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences' )
		.reply( 200, { calypso_preferences: {} } );
}

function mockPrimarySiteSaved( expectedSiteId: number ) {
	return nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/settings', ( body ) => {
			expect( body.primary_site_ID ).toBe( expectedSiteId );
			return true;
		} )
		.reply( 200, { primary_site_ID: expectedSiteId } );
}

function saveButtonFor( formName: string ) {
	return within( screen.getByRole( 'form', { name: formName } ) ).getByRole( 'button', {
		name: 'Save',
	} );
}

function renderPage() {
	return render( <PreferencesDefaults />, { user } );
}

afterEach( () => {
	nock.cleanAll();
} );

describe( '<PreferencesDefaults>', () => {
	describe( 'landing page', () => {
		test( 'save button is disabled until the selection changes', async () => {
			const currentUser = userEvent.setup();
			mockPreferences();
			mockUserSettings();
			mockSites( [ primarySite, otherSite ] );
			mockSite( primarySite );

			renderPage();

			await screen.findByRole( 'form', { name: 'Landing page' } );
			const saveButton = saveButtonFor( 'Landing page' );
			expect( saveButton ).toBeDisabled();

			await currentUser.click( screen.getByLabelText( 'See a list of all your sites.' ) );
			expect( saveButton ).toBeEnabled();
		} );

		test( 'saves the selected landing page', async () => {
			const currentUser = userEvent.setup();
			mockPreferences();
			mockUserSettings();
			mockSites( [ primarySite, otherSite ] );
			mockSite( primarySite );
			const saveRequest = mockPreferencesSaved();

			renderPage();

			await currentUser.click(
				await screen.findByLabelText( 'View posts from sites you follow.' )
			);
			await currentUser.click( saveButtonFor( 'Landing page' ) );

			await waitFor( () => expect( saveRequest.isDone() ).toBe( true ) );
		} );

		test( 'keeps the change when saving fails', async () => {
			const currentUser = userEvent.setup();
			mockPreferences();
			mockUserSettings();
			mockSites( [ primarySite, otherSite ] );
			mockSite( primarySite );
			const saveRequest = nock( 'https://public-api.wordpress.com' )
				.post( '/rest/v1.1/me/preferences' )
				.reply( 500 );

			renderPage();

			await currentUser.click( await screen.findByLabelText( 'See a list of all your sites.' ) );
			await currentUser.click( saveButtonFor( 'Landing page' ) );

			await waitFor( () => expect( saveRequest.isDone() ).toBe( true ) );
			expect( screen.getByLabelText( 'See a list of all your sites.' ) ).toBeChecked();
			await waitFor( () => expect( saveButtonFor( 'Landing page' ) ).toBeEnabled() );
		} );

		test( 'preselects the saved landing page', async () => {
			mockPreferences( {
				'reader-landing-page': { useReaderAsLandingPage: true, updatedAt: 0 },
			} );
			mockUserSettings();
			mockSites( [ primarySite, otherSite ] );
			mockSite( primarySite );

			renderPage();

			await expect(
				screen.findByLabelText( 'View posts from sites you follow.' )
			).resolves.toBeChecked();
		} );
	} );

	describe( 'primary site', () => {
		test( 'shows the saved primary site even when it is absent from the site list', async () => {
			mockPreferences();
			mockUserSettings();
			mockSites( [ otherSite ] );
			mockSite( primarySite );

			renderPage();

			await expect( screen.findByDisplayValue( 'Primary Site' ) ).resolves.toBeVisible();
		} );

		test( 'saves a newly selected primary site', async () => {
			const currentUser = userEvent.setup();
			mockPreferences();
			mockUserSettings();
			mockSites( [ primarySite, otherSite ] );
			mockSite( primarySite );
			const saveRequest = mockPrimarySiteSaved( otherSite.ID );

			renderPage();

			await currentUser.click( await screen.findByDisplayValue( 'Primary Site' ) );
			await currentUser.click( await screen.findByRole( 'option', { name: /Other Site/ } ) );
			await currentUser.click( saveButtonFor( 'Primary site' ) );

			await waitFor( () => expect( saveRequest.isDone() ).toBe( true ) );
		} );

		test( 'hides the primary site selector when the user has no sites', async () => {
			mockPreferences();
			mockUserSettings( null );
			mockSites( [] );

			render( <PreferencesDefaults />, { user: { ID: 1, visible_site_count: 0 } as User } );

			await screen.findByRole( 'form', { name: 'Primary site' } );
			expect( screen.queryByLabelText( 'Site' ) ).not.toBeInTheDocument();
		} );
	} );
} );
