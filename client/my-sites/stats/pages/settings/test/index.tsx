/**
 * @vitest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import StatsSettingsPage from '..';

vi.mock( 'calypso/state', () => ( {
	useDispatch: () => vi.fn(),
	useSelector: ( selector: ( state: object ) => unknown ) => selector( {} ),
} ) );
vi.mock( 'calypso/state/ui/selectors', () => ( {
	getSelectedSiteId: () => 123,
	getSelectedSiteSlug: () => 'example.com',
} ) );
const mockRedirect = vi.fn();
vi.mock( '@automattic/calypso-router', () => ( {
	__esModule: true,
	default: { redirect: ( ...args: unknown[] ) => mockRedirect( ...args ) },
} ) );
let mockCanManage = true;
vi.mock( '../can-manage-stats-settings', () => ( {
	__esModule: true,
	default: () => mockCanManage,
} ) );
vi.mock( 'calypso/blocks/stats-navigation', () => ( { default: () => null } ) );
vi.mock( 'calypso/components/data/document-head', () => ( { default: () => null } ) );
vi.mock( '../../../stats-page-view-tracker', () => ( { default: () => null } ) );
const mockTrack = vi.fn();
vi.mock( '../../../utils', async () => ( {
	...( await vi.importActual< typeof import( '../../../utils' ) >( '../../../utils' ) ),
	trackStatsAnalyticsEvent: ( ...args: unknown[] ) => mockTrack( ...args ),
} ) );
vi.mock( 'calypso/my-sites/stats/components/stats-main', () => ( {
	default: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

const mockSave = vi.fn();
let mockSettings = {};
vi.mock( '../../../hooks/use-stats-settings', () => ( {
	useStatsSettingsQuery: () => ( {
		data: {
			settings: mockSettings,
			roles: [
				{ slug: 'administrator', name: 'Administrator' },
				{ slug: 'editor', name: 'Editor' },
			],
		},
		isError: false,
	} ),
	useStatsSettingsMutation: () => ( { mutate: mockSave } ),
} ) );

const section = ( heading: string ) => within( screen.getByRole( 'group', { name: heading } ) );

describe( 'StatsSettingsPage', () => {
	beforeEach( () => {
		mockSave.mockClear();
		mockTrack.mockClear();
		mockRedirect.mockClear();
		mockCanManage = true;
		mockSettings = {
			admin_bar: true,
			roles: [ 'administrator' ],
			count_roles: [ 'administrator' ],
		};
	} );

	it( 'adds a role to the counted views when its toggle turns on', async () => {
		render( <StatsSettingsPage /> );

		await userEvent.click( section( 'Logged-in views' ).getByLabelText( 'Editor' ) );

		expect( mockSave ).toHaveBeenCalledWith(
			{ count_roles: [ 'administrator', 'editor' ] },
			expect.anything()
		);
	} );

	it( 'removes a role from the counted views when its toggle turns off', async () => {
		render( <StatsSettingsPage /> );

		await userEvent.click( section( 'Logged-in views' ).getByLabelText( 'Administrator' ) );

		expect( mockSave ).toHaveBeenCalledWith( { count_roles: [] }, expect.anything() );
	} );

	it( 'records which role toggle changed and its new state', async () => {
		render( <StatsSettingsPage /> );

		await userEvent.click( section( 'Stats access' ).getByLabelText( 'Editor' ) );

		expect( mockTrack ).toHaveBeenCalledWith( 'stats_settings_changed', {
			blog_id: 123,
			setting: 'roles',
			enabled: true,
			role: 'editor',
		} );
	} );

	it( 'records the admin_bar setting turning off', async () => {
		render( <StatsSettingsPage /> );

		await userEvent.click(
			screen.getByLabelText( 'Put a chart showing 48 hours of views in the admin bar' )
		);

		expect( mockTrack ).toHaveBeenCalledWith( 'stats_settings_changed', {
			blog_id: 123,
			setting: 'admin_bar',
			enabled: false,
		} );
	} );

	it( 'keeps administrators able to view Stats', () => {
		mockSettings = { ...mockSettings, roles: [ 'editor' ] };
		render( <StatsSettingsPage /> );

		const toggle = section( 'Stats access' ).getByLabelText( 'Administrator' );

		expect( toggle ).toBeChecked();
		expect( toggle ).toBeDisabled();
	} );

	it( 'sends a user who cannot manage the settings to the Traffic page', () => {
		mockCanManage = false;

		render( <StatsSettingsPage /> );

		expect( mockRedirect ).toHaveBeenCalledWith( '/stats/day/example.com' );
	} );
} );
