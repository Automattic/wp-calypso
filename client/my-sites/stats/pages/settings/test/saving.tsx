/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
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

const renderPage = async () => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );
	const result = render(
		<QueryClientProvider client={ queryClient }>
			<StatsSettingsPage />
		</QueryClientProvider>
	);
	await screen.findByRole( 'heading', { name: 'Logged-in views' } );
	return result;
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
	within(
		screen
			.getByRole( 'heading', { name: 'Logged-in views' } )
			.closest( '.stats-settings__section' ) as HTMLElement
	).getByLabelText( role );

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
} );
