/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDispatch } from '@wordpress/data';
import nock from 'nock';
import { render } from '../../../test-utils';
import PreferencesDefaultLanding from '../index';

const API_BASE = 'https://public-api.wordpress.com';

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
	useDispatch: jest.fn( () => ( {
		createSuccessNotice: jest.fn(),
		createErrorNotice: jest.fn(),
	} ) ),
	store: jest.fn(),
	combineReducers: jest.fn(),
	createReduxStore: jest.fn(),
	register: jest.fn(),
	createRegistry: jest.fn(),
	createSelector: jest.fn( ( selector ) => selector ),
	select: jest.fn(),
	dispatch: jest.fn(),
} ) );

jest.mock(
	'@automattic/api-queries',
	() => ( {
		rawUserPreferencesQuery: jest.fn( () => ( {
			queryKey: [ 'me', 'preferences' ],
			queryFn: jest.fn(),
		} ) ),
		userPreferencesMutation: jest.fn( () => ( {
			mutationFn: jest.fn(),
		} ) ),
	} ),
	{ virtual: true }
);

function matchesLoginPreferencesPayload( body: {
	calypso_preferences?: Record< string, unknown >;
} ) {
	const preferences = body?.calypso_preferences;
	return Boolean(
		preferences && 'sites-landing-page' in preferences && 'reader-landing-page' in preferences
	);
}

function renderPreferencesDefaultLanding() {
	const { rawUserPreferencesQuery } = require( '@automattic/api-queries' );

	// Mock rawUserPreferencesQuery to return the API response
	rawUserPreferencesQuery.mockReturnValue( {
		queryKey: [ 'me', 'preferences' ],
		queryFn: () =>
			Promise.resolve( {
				'sites-landing-page': {
					useSitesAsLandingPage: false,
					updatedAt: Date.now(),
				},
				'reader-landing-page': {
					useReaderAsLandingPage: false,
					updatedAt: Date.now(),
				},
			} ),
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

	return render( <PreferencesDefaultLanding /> );
}

afterEach( () => {
	nock.cleanAll();
	jest.clearAllMocks();
	const { rawUserPreferencesQuery } = require( '@automattic/api-queries' );
	rawUserPreferencesQuery.mockClear();
} );

beforeAll( () => {
	nock.disableNetConnect();
} );

afterAll( () => {
	nock.enableNetConnect();
} );

test( 'save button is disabled when form is not dirty', async () => {
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	expect( saveButton ).toBeDisabled();
} );

test( 'save button becomes enabled when form is modified', async () => {
	const user = userEvent.setup();
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const sitesRadio = screen.getByLabelText( 'See a list of all your sites.' );
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
	const mockCreateSuccessNotice = jest.fn();
	( useDispatch as jest.Mock ).mockReturnValue( {
		createSuccessNotice: mockCreateSuccessNotice,
	} );
	const user = userEvent.setup();
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Mock the save API request that will be made
	nock( API_BASE )
		.post( '/rest/v1.1/me/preferences', matchesLoginPreferencesPayload )
		.reply( 200, {} );

	const sitesRadio = screen.getByLabelText( 'See a list of all your sites.' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );

	await user.click( saveButton );
	await waitFor(
		() => {
			expect( mockCreateSuccessNotice ).toHaveBeenCalledWith( 'Default landing page saved.', {
				type: 'snackbar',
			} );
		},
		{ timeout: 5000 }
	);
} );

test( 'handles save error gracefully', async () => {
	const mockCreateErrorNotice = jest.fn();
	( useDispatch as jest.Mock ).mockReturnValue( {
		createErrorNotice: mockCreateErrorNotice,
	} );
	const user = userEvent.setup();
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Mock the save API request, forcing the preferences update to error
	nock( API_BASE )
		.post( '/rest/v1.1/me/preferences', matchesLoginPreferencesPayload )
		.reply( 500, { error: 'Server error' } );

	const sitesRadio = screen.getByLabelText( 'See a list of all your sites.' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );
	await user.click( saveButton );

	await waitFor(
		() => {
			expect( mockCreateErrorNotice ).toHaveBeenCalledWith(
				'Failed to save default landing page.',
				{
					type: 'snackbar',
				}
			);
		},
		{ timeout: 5000 }
	);
} );

test( 'disables save button while saving', async () => {
	const mockCreateSuccessNotice = jest.fn();
	( useDispatch as jest.Mock ).mockReturnValue( {
		createSuccessNotice: mockCreateSuccessNotice,
	} );
	const user = userEvent.setup();
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Mock the save request with a delayed preferences response
	nock( API_BASE )
		.post( '/rest/v1.1/me/preferences', matchesLoginPreferencesPayload )
		.delay( 100 )
		.reply( 200, {} );

	const sitesRadio = screen.getByLabelText( 'See a list of all your sites.' );
	await user.click( sitesRadio );

	const saveButton = screen.getByRole( 'button', { name: 'Save' } );

	await user.click( saveButton );

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
