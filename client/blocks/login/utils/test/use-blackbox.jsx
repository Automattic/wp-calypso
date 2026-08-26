/**
 * @jest-environment jsdom
 */

import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { loadBlackboxSdk } from '../blackbox-sdk';
import { useBlackbox } from '../use-blackbox';

jest.mock( '../blackbox-sdk', () => ( {
	getBlackboxApiKey: jest.fn( () => 'test-api-key' ),
	loadBlackboxSdk: jest.fn( () => Promise.resolve() ),
} ) );

function TestComponent( { enabled = true } ) {
	const containerRef = useRef( null );
	const { hasChallengeContent, isChallengeActive, isLoading } = useBlackbox( {
		containerRef,
		enabled,
	} );

	return (
		<>
			<div ref={ containerRef } data-testid="blackbox-container" />
			<div data-testid="blackbox-state">
				{ `${ isLoading ? 'loading' : 'ready' }/${ isChallengeActive ? 'active' : 'inactive' }/${
					hasChallengeContent ? 'content' : 'empty'
				}` }
			</div>
		</>
	);
}

describe( 'useBlackbox', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		window.Blackbox = {
			configure: jest.fn(),
		};
	} );

	afterEach( () => {
		jest.useRealTimers();
		delete window.Blackbox;
	} );

	test( 'keeps Blackbox loading until configure has had time to settle', async () => {
		render( <TestComponent /> );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'loading/inactive/empty' );

		await act( async () => {} );

		expect( loadBlackboxSdk ).toHaveBeenCalled();
		expect( window.Blackbox.configure ).toHaveBeenCalled();
		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'loading/inactive/empty' );

		act( () => jest.advanceTimersByTime( 500 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'keeps Blackbox loading when completion fires before a challenge starts', async () => {
		let callbacks;
		window.Blackbox.configure.mockImplementationOnce( ( config ) => {
			callbacks = config;
		} );

		render( <TestComponent /> );

		await act( async () => {} );
		act( () => callbacks.onChallengeComplete() );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'loading/inactive/empty' );

		act( () => jest.advanceTimersByTime( 500 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'marks Blackbox ready but active when a challenge starts', async () => {
		let callbacks;
		window.Blackbox.configure.mockImplementationOnce( ( config ) => {
			callbacks = config;
		} );

		render( <TestComponent /> );

		await act( async () => {} );
		act( () => callbacks.onChallengeStart() );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/active/empty' );

		act( () => callbacks.onChallengeComplete() );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'stops blocking when the SDK cannot present a challenge it announced', async () => {
		let callbacks;
		window.Blackbox.configure.mockImplementationOnce( ( config ) => {
			callbacks = config;
		} );

		render( <TestComponent /> );

		await act( async () => {} );
		act( () => callbacks.onChallengeStart() );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/active/empty' );

		act( () => callbacks.onError( { method: 'challenge' } ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'keeps blocking on errors unrelated to presenting the challenge', async () => {
		let callbacks;
		window.Blackbox.configure.mockImplementationOnce( ( config ) => {
			callbacks = config;
		} );

		render( <TestComponent /> );

		await act( async () => {} );
		act( () => callbacks.onChallengeStart() );
		act( () => callbacks.onError( { method: 'collect' } ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/active/empty' );
	} );

	test( 'tracks challenge container content as a blocking signal', async () => {
		let callbacks;
		window.Blackbox.configure.mockImplementationOnce( ( config ) => {
			callbacks = config;
		} );

		render( <TestComponent /> );

		await act( async () => {} );
		act( () => jest.advanceTimersByTime( 500 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );

		await act( async () => {
			screen.getByTestId( 'blackbox-container' ).appendChild( document.createElement( 'iframe' ) );
		} );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/content' );

		act( () => callbacks.onChallengeComplete() );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'does not load the SDK while disabled', async () => {
		render( <TestComponent enabled={ false } /> );

		await act( async () => {} );

		expect( loadBlackboxSdk ).not.toHaveBeenCalled();
		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'starts loading and configures when enabled after mount', async () => {
		const { rerender } = render( <TestComponent enabled={ false } /> );

		await act( async () => {} );
		rerender( <TestComponent enabled /> );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'loading/inactive/empty' );

		await act( async () => {} );

		expect( window.Blackbox.configure ).toHaveBeenCalled();

		act( () => jest.advanceTimersByTime( 500 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'clears blocking state when disabled mid-challenge', async () => {
		let callbacks;
		window.Blackbox.configure.mockImplementationOnce( ( config ) => {
			callbacks = config;
		} );

		const { rerender } = render( <TestComponent /> );

		await act( async () => {} );
		act( () => callbacks.onChallengeStart() );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/active/empty' );

		rerender( <TestComponent enabled={ false } /> );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );
} );
