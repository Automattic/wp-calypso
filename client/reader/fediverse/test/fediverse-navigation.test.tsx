/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediverseNavigation } from '../fediverse-navigation';

describe( 'FediverseNavigation', () => {
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
		// recordReaderTracksEvent is a thunk reading the follows query cache.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );
	afterEach( () => jest.restoreAllMocks() );

	it( 'renders the Timeline, Notifications, and Profile tabs with paths scoped to the connection id', () => {
		renderWithProvider( <FediverseNavigation connectionId={ 7 } selectedTab="timeline" /> );

		const timeline = screen.getByRole( 'menuitem', { name: 'Timeline' } );
		const notifications = screen.getByRole( 'menuitem', { name: 'Notifications' } );
		const profile = screen.getByRole( 'menuitem', { name: 'Profile' } );

		expect( timeline ).toHaveAttribute( 'href', '/reader/fediverse/7/timeline' );
		expect( notifications ).toHaveAttribute( 'href', '/reader/fediverse/7/notifications' );
		expect( profile ).toHaveAttribute( 'href', '/reader/fediverse/7/profile' );
		// Settings tab was removed alongside the Mastodon / ATmosphere drop —
		// no dead nav item leaks through.
		expect( screen.queryByRole( 'menuitem', { name: 'Settings' } ) ).not.toBeInTheDocument();
	} );

	it( 'marks the selected tab as the active item', () => {
		renderWithProvider( <FediverseNavigation connectionId={ 7 } selectedTab="profile" /> );

		// Calypso's NavItem stamps `aria-current="true"` on the active tab.
		expect( screen.getByRole( 'menuitem', { name: 'Profile' } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Timeline' } ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
	} );
} );
