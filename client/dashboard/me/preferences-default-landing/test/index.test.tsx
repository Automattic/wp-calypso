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

test( 'renders all landing page options as cards', async () => {
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Verify all three options are rendered
	expect( screen.getByText( 'All Sites' ) ).toBeInTheDocument();
	expect( screen.getByText( 'Primary Site' ) ).toBeInTheDocument();
	expect( screen.getByText( 'Reader' ) ).toBeInTheDocument();

	// Verify the radiogroup role is present
	expect( screen.getByRole( 'radiogroup' ) ).toBeInTheDocument();

	// Verify all radio options are present
	const radioOptions = screen.getAllByRole( 'radio' );
	expect( radioOptions ).toHaveLength( 3 );
} );

test( 'clicking an option saves immediately', async () => {
	const mockCreateSuccessNotice = jest.fn();
	( useDispatch as jest.Mock ).mockReturnValue( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: jest.fn(),
	} );

	const { userPreferencesMutation } = require( '@automattic/api-queries' );
	const mockMutationFn = jest.fn( () =>
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
	);
	userPreferencesMutation.mockReturnValue( {
		mutationFn: mockMutationFn,
	} );

	const user = userEvent.setup();
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	// Click on the "All Sites" option card
	const allSitesOption = screen.getByText( 'All Sites' ).closest( '[role="radio"]' );
	expect( allSitesOption ).toBeInTheDocument();
	await user.click( allSitesOption! );

	// Verify mutation was called with correct parameters
	await waitFor(
		() => {
			expect( mockMutationFn ).toHaveBeenCalledWith(
				expect.objectContaining( {
					'sites-landing-page': expect.objectContaining( {
						useSitesAsLandingPage: true,
					} ),
					'reader-landing-page': expect.objectContaining( {
						useReaderAsLandingPage: false,
					} ),
				} )
			);
		},
		{ timeout: 5000 }
	);

	// Verify success notice was shown
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
		createSuccessNotice: jest.fn(),
		createErrorNotice: mockCreateErrorNotice,
	} );

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

	// Click on the "Reader" option card
	const readerOption = screen.getByText( 'Reader' ).closest( '[role="radio"]' );
	await user.click( readerOption! );

	// Verify error notice was shown
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

test( 'cards are disabled while saving', async () => {
	const mockCreateSuccessNotice = jest.fn();
	( useDispatch as jest.Mock ).mockReturnValue( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: jest.fn(),
	} );

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

	const allSitesOption = screen.getByText( 'All Sites' ).closest( '[role="radio"]' );
	await user.click( allSitesOption! );

	// Verify cards are disabled during save (aria-disabled="true")
	await waitFor(
		() => {
			const radioOptions = screen.getAllByRole( 'radio' );
			radioOptions.forEach( ( option ) => {
				expect( option ).toHaveAttribute( 'aria-disabled', 'true' );
			} );
		},
		{ timeout: 5000 }
	);

	// Wait for save to complete
	await waitFor(
		() => {
			expect( mockCreateSuccessNotice ).toHaveBeenCalled();
		},
		{ timeout: 5000 }
	);
} );

test( 'supports keyboard navigation', async () => {
	const mockCreateSuccessNotice = jest.fn();
	( useDispatch as jest.Mock ).mockReturnValue( {
		createSuccessNotice: mockCreateSuccessNotice,
		createErrorNotice: jest.fn(),
	} );

	const { userPreferencesMutation } = require( '@automattic/api-queries' );
	userPreferencesMutation.mockReturnValue( {
		mutationFn: jest.fn( () => Promise.resolve( {} ) ),
	} );

	const user = userEvent.setup();
	renderPreferencesDefaultLanding();

	await waitFor(
		() => {
			expect( screen.getByText( 'Default landing page' ) ).toBeInTheDocument();
		},
		{ timeout: 5000 }
	);

	const allSitesOption = screen.getByText( 'All Sites' ).closest( '[role="radio"]' );

	// Focus the option and press Enter
	allSitesOption!.focus();
	await user.keyboard( '{Enter}' );

	// Verify save was triggered
	await waitFor(
		() => {
			expect( mockCreateSuccessNotice ).toHaveBeenCalled();
		},
		{ timeout: 5000 }
	);
} );
