/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { render } from '../../../test-utils';
import PreferencesLogin from '../index';
import type { Site } from '@automattic/api-core';
import type { DeepPartial } from 'utility-types';

const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();

const API_BASE = 'https://public-api.wordpress.com';
const mockPrimarySiteId = 123;

if ( typeof CSS === 'undefined' ) {
	global.CSS = {} as unknown as typeof CSS;
}

if ( typeof CSS.escape !== 'function' ) {
	CSS.escape = function ( value ) {
		return String( value ).replace( /[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, '\\$&' );
	};
}

// Mock scrollIntoView for JSDOM compatibility
Element.prototype.scrollIntoView = jest.fn();

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: mockCreateErrorNotice,
	} ),
	store: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createRegistry: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

const mockSites: DeepPartial< Site >[] = [
	{
		ID: mockPrimarySiteId,
		name: 'Test Site 1',
		URL: 'https://testsite1.com',
		site_migration: {
			migration_status: '',
		},
	},
	{
		ID: 456,
		name: 'Test Site 2',
		URL: 'https://testsite2.com',
		site_migration: {
			migration_status: '',
		},
	},
];

function mockUpdateUserSettingsSuccess() {
	return nock( API_BASE )
		.post( '/rest/v1.1/me/settings', { primary_site_ID: mockPrimarySiteId } )
		.reply( 200, {} );
}

function matchesLoginPreferencesPayload( body: {
	calypso_preferences?: Record< string, unknown >;
} ) {
	const preferences = body?.calypso_preferences;
	return Boolean(
		preferences && 'sites-landing-page' in preferences && 'reader-landing-page' in preferences
	);
}

function renderPreferencesLogin() {
	nock( API_BASE ).get( '/rest/v1.1/me/settings' ).reply( 200, {
		primary_site_ID: mockPrimarySiteId,
	} );

	nock( API_BASE )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: {
				'sites-landing-page': {
					useSitesAsLandingPage: false,
					updatedAt: Date.now(),
				},
				'reader-landing-page': {
					useReaderAsLandingPage: false,
					updatedAt: Date.now(),
				},
			},
		} );

	nock( API_BASE ).get( '/rest/v1.2/me/sites' ).query( true ).reply( 200, { sites: mockSites } );

	return render( <PreferencesLogin /> );
}

afterEach( () => {
	nock.cleanAll();
	jest.clearAllMocks();
} );

beforeAll( () => {
	nock.disableNetConnect();
} );

afterAll( () => {
	nock.enableNetConnect();
} );

test( 'save button is disabled when form is not dirty', async () => {
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	expect( saveButton ).toBeDisabled();
} );

test( 'save button becomes enabled when form is modified', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await act( async () => await user.click( sitesRadio ) );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await waitFor(
		() => {
			expect( saveButton ).toBeEnabled();
		},
		{ timeout: 5000 }
	);
} );

test( 'saves preferences successfully', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Mock the save API requests that will be made
	mockUpdateUserSettingsSuccess();
	nock( API_BASE )
		.post( '/rest/v1.1/me/preferences', matchesLoginPreferencesPayload )
		.reply( 200, {} );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await act( async () => await user.click( sitesRadio ) );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );

	await act( async () => await user.click( saveButton ) );
	await waitFor(
		() => {
			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
				'Login preferences saved successfully.',
				{ type: 'snackbar' }
			);
		},
		{ timeout: 5000 }
	);
} );

test( 'handles save error gracefully', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Mock the save API requests, forcing the preferences update to error
	mockUpdateUserSettingsSuccess();
	nock( API_BASE )
		.post( '/rest/v1.1/me/preferences', matchesLoginPreferencesPayload )
		.reply( 500, { error: 'Server error' } );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await user.click( saveButton );

	await waitFor(
		() => {
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'Failed to save login preferences. Please try again.',
				{ type: 'snackbar' }
			);
		},
		{ timeout: 5000 }
	);
} );

test( 'hides primary site selector when user has no sites', async () => {
	nock.cleanAll();
	nock( API_BASE ).get( '/rest/v1.1/me/settings' ).reply( 200, {
		primary_site_ID: null,
	} );

	nock( API_BASE )
		.get( '/rest/v1.1/me/preferences' )
		.query( true )
		.reply( 200, {
			calypso_preferences: {
				'sites-landing-page': {
					useSitesAsLandingPage: true,
					updatedAt: Date.now(),
				},
				'reader-landing-page': {
					useReaderAsLandingPage: false,
					updatedAt: Date.now(),
				},
			},
		} );

	nock( API_BASE ).get( '/rest/v1.2/me/sites' ).query( true ).reply( 200, { sites: [] } );

	render( <PreferencesLogin /> );

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	expect( screen.queryByText( 'PRIMARY SITE' ) ).not.toBeInTheDocument();

	expect( screen.getByText( 'DEFAULT LANDING PAGE' ) ).toBeInTheDocument();
} );

test( 'disables save button while saving', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Mock the save requests with a delayed preferences response
	mockUpdateUserSettingsSuccess();
	nock( API_BASE )
		.post( '/rest/v1.1/me/preferences', matchesLoginPreferencesPayload )
		.delay( 100 )
		.reply( 200, {} );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await act( async () => await user.click( sitesRadio ) );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );

	await act( async () => await user.click( saveButton ) );

	await waitFor(
		() => {
			expect( saveButton ).toBeDisabled();
		},
		{ timeout: 5000 }
	);

	await waitFor(
		() => {
			expect( mockCreateSuccessNotice ).toHaveBeenCalled();
		},
		{ timeout: 5000 }
	);
} );
