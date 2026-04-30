/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColorSchemeProvider, useColorScheme } from '..';

const PREFERENCE_KEY = 'hosting-dashboard-color-scheme';
let mockPreferences: Record< string, unknown > = {};
const mockUpdatePreference = jest.fn();
const mockOnSaveSuccess = jest.fn();
let mockPreferenceQueryMode: 'success' | 'fail' | 'defer' = 'success';
let mockMutationMode: 'success' | 'fail' | 'defer' = 'success';
const mockPendingPreferenceQueries: {
	resolve: () => void;
}[] = [];
const mockPendingMutations: {
	preferenceName: string;
	value: unknown;
	resolve: () => void;
	reject: () => void;
}[] = [];

function mockSavePreference( preferenceName: string, value: unknown ) {
	mockUpdatePreference( preferenceName, value );

	if ( mockMutationMode === 'fail' ) {
		return Promise.reject( new Error( 'Could not save preference.' ) );
	}

	if ( mockMutationMode === 'defer' ) {
		return new Promise< Record< string, unknown > >( ( resolve, reject ) => {
			mockPendingMutations.push( {
				preferenceName,
				value,
				resolve: () => {
					mockPreferences = { ...mockPreferences, [ preferenceName ]: value };
					resolve( mockPreferences );
				},
				reject: () => reject( new Error( 'Could not save preference.' ) ),
			} );
		} );
	}

	mockPreferences = { ...mockPreferences, [ preferenceName ]: value };
	return Promise.resolve( mockPreferences );
}

function mockFetchPreferences() {
	if ( mockPreferenceQueryMode === 'fail' ) {
		return Promise.reject( new Error( 'Could not load preferences.' ) );
	}

	if ( mockPreferenceQueryMode === 'defer' ) {
		return new Promise< Record< string, unknown > >( ( resolve ) => {
			mockPendingPreferenceQueries.push( {
				resolve: () => resolve( mockPreferences ),
			} );
		} );
	}

	return Promise.resolve( mockPreferences );
}

jest.mock(
	'@automattic/api-queries',
	() => {
		const { QueryClient: TestQueryClient } = jest.requireActual( '@tanstack/react-query' );
		const queryClient = new TestQueryClient( {
			defaultOptions: {
				queries: { retry: false },
			},
		} );

		return {
			queryClient,
			rawUserPreferencesQuery: jest.fn( () => ( {
				// eslint-disable-next-line @tanstack/query/exhaustive-deps
				queryKey: [ 'me', 'preferences' ],
				queryFn: mockFetchPreferences,
			} ) ),
			userPreferenceQuery: jest.fn( ( preferenceName ) => ( {
				// eslint-disable-next-line @tanstack/query/exhaustive-deps
				queryKey: [ 'me', 'preferences' ],
				queryFn: mockFetchPreferences,
				select: ( preferences: Record< string, unknown > ) =>
					preferences[ preferenceName ] === undefined ? 'light' : preferences[ preferenceName ],
			} ) ),
			userPreferenceOptimisticMutation: jest.fn( ( preferenceName ) => ( {
				mutationFn: ( value: unknown ) => mockSavePreference( preferenceName, value ),
				onMutate: async ( value: unknown ) => {
					await queryClient.cancelQueries( { queryKey: [ 'me', 'preferences' ] } );
					const previous = queryClient.getQueryData( [ 'me', 'preferences' ] );
					queryClient.setQueryData(
						[ 'me', 'preferences' ],
						( oldData: Record< string, unknown > | undefined ) => ( {
							...oldData,
							[ preferenceName ]: value,
						} )
					);
					return { previous };
				},
				onError: (
					_error: unknown,
					_value: unknown,
					context: { previous?: Record< string, unknown > } | undefined
				) => {
					if ( context?.previous ) {
						queryClient.setQueryData( [ 'me', 'preferences' ], context.previous );
					}
				},
			} ) ),
		};
	},
	{ virtual: true }
);

function CurrentScheme() {
	const { colorScheme, setColorScheme } = useColorScheme();
	return (
		<div>
			<span data-testid="scheme">{ colorScheme }</span>
			<button onClick={ () => setColorScheme( 'light' ) } type="button">
				Light
			</button>
			<button
				onClick={ () =>
					setColorScheme( 'dark', {
						onSuccess: () => mockOnSaveSuccess( 'dark', colorScheme ),
					} )
				}
				type="button"
			>
				Dark
			</button>
			<button onClick={ () => setColorScheme( 'system' ) } type="button">
				System
			</button>
		</div>
	);
}

function getMockQueryClient(): QueryClient {
	return require( '@automattic/api-queries' ).queryClient;
}

function renderColorSchemeProvider() {
	const queryClient = getMockQueryClient();
	return render(
		<QueryClientProvider client={ queryClient }>
			<ColorSchemeProvider>
				<CurrentScheme />
			</ColorSchemeProvider>
		</QueryClientProvider>
	);
}

beforeEach( () => {
	mockPreferences = {};
	mockUpdatePreference.mockClear();
	mockOnSaveSuccess.mockClear();
	mockPreferenceQueryMode = 'success';
	mockMutationMode = 'success';
	mockPendingPreferenceQueries.length = 0;
	mockPendingMutations.length = 0;
	getMockQueryClient().clear();
	document.documentElement.removeAttribute( 'data-theme' );
} );

test( 'defaults to light when no server preference is available', async () => {
	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'defaults to light when the loaded server preference is invalid', async () => {
	mockPreferences = { [ PREFERENCE_KEY ]: 'blue' };

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'uses a valid loaded server preference', async () => {
	mockPreferences = { [ PREFERENCE_KEY ]: 'dark' };

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'waits for preferences before rendering when no cached preference is available', async () => {
	mockPreferences = { [ PREFERENCE_KEY ]: 'dark' };
	mockPreferenceQueryMode = 'defer';

	renderColorSchemeProvider();

	expect( screen.queryByTestId( 'scheme' ) ).not.toBeInTheDocument();

	mockPendingPreferenceQueries[ 0 ].resolve();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'uses cached preferences while the query refetches', async () => {
	const user = userEvent.setup();
	mockPreferences = { [ PREFERENCE_KEY ]: 'dark' };
	mockPreferenceQueryMode = 'defer';
	getMockQueryClient().setQueryData( [ 'me', 'preferences' ], mockPreferences );

	renderColorSchemeProvider();

	expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'keeps cached preferences when the query refetch fails', async () => {
	mockPreferences = { [ PREFERENCE_KEY ]: 'dark' };
	mockPreferenceQueryMode = 'fail';
	getMockQueryClient().setQueryData( [ 'me', 'preferences' ], mockPreferences );

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'defaults to light when loading preferences fails without cached preferences', async () => {
	mockPreferenceQueryMode = 'fail';

	renderColorSchemeProvider();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( document.documentElement.dataset.theme ).toBe( 'light' );
		expect( mockUpdatePreference ).not.toHaveBeenCalled();
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'optimistically applies a user-initiated color scheme change', async () => {
	const user = userEvent.setup();
	mockPreferences = { [ PREFERENCE_KEY ]: 'light' };
	mockMutationMode = 'defer';

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );
		expect( document.documentElement.dataset.theme ).toBe( 'dark' );
		expect( mockPendingMutations ).toHaveLength( 1 );
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'rolls back an optimistic color scheme change when saving fails', async () => {
	const user = userEvent.setup();
	mockPreferences = { [ PREFERENCE_KEY ]: 'light' };
	mockMutationMode = 'defer';

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );
	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' ) );

	mockPendingMutations[ 0 ].reject();

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'ignores additional color scheme changes while a save is pending', async () => {
	const user = userEvent.setup();
	mockPreferences = { [ PREFERENCE_KEY ]: 'light' };
	mockMutationMode = 'defer';

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );
	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' ) );

	await user.click( screen.getByRole( 'button', { name: 'System' } ) );

	expect( mockPendingMutations ).toHaveLength( 1 );
	expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'dark' );

	mockPendingMutations[ 0 ].resolve();

	await waitFor( () => {
		expect( mockOnSaveSuccess ).toHaveBeenCalledTimes( 1 );
		expect( mockOnSaveSuccess ).toHaveBeenCalledWith( 'dark', 'light' );
		expect(
			getMockQueryClient().getQueryData< Record< string, unknown > >( [ 'me', 'preferences' ] )
		).toMatchObject( {
			[ PREFERENCE_KEY ]: 'dark',
		} );
	} );
} );

test( 'runs the success callback after saving a user-initiated color scheme change', async () => {
	const user = userEvent.setup();
	mockPreferences = { [ PREFERENCE_KEY ]: 'light' };

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( mockOnSaveSuccess ).toHaveBeenCalledWith( 'dark', 'light' );
	} );
} );

test( 'does not run the success callback after a failed color scheme change', async () => {
	const user = userEvent.setup();
	mockPreferences = { [ PREFERENCE_KEY ]: 'light' };
	mockMutationMode = 'fail';

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Dark' } ) );

	await waitFor( () => {
		expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' );
		expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
	} );
} );

test( 'does not save when selecting the current color scheme', async () => {
	const user = userEvent.setup();
	mockPreferences = { [ PREFERENCE_KEY ]: 'light' };

	renderColorSchemeProvider();

	await waitFor( () => expect( screen.getByTestId( 'scheme' ) ).toHaveTextContent( 'light' ) );

	await user.click( screen.getByRole( 'button', { name: 'Light' } ) );

	expect( mockUpdatePreference ).not.toHaveBeenCalled();
	expect( mockOnSaveSuccess ).not.toHaveBeenCalled();
} );
