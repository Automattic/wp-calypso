/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsSettingsPage from '..';
import reloadPage from '../reload-page';

const mockGet = jest.fn();
const mockPost = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: {
		req: {
			get: ( ...args: unknown[] ) => mockGet( ...args ),
			post: ( ...args: unknown[] ) => mockPost( ...args ),
		},
	},
} ) );
const mockDispatch = jest.fn();
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 123,
	getSelectedSiteSlug: () => 'example.com',
} ) );
jest.mock( '../reload-page', () => ( { __esModule: true, default: jest.fn() } ) );
jest.mock( '../../../hooks/default-query-params', () => ( {
	__esModule: true,
	default: () => ( { retry: false } ),
} ) );
jest.mock( '../can-manage-stats-settings', () => ( { __esModule: true, default: () => true } ) );
jest.mock( 'calypso/blocks/stats-navigation', () => () => null );
jest.mock( 'calypso/components/data/document-head', () => () => null );
jest.mock( '../../../stats-page-view-tracker', () => () => null );
jest.mock(
	'calypso/my-sites/stats/components/stats-main',
	() =>
		( { children }: { children: React.ReactNode } ) => <div>{ children }</div>
);

const settingsResponse = {
	settings: {
		admin_bar: true,
		roles: [ 'administrator' ],
		count_roles: [ 'administrator' ],
		wpcom_reader_views_enabled: true,
	},
	roles: [
		{ slug: 'administrator', name: 'Administrator' },
		{ slug: 'editor', name: 'Editor' },
	],
};

const SAVED_NOTICE = expect.objectContaining( {
	notice: expect.objectContaining( { text: 'Settings saved.' } ),
} );

const LOAD_ERROR = 'Your Stats settings could not be loaded. Reload the page to try again.';
const SETTINGS_REQUEST = { apiNamespace: 'wpcom/v2', path: '/sites/123/jetpack-stats/settings' };

const mountPage = () => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );
	const result = render(
		<QueryClientProvider client={ queryClient }>
			<StatsSettingsPage />
		</QueryClientProvider>
	);
	return { ...result, queryClient };
};

const renderPage = async () => {
	const mounted = mountPage();
	await screen.findByRole( 'group', { name: 'Logged-in views' } );
	return mounted;
};

const adminBarToggle = () =>
	screen.getByLabelText( 'Put a chart showing 48 hours of views in the admin bar' );

const saveAdminBarAndReload = async () => {
	mockPost.mockResolvedValue( settingsResponse );
	const { unmount } = await renderPage();
	await userEvent.click( adminBarToggle() );
	await waitFor( () => expect( reloadPage ).toHaveBeenCalled() );
	unmount();
};

const countedViewsToggle = ( role: string ) =>
	within( screen.getByRole( 'group', { name: 'Logged-in views' } ) ).getByLabelText( role );

describe( 'StatsSettingsPage saving', () => {
	beforeEach( () => {
		mockGet.mockReset().mockResolvedValue( settingsResponse );
		mockPost.mockReset();
		mockDispatch.mockReset();
		( reloadPage as jest.Mock ).mockReset();
		window.sessionStorage.clear();
	} );

	it( 'keeps every toggle disabled until the running save finishes', async () => {
		let finishSave: ( value: unknown ) => void = () => {};
		mockPost.mockReturnValue( new Promise( ( resolve ) => ( finishSave = resolve ) ) );
		await renderPage();

		await userEvent.click( countedViewsToggle( 'Editor' ) );

		await waitFor( () => expect( countedViewsToggle( 'Administrator' ) ).toBeDisabled() );
		expect( screen.getByLabelText( 'Show post views for this site.' ) ).toBeDisabled();

		finishSave( {
			...settingsResponse,
			settings: { ...settingsResponse.settings, count_roles: [ 'administrator', 'editor' ] },
		} );

		await waitFor( () => expect( countedViewsToggle( 'Administrator' ) ).toBeEnabled() );
	} );

	it( 'puts the old value back when the site refuses a save', async () => {
		let refuseSave: ( reason: unknown ) => void = () => {};
		mockPost.mockReturnValue( new Promise( ( _resolve, reject ) => ( refuseSave = reject ) ) );
		await renderPage();

		await userEvent.click( countedViewsToggle( 'Editor' ) );
		await waitFor( () => expect( countedViewsToggle( 'Editor' ) ).toBeChecked() );

		refuseSave( new Error( 'refused' ) );

		await waitFor( () => expect( countedViewsToggle( 'Editor' ) ).not.toBeChecked() );
	} );

	it( 'reloads the page once the admin bar setting is saved', async () => {
		let finishSave: ( value: unknown ) => void = () => {};
		mockPost.mockReturnValue( new Promise( ( resolve ) => ( finishSave = resolve ) ) );
		await renderPage();

		await userEvent.click( adminBarToggle() );
		await waitFor( () => expect( adminBarToggle() ).toBeDisabled() );
		expect( reloadPage ).not.toHaveBeenCalled();

		finishSave( settingsResponse );

		await waitFor( () => expect( reloadPage ).toHaveBeenCalledTimes( 1 ) );
	} );

	it( 'saves the other settings without reloading the page', async () => {
		mockPost.mockResolvedValue( settingsResponse );
		await renderPage();

		await userEvent.click( screen.getByLabelText( 'Show post views for this site.' ) );

		await waitFor( () => expect( mockDispatch ).toHaveBeenCalledWith( SAVED_NOTICE ) );
		expect( reloadPage ).not.toHaveBeenCalled();
	} );

	it( 'shows the saved notice on the page load after an admin bar save', async () => {
		await saveAdminBarAndReload();
		mockDispatch.mockReset();

		await renderPage();

		expect( mockDispatch ).toHaveBeenCalledWith( SAVED_NOTICE );
	} );

	it( 'shows that saved notice on one page load only', async () => {
		await saveAdminBarAndReload();
		const { unmount } = await renderPage();
		unmount();
		mockDispatch.mockReset();

		await renderPage();

		expect( mockDispatch ).not.toHaveBeenCalledWith( SAVED_NOTICE );
	} );

	it( 'keeps every toggle disabled after an admin bar save while the page reloads', async () => {
		mockPost.mockResolvedValue( settingsResponse );
		const { queryClient } = await renderPage();

		await userEvent.click( adminBarToggle() );
		await waitFor( () => expect( reloadPage ).toHaveBeenCalled() );
		await waitFor( () => expect( queryClient.isMutating() ).toBe( 0 ) );

		expect( screen.getByLabelText( 'Show post views for this site.' ) ).toBeDisabled();
	} );

	it( 'shows the reason the site gives when it refuses a save', async () => {
		mockPost.mockRejectedValue(
			Object.assign( new Error( 'Unknown role `ghost` in `roles`.' ), {
				code: 'jetpack_stats_invalid_role',
			} )
		);
		await renderPage();

		await userEvent.click( countedViewsToggle( 'Editor' ) );

		await waitFor( () =>
			expect( mockDispatch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					notice: expect.objectContaining( {
						status: 'is-error',
						text: 'Your Stats settings could not be saved: Unknown role `ghost` in `roles`.',
					} ),
				} )
			)
		);
	} );

	it( 'shows the load error when the settings cannot be read', async () => {
		mockGet.mockReset().mockRejectedValue( new Error( 'down' ) );

		mountPage();

		expect( await screen.findByText( LOAD_ERROR ) ).toBeInTheDocument();
	} );

	it( 'keeps the form without a load error when a later read of the settings fails', async () => {
		const { queryClient } = await renderPage();
		mockGet.mockRejectedValue( new Error( 'down' ) );

		await act( () => queryClient.refetchQueries() );
		// Query observers hear about the failed read on a later timer tick.
		await act( () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) ) );

		expect( queryClient.getQueryCache().getAll()[ 0 ].state.status ).toBe( 'error' );
		expect( screen.queryByText( LOAD_ERROR ) ).not.toBeInTheDocument();
		expect( adminBarToggle() ).toBeInTheDocument();
	} );

	it( 'ignores a saved notice request older than 30 seconds', async () => {
		await saveAdminBarAndReload();
		const later = jest.spyOn( Date, 'now' ).mockReturnValue( Date.now() + 31 * 1000 );
		mockDispatch.mockReset();

		try {
			await renderPage();

			expect( mockDispatch ).not.toHaveBeenCalledWith( SAVED_NOTICE );
		} finally {
			later.mockRestore();
		}
	} );

	it( 'reads and saves the settings through the site settings route', async () => {
		mockPost.mockResolvedValue( settingsResponse );
		await renderPage();

		await userEvent.click( screen.getByLabelText( 'Show post views for this site.' ) );

		await waitFor( () =>
			expect( mockPost ).toHaveBeenCalledWith( {
				...SETTINGS_REQUEST,
				body: { wpcom_reader_views_enabled: false },
			} )
		);
		expect( mockGet ).toHaveBeenCalledWith( SETTINGS_REQUEST );
	} );
} );
