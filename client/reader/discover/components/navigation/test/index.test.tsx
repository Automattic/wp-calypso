/**
 * @jest-environment jsdom
 */

import { screen } from '@testing-library/react';
import { isDiscoverV3Enabled } from 'calypso/reader/utils';
import { renderWithProvider } from 'calypso/test-helpers/testing-library';
import DiscoverNavigation from '../index';

jest.mock( 'calypso/reader/utils', () => ( {
	...jest.requireActual( 'calypso/reader/utils' ),
	isDiscoverV3Enabled: jest.fn().mockReturnValue( false ),
} ) );

describe( 'DiscoverNavigation', () => {
	it( 'shows the navigation tabs', () => {
		( isDiscoverV3Enabled as jest.Mock ).mockReturnValue( true );

		renderWithProvider( <DiscoverNavigation selectedTab="freshly-pressed" />, {
			initialState: {
				currentUser: {
					id: 1,
				},
			},
		} );

		const links = screen.getAllByRole( 'menuitem' );
		expect( links ).toHaveLength( 5 );
		expect( screen.getByRole( 'menuitem', { name: 'Freshly Pressed' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Recommended' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'First posts' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Tags' } ) ).toBeVisible();
		expect( screen.getByRole( 'menuitem', { name: 'Latest' } ) ).toBeVisible();

		expect( screen.queryByRole( 'menuitem', { name: 'Add new' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'menuitem', { name: 'Reddit' } ) ).not.toBeInTheDocument();
	} );

	describe( 'when the feature discover v3 is disabled', () => {
		beforeEach( () => {
			( isDiscoverV3Enabled as jest.Mock ).mockReturnValue( false );
		} );

		it( 'shows the navigation tabs', () => {
			renderWithProvider( <DiscoverNavigation selectedTab="freshly-pressed" />, {
				initialState: {
					currentUser: {
						id: 1,
					},
				},
			} );

			const links = screen.getAllByRole( 'menuitem' );
			expect( links ).toHaveLength( 7 );
			expect( screen.getByRole( 'menuitem', { name: 'Freshly Pressed' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Recommended' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'First posts' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Tags' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Latest' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Reddit' } ) ).toBeVisible();
			expect( screen.getByRole( 'menuitem', { name: 'Add new' } ) ).toBeVisible();
		} );
	} );
} );
