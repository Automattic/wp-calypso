/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	CHAT_VISIBILITY_EVENT,
	useBroadcastChatVisibility,
} from '../use-broadcast-chat-visibility';

function renderWithVisibility( initialVisible: boolean ) {
	const listener = jest.fn();
	window.addEventListener( CHAT_VISIBILITY_EVENT, listener );

	const view = renderHook( ( { isVisible } ) => useBroadcastChatVisibility( isVisible ), {
		initialProps: { isVisible: initialVisible },
	} );

	return {
		listener,
		rerenderVisibility: ( isVisible: boolean ) => view.rerender( { isVisible } ),
		cleanup: () => window.removeEventListener( CHAT_VISIBILITY_EVENT, listener ),
	};
}

describe( 'useBroadcastChatVisibility', () => {
	it( 'does not broadcast on the initial mount', () => {
		const { listener, cleanup } = renderWithVisibility( false );

		expect( listener ).not.toHaveBeenCalled();
		cleanup();
	} );

	it( 'broadcasts when visibility changes, carrying the new value in the detail', () => {
		const { listener, rerenderVisibility, cleanup } = renderWithVisibility( false );

		rerenderVisibility( true );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		expect( listener.mock.calls[ 0 ][ 0 ].detail ).toEqual( { isVisible: true } );

		rerenderVisibility( false );

		expect( listener.mock.calls[ 1 ][ 0 ].detail ).toEqual( { isVisible: false } );
		cleanup();
	} );

	it( 'broadcasts each time visibility toggles', () => {
		const { listener, rerenderVisibility, cleanup } = renderWithVisibility( false );

		rerenderVisibility( true );
		rerenderVisibility( false );
		rerenderVisibility( true );

		expect( listener ).toHaveBeenCalledTimes( 3 );
		cleanup();
	} );

	it( 'does not broadcast when visibility is unchanged', () => {
		const { listener, rerenderVisibility, cleanup } = renderWithVisibility( true );

		rerenderVisibility( true );

		expect( listener ).not.toHaveBeenCalled();
		cleanup();
	} );
} );
