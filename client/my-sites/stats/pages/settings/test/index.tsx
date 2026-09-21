/**
 * @jest-environment jsdom
 */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatsSettingsPage from '..';

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

const mockSave = jest.fn();
let mockSettings = {};
jest.mock( '../../../hooks/use-stats-settings', () => ( {
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

const section = ( heading: string ) =>
	within(
		screen
			.getByRole( 'heading', { name: heading } )
			.closest( '.stats-settings__section' ) as HTMLElement
	);

describe( 'StatsSettingsPage', () => {
	beforeEach( () => {
		mockSave.mockClear();
		mockSettings = {
			admin_bar: true,
			roles: [ 'administrator' ],
			count_roles: [ 'administrator' ],
			wpcom_reader_views_enabled: true,
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

	it( 'keeps administrators able to view Stats', () => {
		mockSettings = { ...mockSettings, roles: [ 'editor' ] };
		render( <StatsSettingsPage /> );

		const toggle = section( 'Stats access' ).getByLabelText( 'Administrator' );

		expect( toggle ).toBeChecked();
		expect( toggle ).toBeDisabled();
	} );
} );
