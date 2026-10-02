/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useOdieAssistantContext } from '../../context';
import { useAutoScroll } from '../use-auto-scroll';
import type { Chat, Message } from '../../types';

jest.mock( '../../context', () => ( { useOdieAssistantContext: jest.fn() } ) );

const question = { content: 'How do I change my theme?', role: 'user', type: 'message' } as Message;
const reply = ( content: string ) => ( { content, role: 'bot', type: 'message' } ) as Message;

describe( 'useAutoScroll with a streamed reply', () => {
	let container: HTMLDivElement;
	let scrolled: jest.Mock;

	const render = ( chat: Partial< Chat > ) => {
		jest
			.mocked( useOdieAssistantContext )
			.mockReturnValue( { chat } as ReturnType< typeof useOdieAssistantContext > );
	};

	beforeEach( () => {
		jest.useFakeTimers();
		container = document.createElement( 'div' );
		container.innerHTML =
			'<div class="odie-chatbox-message" id="question"></div><div class="odie-chatbox-message" id="reply"></div>';
		scrolled = jest.fn( function ( this: Element, options: ScrollIntoViewOptions ) {
			return { id: this.id, block: options.block };
		} );
		Element.prototype.scrollIntoView = scrolled;
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'keeps the end of the reply in view as each chunk arrives, and stays there once it completes', () => {
		render( { messages: [ question, reply( 'To change' ) ], status: 'sending' } );
		const { rerender } = renderHook( () => useAutoScroll( { current: container }, true ) );
		act( () => jest.runAllTimers() );

		render( { messages: [ question, reply( 'To change your theme' ) ], status: 'sending' } );
		rerender();
		act( () => jest.runAllTimers() );

		render( { messages: [ question, reply( 'To change your theme…' ) ], status: 'loaded' } );
		rerender();
		act( () => jest.runAllTimers() );

		expect( scrolled.mock.results.map( ( result ) => result.value ) ).toEqual( [
			{ id: 'reply', block: 'end' },
			{ id: 'reply', block: 'end' },
		] );
	} );

	it( 'does not scroll back when the chat reloads after a streamed reply, but does for the next message', () => {
		render( { messages: [ question, reply( 'To change your theme…' ) ], status: 'sending' } );
		const { rerender } = renderHook( () => useAutoScroll( { current: container }, true ) );
		render( { messages: [ question, reply( 'To change your theme…' ) ], status: 'loaded' } );
		rerender();
		act( () => jest.runAllTimers() );
		scrolled.mockClear();

		// A new chat reloads from the server once it is registered as a support interaction.
		render( {
			messages: [ reply( 'Earlier reply' ), question, reply( 'To change your theme…' ) ],
			status: 'loaded',
		} );
		rerender();
		act( () => jest.runAllTimers() );

		expect( scrolled ).not.toHaveBeenCalled();

		render( {
			messages: [
				reply( 'Earlier reply' ),
				question,
				reply( 'To change your theme…' ),
				{ ...question, content: 'Thanks!' },
			],
			status: 'loaded',
		} );
		rerender();
		act( () => jest.runAllTimers() );

		expect( scrolled ).toHaveBeenCalled();
	} );
} );
