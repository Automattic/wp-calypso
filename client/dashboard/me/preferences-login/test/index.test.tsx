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
import type { LoginPreferences } from '../../../data/me-preferences';
import type { Site } from '../../../data/types';

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

const mockLoginPreferences: LoginPreferences = {
	primarySiteId: '123',
	defaultLandingPage: 'primary-site-dashboard',
};

function renderPreferencesLogin() {
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, {
			calypso_preferences: {
				'login-preferences': mockLoginPreferences,
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

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	await waitFor( () => {
		expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
	} );

	expect( screen.getByText( 'DEFAULT LANDING PAGE' ) ).toBeInTheDocument();
	expect(
		screen.getByText( 'Choose the default site dashboard you’ll see at login.' )
	).toBeInTheDocument();
	expect(
		screen.getByText( 'Select what you’ll see by default when visiting WordPress.com.' )
	).toBeInTheDocument();
} );

test( 'displays site options in dropdown', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	await waitFor( () => {
		expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
	} );

	const siteSelector = screen.getByRole( 'combobox' );
	expect( siteSelector ).toHaveTextContent( 'Test Site 1' );

	await user.click( siteSelector );

	await waitFor( () => {
		const testSite2Elements = screen.getAllByText( 'Test Site 2' );
		expect( testSite2Elements.length ).toBe( 2 );
		testSite2Elements.map( ( element ) => {
			expect( element ).toBeInTheDocument();
		} );
	} );
} );

test( 'displays landing page radio options', async () => {
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	expect( screen.getByLabelText( 'Primary site dashboard' ) ).toBeInTheDocument();
	expect( screen.getByLabelText( 'Sites' ) ).toBeInTheDocument();
	expect( screen.getByLabelText( 'Reader' ) ).toBeInTheDocument();

	expect( screen.getByLabelText( 'Primary site dashboard' ) ).toBeChecked();
} );

test( 'save button is disabled when form is not dirty', async () => {
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	expect( saveButton ).toBeDisabled();
} );

test( 'save button becomes enabled when form is modified', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	expect( saveButton ).toBeEnabled();
} );

test( 'saves preferences successfully', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', {
			calypso_preferences: {
				'login-preferences': {
					primarySiteId: '123',
					defaultLandingPage: 'sites',
				},
			},
		} )
		.reply( 200, {
			calypso_preferences: {
				'login-preferences': {
					primarySiteId: '123',
					defaultLandingPage: 'sites',
				},
			},
		} );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await user.click( saveButton );

	await waitFor( () => {
		expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
			'Login preferences saved successfully.',
			{ type: 'snackbar' }
		);
	} );
} );

test( 'handles save error gracefully', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences' )
		.reply( 500, { error: 'Server error' } );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await user.click( saveButton );

	await waitFor( () => {
		expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
			'Failed to save login preferences. Please try again.',
			{ type: 'snackbar' }
		);
	} );
} );

test( 'changes primary site selection', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	await waitFor( () => {
		expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
	} );

	const siteSelector = screen.getByRole( 'combobox' );
	await user.click( siteSelector );

	const testSite2Options = screen.getAllByText( 'Test Site 2' );
	const clickableOption = testSite2Options.find( ( element ) =>
		element.closest( '[role="option"]' )
	);
	await user.click( clickableOption! );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences', {
			calypso_preferences: {
				'login-preferences': {
					primarySiteId: '456',
					defaultLandingPage: 'primary-site-dashboard',
				},
			},
		} )
		.reply( 200, {
			calypso_preferences: {
				'login-preferences': {
					primarySiteId: '456',
					defaultLandingPage: 'primary-site-dashboard',
				},
			},
		} );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	expect( saveButton ).toBeEnabled();

	await user.click( saveButton );

	await waitFor( () => {
		expect( mockCreateSuccessNotice ).toHaveBeenCalledWith(
			'Login preferences saved successfully.',
			{ type: 'snackbar' }
		);
	} );
} );

test( 'hides primary site selector when user has no sites', async () => {
	nock.cleanAll();
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, {
			calypso_preferences: {
				'login-preferences': {
					primarySiteId: undefined,
					defaultLandingPage: 'sites',
				},
			},
		} );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: [] } );

	render( <PreferencesLogin /> );

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	expect( screen.queryByText( 'PRIMARY SITE' ) ).not.toBeInTheDocument();

	expect( screen.getByText( 'DEFAULT LANDING PAGE' ) ).toBeInTheDocument();
} );

test( 'sets first site as default when none selected', async () => {
	nock.cleanAll();
	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.1/me/preferences' )
		.reply( 200, {
			calypso_preferences: {
				'login-preferences': {
					primarySiteId: undefined,
					defaultLandingPage: 'primary-site-dashboard',
				},
			},
		} );

	nock( 'https://public-api.wordpress.com' )
		.get( '/rest/v1.2/me/sites' )
		.query( true )
		.reply( 200, { sites: mockSites } );

	render( <PreferencesLogin /> );

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	await waitFor( () => {
		expect( screen.getByText( 'PRIMARY SITE' ) ).toBeInTheDocument();
	} );

	const siteSelector = screen.getByRole( 'combobox' );
	expect( siteSelector ).toHaveTextContent( 'Test Site 1' );
} );

test( 'disables save button while saving', async () => {
	const user = userEvent.setup();
	renderPreferencesLogin();

	await waitFor( () => {
		expect( screen.getByText( 'Login preferences' ) ).toBeInTheDocument();
	} );

	nock( 'https://public-api.wordpress.com' )
		.post( '/rest/v1.1/me/preferences' )
		.delay( 100 )
		.reply( 200, {
			calypso_preferences: {
				'login-preferences': {
					primarySiteId: '123',
					defaultLandingPage: 'sites',
				},
			},
		} );

	const sitesRadio = screen.getByLabelText( 'Sites' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await user.click( saveButton );

	expect( saveButton ).toBeDisabled();

	await waitFor( () => {
		expect( mockCreateSuccessNotice ).toHaveBeenCalled();
	} );
} );
