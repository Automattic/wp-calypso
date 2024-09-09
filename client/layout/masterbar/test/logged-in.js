/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React from 'react';
import commandPaletteReducer from 'calypso/state/command-palette/reducers';
import preferencesReducer from 'calypso/state/preferences/reducer';
import { getSiteUrl } from 'calypso/state/sites/selectors';
import uiReducer from 'calypso/state/ui/reducer';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import MasterbarLoggedIn from '../logged-in';

jest.mock( 'calypso/state/sites/selectors' );
jest.mock( 'calypso/state/sites/plans/selectors', () => ( {
	getSitePlanSlug: jest.fn().mockImplementation( () => 'business-bundle' ),
} ) );

function renderWithState( ui ) {
	return renderWithProvider( ui, {
		reducers: {
			ui: uiReducer,
			preferences: preferencesReducer,
			commandPalette: commandPaletteReducer,
		},
		initialState: {
			currentUser: {
				user: {
					display_name: 'John Doe',
				},
			},
		},
	} );
}

test( 'edit profile menu link goes to /me when the user has no site', () => {
	renderWithState( <MasterbarLoggedIn /> );

	expect( screen.getByRole( 'link', { name: 'John Doe Edit Profile' } ) ).toHaveAttribute(
		'href',
		'/me'
	);
} );

test( 'edit profile menu link goes to /site/wp-admin/profile.php when the user has a site', () => {
	getSiteUrl.mockReturnValue( 'example.com' );

	renderWithState( <MasterbarLoggedIn /> );

	expect( screen.getByRole( 'link', { name: 'John Doe Edit Profile' } ) ).toHaveAttribute(
		'href',
		'example.com/wp-admin/profile.php'
	);
} );
