/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import {
	broadcastOdieInteractionUpdated,
	broadcastOdieMessage,
	useOdieBroadcastWithCallbacks,
} from '../broadcast-messages';
import type { Message } from '../../types';

let mockSearch = '?id=interaction-1';
const mockNavigate = jest.fn();
jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: mockSearch, pathname: '/odie' } ),
	useNavigate: () => mockNavigate,
} ) );
const mockInvalidateQueries = jest.fn();
jest.mock( '@tanstack/react-query', () => ( {
	useQueryClient: () => ( { invalidateQueries: mockInvalidateQueries } ),
} ) );
jest.mock( '@automattic/zendesk-client', () => ( {
	isTestModeEnvironment: () => false,
} ) );

// jsdom does not implement BroadcastChannel. Provide a minimal same-realm
// implementation so a "broadcast" is delivered synchronously to every other
// channel on the same name.
class FakeBroadcastChannel {
	static channels: FakeBroadcastChannel[] = [];
	name: string;
	onmessage: ( ( event: { data: unknown } ) => void ) | null = null;

	constructor( name: string ) {
		this.name = name;
		FakeBroadcastChannel.channels.push( this );
	}

	postMessage( data: unknown ) {
		FakeBroadcastChannel.channels
			.filter( ( channel ) => channel !== this && channel.name === this.name )
			.forEach( ( channel ) => channel.onmessage?.( { data } ) );
	}

	close() {
		FakeBroadcastChannel.channels = FakeBroadcastChannel.channels.filter(
			( channel ) => channel !== this
		);
	}
}

// A user message sent to Odie: the composer attaches no metadata to those.
const odieUserMessage = { type: 'message', content: 'hello', role: 'user' } as unknown as Message;

// A user message sent to Zendesk: the composer attaches the ids it is tracked by.
const zendeskUserMessage = {
	...odieUserMessage,
	metadata: { temporary_id: 'temp-1', local_timestamp: 1700000000 },
} as unknown as Message;

describe( 'odie broadcast gating', () => {
	beforeEach( () => {
		FakeBroadcastChannel.channels = [];
		mockSearch = '?id=interaction-1';
		mockInvalidateQueries.mockClear();
		mockNavigate.mockClear();
		( globalThis as unknown as { BroadcastChannel: typeof BroadcastChannel } ).BroadcastChannel =
			FakeBroadcastChannel as unknown as typeof BroadcastChannel;
	} );

	it( 'delivers a message to another tab showing the same support interaction', () => {
		const addMessage = jest.fn();
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( odieUserMessage, 'sender-tab', 'interaction-1' );

		expect( addMessage ).toHaveBeenCalledWith( odieUserMessage );
	} );

	it( 'marks a mirrored Zendesk user message as sent, using its local timestamp', () => {
		const addMessage = jest.fn();
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( zendeskUserMessage, 'sender-tab', 'interaction-1' );

		// The receiving tab does not own the send lifecycle, so it would otherwise
		// render the message greyed as "sending" forever.
		expect( addMessage ).toHaveBeenCalledWith( { ...zendeskUserMessage, received: 1700000000 } );
	} );

	it( 'passes an already-sent Zendesk message through untouched', () => {
		const addMessage = jest.fn();
		const sentMessage = { ...zendeskUserMessage, received: 111 };
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( sentMessage, 'sender-tab', 'interaction-1' );

		expect( addMessage ).toHaveBeenCalledWith( sentMessage );
	} );

	it( 'passes a bot message through untouched', () => {
		const addMessage = jest.fn();
		const botMessage = { ...odieUserMessage, role: 'bot' } as Message;
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( botMessage, 'sender-tab', 'interaction-1' );

		expect( addMessage ).toHaveBeenCalledWith( botMessage );
	} );

	it( 'reads the legacy odieInteractionId param too', () => {
		const addMessage = jest.fn();
		mockSearch = '?odieInteractionId=interaction-1';
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( odieUserMessage, 'sender-tab', 'interaction-1' );

		expect( addMessage ).toHaveBeenCalled();
	} );

	it( 'drops a message from a tab showing a different support interaction', () => {
		const addMessage = jest.fn();
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( odieUserMessage, 'sender-tab', 'interaction-2' );

		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'drops a message when the receiving tab has no support interaction yet', () => {
		const addMessage = jest.fn();
		mockSearch = '';
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( odieUserMessage, 'sender-tab', null );

		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'ignores the tab’s own broadcast', () => {
		const addMessage = jest.fn();
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'same-tab' ) );

		broadcastOdieMessage( odieUserMessage, 'same-tab', 'interaction-1' );

		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'closes the channel it posted on', () => {
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage: jest.fn() }, 'listener-tab' ) );

		broadcastOdieMessage( odieUserMessage, 'sender-tab', 'interaction-1' );
		broadcastOdieInteractionUpdated( 'sender-tab', 'interaction-1' );

		// Only the listener's channel is left open.
		expect( FakeBroadcastChannel.channels ).toHaveLength( 1 );
	} );

	it( 'refetches the support interaction and the Odie chat when another tab updates it', () => {
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage: jest.fn() }, 'listener-tab' ) );

		broadcastOdieInteractionUpdated( 'sender-tab', 'interaction-1' );

		expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
			queryKey: [ 'support-interactions', 'get-interaction-by-id', 'interaction-1', false ],
		} );
		expect( mockInvalidateQueries ).toHaveBeenCalledWith( { queryKey: [ 'odie-chat' ] } );
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'follows the interaction that now owns the conversation when it moved', () => {
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage: jest.fn() }, 'listener-tab' ) );

		// The sending tab started from interaction-1, which this tab shows, but the
		// service put the conversation on interaction-2.
		broadcastOdieInteractionUpdated( 'sender-tab', 'interaction-1', 'interaction-2' );

		expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
			queryKey: [ 'support-interactions', 'get-interaction-by-id', 'interaction-1', false ],
		} );
		expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
			queryKey: [ 'support-interactions', 'get-interaction-by-id', 'interaction-2', false ],
		} );
		expect( mockNavigate ).toHaveBeenCalledWith( '/odie?id=interaction-2', { replace: true } );
	} );

	it( 'ignores a move announced for an interaction this tab does not show', () => {
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage: jest.fn() }, 'listener-tab' ) );

		broadcastOdieInteractionUpdated( 'sender-tab', 'interaction-3', 'interaction-1' );

		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
		expect( mockNavigate ).not.toHaveBeenCalled();
	} );

	it( 'ignores an interaction update for a different support interaction', () => {
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage: jest.fn() }, 'listener-tab' ) );

		broadcastOdieInteractionUpdated( 'sender-tab', 'interaction-2' );

		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
	} );
} );
