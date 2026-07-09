/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { SpaceNavigation } from '../space-navigation';

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

const SPACE_SLUG = 'work';

describe( 'SpaceNavigation', () => {
	// NavTabs uses IntersectionObserver which jsdom does not provide.
	beforeAll( () => {
		global.IntersectionObserver = class IntersectionObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof global.IntersectionObserver;
	} );

	afterAll( () => {
		// @ts-expect-error -- cleaning up the stub
		delete global.IntersectionObserver;
	} );

	beforeEach( () => {
		mockRecordReaderTracksEvent.mockClear();
	} );

	it( 'renders the Feed and Discover tabs and marks the selected one active', () => {
		renderWithProvider( <SpaceNavigation spaceSlug={ SPACE_SLUG } selectedTab="discover" /> );

		expect( screen.getByRole( 'menuitem', { name: /feed/i } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: /discover/i } ) ).toBeVisible();

		expect( screen.getByRole( 'menuitem', { name: /discover/i } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect( screen.getByRole( 'menuitem', { name: /feed/i } ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
	} );

	it( 'links Feed to the base path and Discover to its suffix', () => {
		renderWithProvider( <SpaceNavigation spaceSlug={ SPACE_SLUG } selectedTab="feed" /> );

		expect( screen.getByRole( 'menuitem', { name: /feed/i } ) ).toHaveAttribute(
			'href',
			`/reader/spaces/${ SPACE_SLUG }`
		);
		expect( screen.getByRole( 'menuitem', { name: /discover/i } ) ).toHaveAttribute(
			'href',
			`/reader/spaces/${ SPACE_SLUG }/discover`
		);
	} );

	it( 'records a tracks event when a tab is clicked', async () => {
		const user = userEvent.setup();
		renderWithProvider( <SpaceNavigation spaceSlug={ SPACE_SLUG } selectedTab="feed" /> );

		await user.click( screen.getByRole( 'menuitem', { name: /discover/i } ) );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_spaces_tab_clicked',
			{ tab: 'discover' }
		);
	} );
} );
