/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { MastodonNavigation } from '../mastodon-navigation';

const mockRecordReaderTracksEvent: jest.Mock = jest.fn( () => ( {
	type: 'TEST_TRACKS_EVENT',
} ) );

jest.mock( 'calypso/state/reader/analytics/actions', () => ( {
	recordReaderTracksEvent: ( ...args: unknown[] ) => mockRecordReaderTracksEvent( ...args ),
} ) );

describe( 'MastodonNavigation', () => {
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

	it( 'renders three tabs and marks the selected one active', () => {
		renderWithProvider( <MastodonNavigation connectionId={ 42 } selectedTab="profile" /> );

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
		renderWithProvider( <MastodonNavigation connectionId={ 42 } selectedTab="timeline" /> );

		expect( screen.getByRole( 'menuitem', { name: /timeline/i } ) ).toHaveAttribute(
			'href',
			'/reader/mastodon/42/timeline'
		);
		expect( screen.getByRole( 'menuitem', { name: /profile/i } ) ).toHaveAttribute(
			'href',
			'/reader/mastodon/42/profile'
		);
		expect( screen.getByRole( 'menuitem', { name: /settings/i } ) ).toHaveAttribute(
			'href',
			'/reader/mastodon/42/settings'
		);
	} );

	it( 'records a tracks event when a tab is clicked', async () => {
		const user = userEvent.setup();
		renderWithProvider( <MastodonNavigation connectionId={ 42 } selectedTab="timeline" /> );

		await user.click( screen.getByRole( 'menuitem', { name: /profile/i } ) );

		expect( mockRecordReaderTracksEvent ).toHaveBeenCalledWith(
			'calypso_reader_mastodon_tab_clicked',
			{ connection_id: 42, tab: 'profile' }
		);
	} );
} );
