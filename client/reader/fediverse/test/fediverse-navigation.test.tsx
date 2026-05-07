/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import * as analytics from 'calypso/state/reader/analytics/actions';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import { FediverseNavigation } from '../fediverse-navigation';

describe( 'FediverseNavigation', () => {
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

		const profile = screen.getByRole( 'menuitem', { name: 'Profile' } );
		// Calypso's NavItem applies `is-selected` to the active item.
		expect( profile.className ).toMatch( /is-selected/ );
	} );
} );
