/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues

import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { PlaygroundError } from '../components/playground-error';
import { BlueprintLoadError } from '../lib/blueprint-load-error';
import { PlaygroundNotFoundError } from '../lib/playground-not-found-error';

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

const notFoundError = new PlaygroundNotFoundError( 'invalid-id', new Error( 'boot failed' ) );
const blueprintError = new BlueprintLoadError(
	'https://example.com/blueprint.json',
	new Error( 'Not Found' )
);

const renderError = ( error, props = {} ) =>
	render(
		<PlaygroundError
			error={ error }
			createNewPlayground={ jest.fn() }
			retry={ jest.fn() }
			{ ...props }
		/>
	);

describe( 'PlaygroundError', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'playground not found', () => {
		it( 'should display error message with the invalid playground ID', () => {
			renderError( notFoundError );

			// Verify the error message is shown with the invalid ID
			expect( screen.getByText( 'Playground Not Found' ) ).toBeInTheDocument();
			expect(
				screen.getByText( /The playground you are trying to access \(ID: invalid-id\)/ )
			).toBeInTheDocument();
		} );

		it( 'should display countdown message', () => {
			renderError( notFoundError );

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

			renderError( notFoundError, { createNewPlayground: mockCreateNewPlayground } );

			// The effect should have called createNewPlayground when countdown became 0
			expect( mockCreateNewPlayground ).toHaveBeenCalled();
		} );
	} );

	describe( 'blueprint not found', () => {
		it( 'should display the blueprint URL and not auto-create a playground', () => {
			const mockCreateNewPlayground = jest.fn();
			renderError( blueprintError, { createNewPlayground: mockCreateNewPlayground } );

			expect( screen.getByText( 'Blueprint Not Found' ) ).toBeInTheDocument();
			expect(
				screen.getByText( /The blueprint at https:\/\/example.com\/blueprint.json/ )
			).toBeInTheDocument();
			expect( screen.queryByText( /Creating new playground/ ) ).not.toBeInTheDocument();
			expect( mockCreateNewPlayground ).not.toHaveBeenCalled();
		} );

		it( 'should call createNewPlayground when the button is clicked', () => {
			const mockCreateNewPlayground = jest.fn();
			renderError( blueprintError, { createNewPlayground: mockCreateNewPlayground } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Start a new playground' } ) );

			expect( mockCreateNewPlayground ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'unknown error', () => {
		it( 'should offer to retry', () => {
			const mockRetry = jest.fn();
			renderError( new Error( 'network down' ), { retry: mockRetry } );

			expect( screen.getByText( 'Something went wrong' ) ).toBeInTheDocument();

			fireEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );

			expect( mockRetry ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
