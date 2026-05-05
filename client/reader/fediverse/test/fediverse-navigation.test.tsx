/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FediverseNavigation } from '../fediverse-navigation';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// Mock analytics — recordReaderTracksEvent must return a plain Redux action.
const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

// Mock useDispatch from calypso/state so Redux store is not required.
const mockDispatch = jest.fn( ( action ) => action );
jest.mock( 'calypso/state', () => ( {
	useDispatch: () => mockDispatch,
} ) );

// Mock i18n-calypso.
jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( str: string ) => str,
} ) );

// Mock SectionNav, NavTabs, NavItem to avoid pulling in @automattic/components.
jest.mock( 'calypso/components/section-nav', () => ( {
	__esModule: true,
	default: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
} ) );

jest.mock( 'calypso/components/section-nav/tabs', () => ( {
	__esModule: true,
	default: ( { children }: { children: React.ReactNode } ) => <ul role="menubar">{ children }</ul>,
} ) );

jest.mock( 'calypso/components/section-nav/item', () => ( {
	__esModule: true,
	default: ( {
		children,
		path,
		selected,
		onClick,
	}: {
		children: React.ReactNode;
		path?: string;
		selected?: boolean;
		onClick?: () => void;
	} ) => (
		<li role="menuitem" aria-current={ String( selected ) }>
			<a href={ path } onClick={ onClick }>
				{ children }
			</a>
		</li>
	),
} ) );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe( 'FediverseNavigation', () => {
	beforeEach( () => {
		mockRecordReaderTracksEvent.mockClear();
		mockDispatch.mockClear();
	} );

	it( 'renders three tabs and marks the selected one active', () => {
		render( <FediverseNavigation connectionId={ 42 } selectedTab="profile" /> );

		expect( screen.getByRole( 'menuitem', { name: /timeline/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /profile/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /settings/i } ) ).toBeVisible();

		expect( screen.getByRole( 'menuitem', { name: /profile/i } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect( screen.getByRole( 'menuitem', { name: /timeline/i } ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
	} );

	it( 'links each tab to its route', () => {
		render( <FediverseNavigation connectionId={ 42 } selectedTab="timeline" /> );

		expect(
			screen.getByRole( 'menuitem', { name: /timeline/i } ).querySelector( 'a' )
		).toHaveAttribute( 'href', '/reader/fediverse/42/timeline' );
		expect(
			screen.getByRole( 'menuitem', { name: /profile/i } ).querySelector( 'a' )
		).toHaveAttribute( 'href', '/reader/fediverse/42/profile' );
		expect(
			screen.getByRole( 'menuitem', { name: /settings/i } ).querySelector( 'a' )
		).toHaveAttribute( 'href', '/reader/fediverse/42/settings' );
	} );

	it( 'dispatches a tracks event when a tab is clicked', async () => {
		const user = userEvent.setup();
		render( <FediverseNavigation connectionId={ 42 } selectedTab="timeline" /> );

		await user.click( screen.getByRole( 'menuitem', { name: /profile/i } ).querySelector( 'a' )! );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_fediverse_tab_clicked',
			{ connection_id: 42, tab: 'profile' }
		);
	} );
} );
