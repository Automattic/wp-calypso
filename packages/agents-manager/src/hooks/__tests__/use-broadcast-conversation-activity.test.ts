/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	CONVERSATION_ACTIVITY_EVENT,
	useBroadcastConversationActivity,
} from '../use-broadcast-conversation-activity';

function renderWithCount( initialCount: number ) {
	const listener = jest.fn();
	window.addEventListener( CONVERSATION_ACTIVITY_EVENT, listener );

	const view = renderHook( ( { count } ) => useBroadcastConversationActivity( count ), {
		initialProps: { count: initialCount },
	} );

	return {
		listener,
		rerenderCount: ( count: number ) => view.rerender( { count } ),
		cleanup: () => window.removeEventListener( CONVERSATION_ACTIVITY_EVENT, listener ),
	};
}

describe( 'useBroadcastConversationActivity', () => {
	it( 'does not broadcast while the transcript is empty', () => {
		const { listener, cleanup } = renderWithCount( 0 );

		expect( listener ).not.toHaveBeenCalled();
		cleanup();
	} );

	it( 'broadcasts when the transcript gains its first message', () => {
		const { listener, rerenderCount, cleanup } = renderWithCount( 0 );

		rerenderCount( 1 );

		expect( listener ).toHaveBeenCalledTimes( 1 );
		cleanup();
	} );

	it( 'broadcasts again as more messages are appended mid-turn', () => {
		const { listener, rerenderCount, cleanup } = renderWithCount( 1 );
		// Initial render with a non-empty transcript already broadcast once.
		rerenderCount( 2 );
		rerenderCount( 3 );

		expect( listener ).toHaveBeenCalledTimes( 3 );
		cleanup();
	} );

	it( 'does not broadcast when the message count is unchanged', () => {
		const { listener, rerenderCount, cleanup } = renderWithCount( 2 );
		listener.mockClear(); // ignore the initial-mount broadcast

		rerenderCount( 2 );

		expect( listener ).not.toHaveBeenCalled();
		cleanup();
	} );
} );
