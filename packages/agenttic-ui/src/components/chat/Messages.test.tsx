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
		delete ( Element.prototype as Partial< Element > ).checkVisibility;
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

	it( 'announces a new reply with the same text as the previous one', async () => {
		const question = userMessage( 'Make it orange' );
		const firstReply = agentMessage( 'Done.' );

		await render( { messages: [ question, firstReply ], isProcessing: false } );
		await render( { messages: [ question, firstReply ], isProcessing: true } );
		await render( {
			messages: [ question, firstReply, agentMessage( 'Done.', 'agent-2' ) ],
			isProcessing: false,
		} );

		expect( announcement() ).toBe( 'Done.' );
	} );

	it( 'announces a hidden reply that the host shows after the turn ends', async () => {
		const question = userMessage( 'Make it blue' );
		const note: MessageType = {
			...agentMessage( '' ),
			id: 'note',
			content: [ { type: 'component', component: () => <p>Chose blue</p> } ],
		};
		const reply: MessageType = {
			...agentMessage( '' ),
			id: 'reply',
			content: [ { type: 'data', data: {} } ],
		};

		await render( { messages: [ question, note ], isProcessing: true } );
		await render( { messages: [ question, note, reply ], isProcessing: false } );

		expect( announcement() ).toBe( '' );

		await render( {
			messages: [
				question,
				note,
				{ ...reply, content: [ { type: 'component', component: () => <p>Pick a font</p> } ] },
			],
			isProcessing: false,
		} );

		expect( announcement() ).toBe( 'Pick a font' );
	} );

	it( 'does not read out another conversation opened while a reply is still hidden', async () => {
		const question = userMessage( 'Make it blue' );
		const reply: MessageType = {
			...agentMessage( '' ),
			id: 'reply',
			content: [ { type: 'data', data: {} } ],
		};

		await render( { messages: [ question ], isProcessing: true } );
		await render( { messages: [ question, reply ], isProcessing: false } );
		await render( {
			messages: [ userMessage( 'Hi' ), agentMessage( 'Earlier reply' ) ],
			isProcessing: false,
		} );

		expect( announcement() ).toBe( '' );

		await render( {
			messages: [
				question,
				{ ...reply, content: [ { type: 'component', component: () => <p>Pick a font</p> } ] },
			],
			isProcessing: false,
		} );

		expect( announcement() ).toBe( '' );
	} );

	it( 'does not read out a conversation that is already on screen when it opens', async () => {
		await render( {
			messages: [ userMessage( 'Hi' ), agentMessage( 'Earlier reply' ) ],
			isProcessing: false,
		} );

		expect( announcement() ).toBe( '' );
	} );

	it( 'leaves out content hidden from assistive technology', async () => {
		// jsdom has no `checkVisibility`; mirror browsers, where `[hidden]` is not displayed.
		Element.prototype.checkVisibility = function () {
			return ! this.closest( '[hidden]' );
		};

		const Renderer = ( { children }: { children: string } ) => (
			<p>
				{ children } <span aria-hidden="true">→</span> done<span hidden> twice</span>
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

	it( 'renders a titled `errorNotice` as a message card linking to its action', async () => {
		const onClick = vi.fn();
		await render( {
			messages: [ userMessage( 'Make it orange' ) ],
			errorNotice: {
				title: 'Your message wasn’t sent',
				message: 'Site credits reset on Nov 15. Add more to keep going.',
				action: { label: 'Add credits', href: '/checkout/credits', onClick },
			},
		} );

		expect( container.querySelector( '[data-slot="messages"] [data-slot="notice"]' ) ).toBeNull();
		const card = container.querySelector< HTMLAnchorElement >(
			'[data-slot="messages"] a[href="/checkout/credits"]'
		)!;
		expect( card.parentElement?.classList.contains( styles.errorCard ) ).toBe( true );
		expect( card.textContent ).toBe(
			'Your message wasn’t sentSite credits reset on Nov 15. Add more to keep going.'
		);
		card.addEventListener( 'click', ( event ) => event.preventDefault() );
		await act( async () => card.click() );
		expect( onClick ).toHaveBeenCalledOnce();
	} );

	it( 'renders a titled `errorNotice` without an action as a plain card', async () => {
		await render( {
			messages: [ userMessage( 'Make it orange' ) ],
			errorNotice: { title: 'Your message wasn’t sent', message: 'Site credits reset on Nov 15.' },
		} );

		const messages = container.querySelector( '[data-slot="messages"]' )!;
		expect( messages.querySelector( 'a' ) ).toBeNull();
		expect( messages.textContent ).toContain( 'Your message wasn’t sent' );
		expect( messages.textContent ).toContain( 'Site credits reset on Nov 15.' );
	} );

	it( 'announces a title-only `errorNotice` as its title', async () => {
		const question = userMessage( 'Make it orange' );
		await render( { messages: [ question ], isProcessing: true } );
		await render( {
			messages: [ question ],
			isProcessing: false,
			errorNotice: { title: 'Your message wasn’t sent', message: '' },
		} );

		expect( announcement() ).toBe( 'Your message wasn’t sent' );
	} );

	it( 'announces a titled `errorNotice` with its title first', async () => {
		const question = userMessage( 'Make it orange' );
		await render( { messages: [ question ], isProcessing: true } );
		await render( {
			messages: [ question ],
			isProcessing: false,
			errorNotice: { title: 'Your message wasn’t sent', message: 'Site credits reset on Nov 15.' },
		} );

		expect( announcement() ).toBe( 'Your message wasn’t sent. Site credits reset on Nov 15.' );
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

	it( 'announces `errorNotice` when it appears', async () => {
		const question = userMessage( 'Make it orange' );
		await render( { messages: [ question ], isProcessing: true } );
		await render( {
			messages: [ question ],
			isProcessing: false,
			errorNotice: { message: 'You’re out of site credits.' },
		} );

		expect( announcement() ).toBe( 'You’re out of site credits.' );
	} );

	it( 'announces `errorNotice` again when its message changes', async () => {
		const question = userMessage( 'Make it orange' );
		await render( { messages: [ question ] } );
		await render( {
			messages: [ question ],
			errorNotice: { message: 'You’re out of site credits.' },
		} );
		await render( {
			messages: [ question ],
			errorNotice: { message: 'Site credits are back. Send your message again.' },
		} );

		expect( announcement() ).toBe( 'Site credits are back. Send your message again.' );
	} );

	it( 'does not read out an `errorNotice` already on screen when it opens', async () => {
		await render( {
			messages: [ userMessage( 'Make it orange' ) ],
			errorNotice: { message: 'You’re out of site credits.' },
		} );

		expect( announcement() ).toBe( '' );
	} );

	it( 'announces the same `errorNotice` again after the next turn', async () => {
		const question = userMessage( 'Make it orange' );
		const notice = { message: 'You’re out of site credits.' };
		await render( { messages: [ question ], isProcessing: true } );
		await render( { messages: [ question ], errorNotice: notice } );
		await render( { messages: [ question ], isProcessing: true } );

		expect( announcement() ).toBe( '' );

		await render( { messages: [ question ], errorNotice: notice } );

		expect( announcement() ).toBe( 'You’re out of site credits.' );
	} );
} );
