/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { createBlackboxInstance } from '../__mocks__/blackbox-instance';
import { loadBlackboxSdk } from '../blackbox-sdk';
import { getBlackboxSessionId } from '../get-blackbox-session-id';
import { useBlackbox } from '../use-blackbox';

jest.mock( '../blackbox-sdk', () => ( {
	loadBlackboxSdk: jest.fn( () => Promise.resolve() ),
} ) );

function TestComponent( { enabled = true, apiKey = 'test-api-key' } ) {
	const containerRef = useRef( null );
	const { hasChallengeContent, isChallengeActive, isLoading } = useBlackbox( {
		containerRef,
		enabled,
		apiKey,
	} );
	return (
		<>
			<div ref={ containerRef } data-testid="container" />
			<div data-testid="state">{ `${ isLoading ? 'loading' : 'ready' }/${
				isChallengeActive ? 'active' : 'inactive'
			}/${ hasChallengeContent ? 'content' : 'empty' }` }</div>
		</>
	);
}

describe( 'useBlackbox', () => {
	let sdk;
	let resize;
	beforeEach( () => {
		jest.useFakeTimers();
		loadBlackboxSdk.mockReset().mockResolvedValue( undefined );
		sdk = createBlackboxInstance();
		window.Blackbox = sdk.api;
		window.ResizeObserver = class {
			constructor( callback ) {
				resize = callback;
			}
			observe() {}
			disconnect() {}
		};
	} );
	afterEach( () => {
		jest.useRealTimers();
		delete window.Blackbox;
		delete window.ResizeObserver;
	} );

	test( 'uses ready state immediately after SDK loading', async () => {
		render( <TestComponent /> );
		await act( async () => {} );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'observes challenges and failures without callbacks', async () => {
		render( <TestComponent /> );
		await act( async () => {} );
		act( () => sdk.setState( { status: 'challenge', sessionId: 'sid' } ) );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/active/empty' );
		act( () => sdk.setState( { status: 'ready', sessionId: 'sid' } ) );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test( 'limits loading without hiding a later challenge', async () => {
		sdk.setState( { status: 'loading' } );
		render( <TestComponent /> );
		await act( async () => {} );
		act( () => jest.advanceTimersByTime( 4999 ) );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'loading/inactive' );
		act( () => jest.advanceTimersByTime( 1 ) );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/inactive' );
		act( () => sdk.setState( { status: 'challenge', sessionId: 'sid' } ) );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/active' );
	} );

	test( 'observes an SDK that arrives after the loading deadline', async () => {
		let loaded;
		loadBlackboxSdk.mockReturnValue(
			new Promise( ( resolve ) => {
				loaded = resolve;
			} )
		);
		delete window.Blackbox;
		render( <TestComponent /> );
		act( () => jest.advanceTimersByTime( 5000 ) );
		window.Blackbox = sdk.api;
		await act( async () => loaded() );
		act( () => sdk.setState( { status: 'challenge', sessionId: 'sid' } ) );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/active' );
	} );

	test( 'retains spacing after the SDK reports challenge completion', async () => {
		render( <TestComponent /> );
		await act( async () => {} );
		act( () => {
			Object.defineProperty( screen.getByTestId( 'container' ), 'offsetHeight', { value: 46 } );
			resize();
			sdk.setState( { status: 'ready', sessionId: 'sid' } );
		} );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/inactive/content' );
	} );

	test( 'does not load the SDK while disabled', async () => {
		render( <TestComponent enabled={ false } /> );
		await act( async () => {} );
		expect( loadBlackboxSdk ).not.toHaveBeenCalled();
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'ready/inactive/empty' );
	} );

	test.each( [ 'disable', 'unmount' ] )( 'cancels a pending submission on %s', async ( action ) => {
		const { rerender, unmount } = render( <TestComponent /> );
		await act( async () => {} );
		act( () => sdk.setState( { status: 'challenge', sessionId: 'sid' } ) );
		const pending = getBlackboxSessionId( 'test-api-key' );
		await act( async () => {} );
		if ( action === 'disable' ) {
			rerender( <TestComponent enabled={ false } /> );
		} else {
			unmount();
		}
		await expect( pending ).resolves.toBeNull();
		expect( sdk.listeners.size ).toBe( 0 );
	} );

	test( 'configures the new key before resetting after a surface change', async () => {
		const { rerender } = render( <TestComponent apiKey="login-key" /> );
		await act( async () => {} );
		sdk.api.reset.mockImplementation( () => {
			expect( sdk.api.configure ).toHaveBeenLastCalledWith(
				expect.objectContaining( { apiKey: 'signup-key' } )
			);
			sdk.setState( { status: 'loading' } );
		} );
		rerender( <TestComponent apiKey="signup-key" /> );
		await act( async () => {} );
		expect( sdk.api.reset ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByTestId( 'state' ) ).toHaveTextContent( 'loading/inactive' );
	} );

	test( 'does not reset a session on a normal render', async () => {
		const { rerender } = render( <TestComponent /> );
		await act( async () => {} );
		rerender( <TestComponent /> );
		expect( sdk.api.reset ).not.toHaveBeenCalled();
	} );
} );
