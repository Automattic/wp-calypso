// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AgentUI } from '../embedded-agent-ui';
import type { AgentUIProps, Message } from '../types';

( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

const question: Message = {
	id: 'user-1',
	role: 'user',
	content: [ { type: 'text', text: 'Make it orange' } ],
	timestamp: 1,
	archived: false,
	showIcon: false,
};

describe( 'embedded error notice', () => {
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

	const render = async ( props: Partial< AgentUIProps > ) => {
		await act( async () => {
			root.render(
				<AgentUI.Container
					messages={ [ question ] }
					isProcessing={ false }
					onSubmit={ () => {} }
					{ ...props }
				>
					<AgentUI.Messages />
					<div data-testid="above-composer">
						<AgentUI.Notice className="host-notice" />
					</div>
				</AgentUI.Container>
			);
		} );
	};

	const renderWithErrorNotice = ( onClick = vi.fn() ) =>
		render( {
			error: 'Something went wrong.',
			errorNotice: {
				message: 'You’re out of site credits.',
				status: 'error',
				action: { label: 'Add credits', onClick },
			},
		} );

	it( 'renders `errorNotice` after `error` in the message list', async () => {
		await renderWithErrorNotice();

		const messages = container.querySelector( '[data-slot="messages"]' )!;
		expect( messages.querySelector( '.agenttic-embedded__error' )?.textContent ).toBe(
			'Something went wrong.'
		);
		expect( messages.lastElementChild?.outerHTML ).toBe(
			'<div class="agenttic-embedded__notice agenttic-embedded__notice--error"><span>You’re out of site credits.</span><button type="button">Add credits</button></div>'
		);
	} );

	it( 'runs the `errorNotice` action on click', async () => {
		const onClick = vi.fn();
		await renderWithErrorNotice( onClick );

		const messages = container.querySelector( '[data-slot="messages"]' )!;
		await act( async () => messages.querySelector( 'button' )!.click() );
		expect( onClick ).toHaveBeenCalledOnce();
	} );

	it( 'leaves `errorNotice` out of the notice above the composer', async () => {
		await renderWithErrorNotice();

		expect( container.querySelector( '[data-testid="above-composer"]' )?.innerHTML ).toBe( '' );
	} );

	it( 'renders `notice` above the composer, not in the message list', async () => {
		await render( {
			notice: {
				message: '20% of site credits left.',
				status: 'warning',
				action: { label: 'Upgrade', href: '/plans', target: '_blank', rel: 'noopener' },
			},
		} );

		expect( container.querySelector( '[data-testid="above-composer"]' )?.innerHTML ).toBe(
			'<div class="agenttic-embedded__notice agenttic-embedded__notice--warning host-notice"><span>20% of site credits left.</span><a href="/plans" target="_blank" rel="noopener">Upgrade</a></div>'
		);
		expect(
			container.querySelector( '[data-slot="messages"] .agenttic-embedded__notice' )
		).toBeNull();
	} );
} );
