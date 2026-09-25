// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Messages } from './Messages';
import type { Message as MessageType } from '../../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

function userMessage( text: string ): MessageType {
	return {
		id: 'user-1',
		role: 'user',
		content: [ { type: 'text', text } ],
		timestamp: 1,
		archived: false,
		showIcon: false,
	};
}

function agentMessage( text: string, id = 'agent-1' ): MessageType {
	return {
		id,
		role: 'agent',
		content: [ { type: 'text', text } ],
		timestamp: 2,
		archived: false,
		showIcon: true,
	};
}

describe( 'Messages screen reader announcements', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	async function render( props: Parameters< typeof Messages >[ 0 ] ): Promise< void > {
		await act( async () => {
			root.render( <Messages { ...props } /> );
		} );
	}

	const announcement = () => container.querySelector( '[aria-live="polite"]' )?.textContent ?? '';

	it( 'announces the rendered reply, without markdown syntax or link URLs, once it finishes', async () => {
		const question = userMessage( 'What should I know?' );
		await render( { messages: [ question ], isProcessing: true } );
		await render( {
			messages: [
				question,
				agentMessage( '**Bold** and [a link](https://example.com)\n\n- first\n- second' ),
			],
			isProcessing: true,
		} );

		expect( announcement() ).toBe( '' );

		await render( {
			messages: [
				question,
				agentMessage( '**Bold** and [a link](https://example.com)\n\n- first\n- second' ),
			],
			isProcessing: false,
		} );

		expect( announcement() ).toBe( 'Bold and a link first second' );
	} );

	it( 'does not read out a conversation that is already on screen when it opens', async () => {
		await render( {
			messages: [ userMessage( 'Hi' ), agentMessage( 'Earlier reply' ) ],
			isProcessing: false,
		} );

		expect( announcement() ).toBe( '' );
	} );

	it( 'leaves out content hidden from assistive technology', async () => {
		const Renderer = ( { children }: { children: string } ) => (
			<p>
				{ children } <span aria-hidden="true">→</span> done
			</p>
		);
		const question = userMessage( 'Change it' );
		await render( { messages: [ question ], isProcessing: true, messageRenderer: Renderer } );
		await render( {
			messages: [ question, agentMessage( 'Price updated' ) ],
			isProcessing: false,
			messageRenderer: Renderer,
		} );

		expect( announcement() ).toBe( 'Price updated done' );
	} );
} );
