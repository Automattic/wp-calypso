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
		// recordReaderTracksEvent is a thunk reading state.reader.follows.
		jest
			.spyOn( analytics, 'recordReaderTracksEvent' )
			.mockImplementation( () => ( { type: '@@TEST/NOOP' } ) as never );
	} );
	afterEach( () => jest.restoreAllMocks() );

	it( 'renders the three top-level tabs with paths scoped to the connection id', () => {
		renderWithProvider( <FediverseNavigation connectionId={ 7 } selectedTab="timeline" /> );

		const posts = screen.getByRole( 'menuitem', { name: 'Posts' } );
		const profile = screen.getByRole( 'menuitem', { name: 'Profile' } );
		const settings = screen.getByRole( 'menuitem', { name: 'Settings' } );

		expect( posts ).toHaveAttribute( 'href', '/reader/fediverse/7/timeline' );
		expect( profile ).toHaveAttribute( 'href', '/reader/fediverse/7/profile' );
		expect( settings ).toHaveAttribute( 'href', '/reader/fediverse/7/settings' );
	} );

	it( 'marks the selected tab as the active item', () => {
		renderWithProvider( <FediverseNavigation connectionId={ 7 } selectedTab="profile" /> );

		// Calypso's NavItem stamps `aria-current="true"` on the active tab.
		expect( screen.getByRole( 'menuitem', { name: 'Profile' } ) ).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect( screen.getByRole( 'menuitem', { name: 'Posts' } ) ).toHaveAttribute(
			'aria-current',
			'false'
		);
	} );
} );
