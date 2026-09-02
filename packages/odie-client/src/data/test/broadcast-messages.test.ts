/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { broadcastOdieMessage, useOdieBroadcastWithCallbacks } from '../broadcast-messages';
import type { Message } from '../../types';

let mockSearch = '?id=interaction-1';
jest.mock( 'react-router-dom', () => ( {
	useLocation: () => ( { search: mockSearch } ),
} ) );
// Only `useLocation` matters here; keep the zendesk client out of the import graph.
jest.mock( '../use-get-support-interaction-by-id', () => ( {
	useGetSupportInteractionById: jest.fn(),
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

const message = { type: 'message', content: 'hello', role: 'user' } as unknown as Message;

describe( 'odie broadcast gating', () => {
	beforeEach( () => {
		FakeBroadcastChannel.channels = [];
		mockSearch = '?id=interaction-1';
		( globalThis as unknown as { BroadcastChannel: typeof BroadcastChannel } ).BroadcastChannel =
			FakeBroadcastChannel as unknown as typeof BroadcastChannel;
	} );

	it( 'delivers a message to another tab showing the same support interaction', () => {
		const addMessage = jest.fn();
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( message, 'sender-tab', 'interaction-1' );

		expect( addMessage ).toHaveBeenCalledWith( message );
	} );

	it( 'reads the legacy odieInteractionId param too', () => {
		const addMessage = jest.fn();
		mockSearch = '?odieInteractionId=interaction-1';
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( message, 'sender-tab', 'interaction-1' );

		expect( addMessage ).toHaveBeenCalledWith( message );
	} );

	it( 'drops a message from a tab showing a different support interaction', () => {
		const addMessage = jest.fn();
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( message, 'sender-tab', 'interaction-2' );

		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'drops a message when the receiving tab has no support interaction yet', () => {
		const addMessage = jest.fn();
		mockSearch = '';
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'listener-tab' ) );

		broadcastOdieMessage( message, 'sender-tab', null );

		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'ignores the tab’s own broadcast', () => {
		const addMessage = jest.fn();
		renderHook( () => useOdieBroadcastWithCallbacks( { addMessage }, 'same-tab' ) );

		broadcastOdieMessage( message, 'same-tab', 'interaction-1' );

		expect( addMessage ).not.toHaveBeenCalled();
	} );
} );
