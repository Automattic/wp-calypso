// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Messages } from './Messages';
import styles from './Messages.module.css';
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

describe( 'Messages', () => {
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

	it( 'shows the thinking indicator from `isReplying` rather than pauses in the text', async () => {
		const question = userMessage( 'Make it orange' );
		const thinking = () => container.querySelector( '[data-slot="thinking"]' );

		// Settled text alone would show the indicator.
		await render( {
			messages: [ question, agentMessage( 'Done.' ) ],
			isProcessing: true,
			isReplying: true,
		} );

		expect( thinking() ).toBeNull();

		// Changing text alone would hide it.
		await render( {
			messages: [ question, agentMessage( 'Done. Checking the page.' ) ],
			isProcessing: true,
			isReplying: false,
		} );

		expect( thinking() ).not.toBeNull();
	} );

	it( 'renders `errorNotice` with its link action in the message list', async () => {
		const onClick = vi.fn();
		await render( {
			messages: [ userMessage( 'Make it orange' ) ],
			errorNotice: {
				message: 'You’re out of site credits.',
				action: { label: 'Add credits', href: '/checkout/credits', onClick },
			},
		} );

		const notice = container.querySelector( '[data-slot="messages"] [data-slot="notice"]' );
		expect( notice?.textContent ).toContain( 'You’re out of site credits.' );
		expect( notice?.classList.contains( styles.errorNotice ) ).toBe( true );
		const link = notice!.querySelector( 'a' )!;
		expect( link.textContent ).toBe( 'Add credits' );
		expect( link.getAttribute( 'href' ) ).toBe( '/checkout/credits' );
		link.addEventListener( 'click', ( event ) => event.preventDefault() );
		await act( async () => link.click() );
		expect( onClick ).toHaveBeenCalledOnce();
	} );

	it( 'renders no notice without `errorNotice`', async () => {
		await render( {
			messages: [ userMessage( 'Make it orange' ) ],
			error: 'Something went wrong.',
		} );

		expect( container.querySelector( '[data-slot="messages"] [data-slot="notice"]' ) ).toBeNull();
		expect( container.querySelector( '.error-message' )?.textContent ).toBe(
			'Something went wrong.'
		);
	} );

	it( 'renders `error` and `errorNotice` together', async () => {
		await render( {
			messages: [ userMessage( 'Make it orange' ) ],
			error: 'Something went wrong.',
			errorNotice: { message: 'You’re out of site credits.' },
		} );

		expect( container.querySelector( '.error-message' )?.textContent ).toBe(
			'Something went wrong.'
		);
		expect(
			container.querySelector( '[data-slot="messages"] [data-slot="notice"]' )?.textContent
		).toBe( 'You’re out of site credits.' );
	} );
} );
