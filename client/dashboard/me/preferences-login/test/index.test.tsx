/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import nock from 'nock';
import { DeepPartial } from 'utility-types/dist';
import { render } from '../../../test-utils';
import PreferencesLogin from '../index';
import type { Site } from '@automattic/api-core';

const mockCreateSuccessNotice = jest.fn();
const mockCreateErrorNotice = jest.fn();

if ( typeof CSS === 'undefined' ) {
	global.CSS = {} as unknown as typeof CSS;
}

if ( typeof CSS.escape !== 'function' ) {
	CSS.escape = function ( value ) {
		return String( value ).replace( /[^a-zA-Z0-9_\u00A0-\uFFFF-]/g, '\\$&' );
	};
}

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
		ID: 123,
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

function renderPreferencesLogin() {
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
		primary_site_ID: 123,
	} );

	nock( 'https://public-api.wordpress.com' )
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

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: mockSites } );

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

test( 'renders login preferences form with correct fields', async () => {
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	await waitFor(
		() => {
			expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	expect( screen.getByText( 'DEFAULT LANDING PAGE' ) ).toBeInTheDocument();
	expect(
		screen.getByText( "Choose the default site dashboard you'll see at login." )
	).toBeInTheDocument();
	expect(
		screen.getByText( 'Select what you’ll see by default when visiting WordPress.com.' )
	).toBeInTheDocument();
} );

test( 'displays site options in dropdown', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	await waitFor(
		() => {
			expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const siteSelector = screen.getByRole( 'combobox' );
	expect( siteSelector ).toHaveTextContent( 'Test Site 1' );

	await user.click( siteSelector );

	await waitFor(
		() => {
			const testSite2Elements = screen.getAllByText( 'Test Site 2' );
			expect( testSite2Elements.length ).toBe( 2 );
			testSite2Elements.map( ( element ) => {
				expect( element ).toBeInTheDocument();
			} );
		},
		{ timeout: 5000 }
	);
} );

test( 'displays landing page radio options', async () => {
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	expect( screen.getByLabelText( 'Primary site dashboard' ) ).toBeInTheDocument();
	expect( screen.getByLabelText( 'Sites' ) ).toBeInTheDocument();
	expect( screen.getByLabelText( 'Reader' ) ).toBeInTheDocument();

	expect( screen.getByLabelText( 'Primary site dashboard' ) ).toBeChecked();
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
	await user.click( sitesRadio );

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

	// Mock the multiple preferences API calls that will be made
	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'sites-landing-page' in body.calypso_preferences;
		} )
		.reply( 200, {} );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'reader-landing-page' in body.calypso_preferences;
		} )
		.reply( 200, {} );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await user.click( saveButton );

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

	// Mock both preferences API calls - both will return errors
	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'sites-landing-page' in body.calypso_preferences;
		} )
		.reply( 500, { error: 'Server error' } );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'reader-landing-page' in body.calypso_preferences;
		} )
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

test( 'changes primary site selection', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	await waitFor(
		() => {
			expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const siteSelector = screen.getByRole( 'combobox' );
	await user.click( siteSelector );

	const testSite2Options = screen.getAllByText( 'Test Site 2' );
	const clickableOption = testSite2Options.find( ( element ) =>
		element.closest( '[role="option"]' )
	);
	await user.click( clickableOption! );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/settings', {
			primary_site_ID: 456,
		} )
		.reply( 200, {
			primary_site_ID: 456,
		} );

	// Mock the multiple preferences API calls
	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'sites-landing-page' in body.calypso_preferences;
		} )
		.reply( 200, {} );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'reader-landing-page' in body.calypso_preferences;
		} )
		.reply( 200, {} );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	expect( saveButton ).toBeEnabled();

	await user.click( saveButton );

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

test( 'hides primary site selector when user has no sites', async () => {
	nock.cleanAll();
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
		primary_site_ID: null,
	} );

	nock( 'https://public-api.wordpress.com' )
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

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [] } );

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

test( 'sets first site as default when none selected', async () => {
	nock.cleanAll();
	nock( 'https://public-api.wordpress.com' ).get( '/rest/v1.1/me/settings' ).reply( 200, {
		primary_site_ID: null,
	} );

	nock( 'https://public-api.wordpress.com' )
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

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: mockSites } );

	render( <PreferencesLogin /> );

	await waitFor(
		() => {
			expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	await waitFor(
		() => {
			expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const siteSelector = screen.getByRole( 'combobox' );
	expect( siteSelector ).toHaveTextContent( 'Test Site 1' );
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

	// Mock both preferences API calls with delay
	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'sites-landing-page' in body.calypso_preferences;
		} )
		.delay( 100 )
		.reply( 200, {} );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', ( body ) => {
			return body.calypso_preferences && 'reader-landing-page' in body.calypso_preferences;
		} )
		.delay( 100 )
		.reply( 200, {} );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await user.click( saveButton );

	expect( saveButton ).toBeDisabled();

	await waitFor(
		() => {
			expect( mockCreateSuccessNotice ).toHaveBeenCalled();
		},
		{ timeout: 5000 }
	);
} );
