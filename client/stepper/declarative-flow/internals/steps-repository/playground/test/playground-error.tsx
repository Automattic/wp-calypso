/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { render, screen } from '@testing-library/react';
import React from 'react';
import { PlaygroundError } from '../components/playground-error';

// Mock the React Router hooks
const mockSearchParams = {
	get: jest.fn().mockReturnValue( 'invalid-id' ),
};

jest.mock( 'react-router-dom', () => ( {
	useSearchParams: () => [ mockSearchParams ],
} ) );

// Mock the useEffect and setTimeout
const originalSetTimeout = global.setTimeout;
global.setTimeout = jest.fn().mockImplementation( ( cb ) => {
	// Execute the callback immediately for testing purposes
	return originalSetTimeout( cb, 0 );
} );

// Restore original setTimeout after tests
afterAll( () => {
	global.setTimeout = originalSetTimeout;
} );

describe( 'PlaygroundError', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should display error message with the invalid playground ID', () => {
		const mockCreateNewPlayground = jest.fn();
		render( <PlaygroundError createNewPlayground={ mockCreateNewPlayground } /> );

		// Verify the error message is shown with the invalid ID
		expect( screen.getByText( 'Playground Not Found' ) ).toBeInTheDocument();
		expect(
			screen.getByText( /The playground you are trying to access \(ID: invalid-id\)/ )
		).toBeInTheDocument();
	} );

	it( 'should display countdown message', () => {
		const mockCreateNewPlayground = jest.fn();
		render( <PlaygroundError createNewPlayground={ mockCreateNewPlayground } /> );

		// Verify countdown message is displayed
		expect( screen.getByText( /Creating new playground/ ) ).toBeInTheDocument();
	} );

	it( 'should call createNewPlayground when countdown reaches zero', () => {
		// Create a special version of setTimeout that triggers the callback immediately
		const mockCreateNewPlayground = jest.fn();

		// Mock the setState to immediately set countdown to 0
		jest.spyOn( React, 'useState' ).mockImplementation( ( initialState ) => {
			if ( initialState === 5 ) {
				// When countdown is initialized, immediately return 0 to trigger the effect
				return [ 0, jest.fn() ];
			}
			return [ initialState, jest.fn() ];
		} );

		render( <PlaygroundError createNewPlayground={ mockCreateNewPlayground } /> );

		// The effect should have called createNewPlayground when countdown became 0
		expect( mockCreateNewPlayground ).toHaveBeenCalled();
	} );
} );
