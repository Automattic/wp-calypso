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
	let resizeCallbacks;

	// jsdom has no layout and no ResizeObserver, so fake both.
	function setContainerHeight( height ) {
		Object.defineProperty( screen.getByTestId( 'blackbox-container' ), 'offsetHeight', {
			configurable: true,
			value: height,
		} );
		resizeCallbacks.forEach( ( callback ) => callback() );
	}

	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		window.Blackbox = {
			configure: jest.fn(),
		};
		resizeCallbacks = new Set();
		window.ResizeObserver = class {
			constructor( callback ) {
				this.callback = callback;
				resizeCallbacks.add( callback );
			}
			observe() {}
			disconnect() {
				resizeCallbacks.delete( this.callback );
			}
		};
	} );

	afterEach( () => {
		jest.useRealTimers();
		delete window.Blackbox;
		delete window.ResizeObserver;
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

	test( 'tracks the rendered challenge widget by measuring the container', async () => {
		render( <TestComponent /> );

		await act( async () => {} );
		act( () => jest.advanceTimersByTime( 500 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );

		act( () => setContainerHeight( 46 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/content' );

		act( () => setContainerHeight( 0 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'keeps tracking the widget after a solve, since the SDK leaves it mounted', async () => {
		let callbacks;
		window.Blackbox.configure.mockImplementationOnce( ( config ) => {
			callbacks = config;
		} );

		render( <TestComponent /> );

		await act( async () => {} );
		act( () => callbacks.onChallengeStart() );
		act( () => setContainerHeight( 46 ) );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/active/content' );

		act( () => callbacks.onChallengeComplete() );

		expect( screen.getByTestId( 'blackbox-state' ) ).toHaveTextContent( 'ready/inactive/content' );
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
