// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Message } from './Message';
import type { Message as MessageType } from '../../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

// The avatar is the only 28x28 mark on the message, so its viewBox identifies it.
const AVATAR_SELECTOR = 'svg[viewBox="0 0 28 28"]';

function buildMessage( overrides: Partial< MessageType > = {} ): MessageType {
	return {
		id: 'agent-1',
		role: 'agent',
		content: [ { type: 'text', text: 'Hello' } ],
		timestamp: 1,
		archived: false,
		showIcon: true,
		...overrides,
	};
}

describe( 'Message', () => {
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

	async function renderMessage( message: MessageType, showAgentIcon: boolean ): Promise< void > {
		await act( async () => {
			root.render( <Message message={ message } showAgentIcon={ showAgentIcon } /> );
		} );
	}

	it( 'applies message classes alongside role and disabled styles', async () => {
		await renderMessage( buildMessage( { className: 'custom a2ui', disabled: true } ), false );

		const message = container.querySelector( '[data-slot="message"]' );
		expect( message?.classList.contains( 'custom' ) ).toBe( true );
		expect( message?.classList.contains( 'a2ui' ) ).toBe( true );
		expect( message?.className ).toContain( 'message' );
		expect( message?.className ).toContain( 'disabled' );
		expect( message?.getAttribute( 'data-role' ) ).toBe( 'agent' );
	} );

	it( 'shows the avatar for an agent text message when all gates pass', async () => {
		await renderMessage( buildMessage(), true );

		expect( container.querySelector( AVATAR_SELECTOR ) ).not.toBeNull();
	} );

	it( 'hides the avatar when showAgentIcon is off', async () => {
		await renderMessage( buildMessage(), false );

		expect( container.querySelector( AVATAR_SELECTOR ) ).toBeNull();
	} );

	it( 'hides the avatar on user messages', async () => {
		await renderMessage( buildMessage( { role: 'user' } ), true );

		expect( container.querySelector( AVATAR_SELECTOR ) ).toBeNull();
	} );

	it( 'hides the avatar when the message opts out via showIcon', async () => {
		await renderMessage( buildMessage( { showIcon: false } ), true );

		expect( container.querySelector( AVATAR_SELECTOR ) ).toBeNull();
	} );

	it( 'hides the avatar when there is no textual content (component-only)', async () => {
		const componentOnly = buildMessage( {
			content: [ { type: 'component', component: () => <div /> } ],
		} );

		await renderMessage( componentOnly, true );

		expect( container.querySelector( AVATAR_SELECTOR ) ).toBeNull();
	} );

	it( 'hides the avatar when the only text block is empty', async () => {
		const emptyText = buildMessage( {
			content: [ { type: 'text', text: '' } ],
		} );

		await renderMessage( emptyText, true );

		expect( container.querySelector( AVATAR_SELECTOR ) ).toBeNull();
	} );
} );
