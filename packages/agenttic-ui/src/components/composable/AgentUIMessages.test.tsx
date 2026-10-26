// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AgentUI } from '../AgentUI';
import type { Message } from '../../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

const question: Message = {
	id: 'user-1',
	role: 'user',
	content: [ { type: 'text', text: 'Make it orange' } ],
	timestamp: 1,
	archived: false,
	showIcon: false,
};

describe( 'AgentUI.Messages error notice', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => root.unmount() );
		container.remove();
	} );

	it( 'renders `errorNotice` in the message list and not as the above-composer notice', async () => {
		await act( async () => {
			root.render(
				<AgentUI.Container
					messages={ [ question ] }
					isProcessing={ false }
					onSubmit={ () => {} }
					variant="embedded"
					errorNotice={ { message: 'You’re out of site credits.' } }
				>
					<div data-testid="above-composer">
						<AgentUI.Notice />
					</div>
					<AgentUI.Messages />
				</AgentUI.Container>
			);
		} );

		expect(
			container.querySelector( '[data-slot="messages"] [data-slot="notice"]' )?.textContent
		).toBe( 'You’re out of site credits.' );
		expect( container.querySelector( '[data-testid="above-composer"]' )?.innerHTML ).toBe( '' );
	} );
} );
