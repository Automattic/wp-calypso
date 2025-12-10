/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDispatch } from '@wordpress/data';
import { render } from '../../../test-utils';
import PreferencesDefaultLanding from '../index';

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

function renderPreferencesDefaultLanding() {
	const { rawUserPreferencesQuery } = require( '@automattic/api-queries' );

	// Mock rawUserPreferencesQuery to return the API response
	// This is required because the component uses useSuspenseQuery which needs data immediately
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

	return render( <PreferencesDefaultLanding /> );
}

afterEach( () => {
	jest.clearAllMocks();
	const { rawUserPreferencesQuery } = require( '@automattic/api-queries' );
	rawUserPreferencesQuery.mockClear();
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

	// Override the mock to make mutationFn return a resolved promise
	const { userPreferencesMutation } = require( '@automattic/api-queries' );
	userPreferencesMutation.mockReturnValue( {
		mutationFn: jest.fn( () =>
			Promise.resolve( {
				'sites-landing-page': {
					useSitesAsLandingPage: true,
					updatedAt: Date.now(),
				},
				'reader-landing-page': {
					useReaderAsLandingPage: false,
					updatedAt: Date.now(),
				},
			} )
		),
	} );

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

	// Override the mock to make mutationFn return a rejected promise
	// This simulates an API error
	const { userPreferencesMutation } = require( '@automattic/api-queries' );
	userPreferencesMutation.mockReturnValue( {
		mutationFn: jest.fn( () => Promise.reject( new Error( 'Server error' ) ) ),
	} );

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
	const mockCreateErrorNotice = jest.fn();
	( useDispatch as jest.Mock ).mockReturnValue( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: mockCreateErrorNotice,
	} );

	// Override the mock to make mutationFn return a delayed promise
	// This simulates an async operation that takes time, making isPending true
	const { userPreferencesMutation } = require( '@automattic/api-queries' );
	userPreferencesMutation.mockReturnValue( {
		mutationFn: jest.fn( () => {
			return new Promise( ( resolve ) => {
				setTimeout( () => {
					resolve( {
						'sites-landing-page': {
							useSitesAsLandingPage: true,
							updatedAt: Date.now(),
						},
						'reader-landing-page': {
							useReaderAsLandingPage: false,
							updatedAt: Date.now(),
						},
					} );
				}, 100 );
			} );
		} ),
	} );

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
