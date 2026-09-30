/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
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
		jest.runAllTimers();

		render( { messages: [ question, reply( 'To change your theme' ) ], status: 'sending' } );
		rerender();
		jest.runAllTimers();

		render( { messages: [ question, reply( 'To change your theme…' ) ], status: 'loaded' } );
		rerender();
		jest.runAllTimers();

		expect( scrolled.mock.results.map( ( result ) => result.value ) ).toEqual( [
			{ id: 'reply', block: 'end' },
			{ id: 'reply', block: 'end' },
		] );
	} );
} );
