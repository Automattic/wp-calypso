/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsSettingsPage from '..';

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
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => jest.fn(),
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
jest.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 123,
	getSelectedSiteSlug: () => 'example.com',
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

const renderPage = async () => {
	const queryClient = new QueryClient( {
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	} );
	render(
		<QueryClientProvider client={ queryClient }>
			<StatsSettingsPage />
		</QueryClientProvider>
	);
	await screen.findByRole( 'heading', { name: 'Logged-in views' } );
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
} );
