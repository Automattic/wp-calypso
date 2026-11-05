import React, { act } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { getAgentManager } from '../agentManager';
import { endResumableChat, getResumableChat } from '../liveChat';
import { useAgentChat, type UseAgentChatReturn } from '../useAgentChat';
import type { TaskUpdate } from '../../client/types';

// Required for React 18's act() in jsdom.
( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

// The agent already exists, as when a chat mounts again, and holds the prompt.
vi.mock( '../agentManager', () => {
	const agentManager = {
		hasAgent: vi.fn().mockReturnValue( true ),
		getAgentSessionId: vi.fn().mockReturnValue( 'test-session' ),
		getConversationHistory: vi
			.fn()
			.mockReturnValue( [ { role: 'user', parts: [ { type: 'text', text: 'Write a guide' } ] } ] ),
		updateSessionId: vi.fn(),
		replaceMessages: vi.fn(),
		sendMessageStream: vi.fn(),
	};
	return {
		getAgentManager: () => agentManager,
	};
} );

interface HarnessProps {
	agentId: string;
	resumeOnRemount: boolean;
	onRender: ( chat: UseAgentChatReturn ) => void;
}

function HookHarness( { agentId, resumeOnRemount, onRender }: HarnessProps ): null {
	onRender(
		useAgentChat( {
			agentId,
			agentUrl: 'https://example.com/agents',
			sessionId: 'test-session',
			resumeOnRemount,
		} )
	);

	return null;
}

const PROMPT = 'Write a guide';

const progress: TaskUpdate = {
	id: 'task-1',
	status: { state: 'working' },
	text: '',
	kind: 'status',
	progressMessage: 'Writing the reply…',
};
const finalUpdate: TaskUpdate = {
	id: 'task-1',
	status: { state: 'completed' },
	text: '',
	kind: 'status',
	final: true,
};

// Lets the stream run until it awaits its next pause.
const flush = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

const hasPrompt = ( chat: UseAgentChatReturn ) =>
	chat.messages.some( ( message ) =>
		message.content.some( ( content ) => content.text === PROMPT )
	);

describe( 'useAgentChat — resumeOnRemount', () => {
	let container: HTMLDivElement;
	let root: Root;
	let chat: UseAgentChatReturn;
	let resume: () => void;
	let sending: Promise< void >;

	async function mount( props: Omit< HarnessProps, 'onRender' > ): Promise< void > {
		root = createRoot( container );

		await act( async () => {
			root.render(
				React.createElement( HookHarness, {
					...props,
					onRender: ( latest ) => {
						chat = latest;
					},
				} )
			);
		} );
	}

	async function sendThenUnmount( props: Omit< HarnessProps, 'onRender' > ): Promise< void > {
		await mount( props );

		await act( async () => {
			sending = chat.onSubmit( PROMPT );
			await flush();
		} );

		await act( async () => root.unmount() );
	}

	async function finishReply(): Promise< void > {
		await act( async () => {
			resume();
			await sending;
		} );
	}

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );

		const sendMessageStream = getAgentManager().sendMessageStream as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
		>;
		sendMessageStream.mockImplementation( async function* () {
			yield progress;
			await new Promise< void >( ( resolve ) => {
				resume = resolve;
			} );

			yield finalUpdate;
		} );
	} );

	afterEach( async () => {
		await act( async () => root.unmount() );
		container.remove();
	} );

	it( 'resumes a reply still streaming when the chat mounts again', async () => {
		await sendThenUnmount( { agentId: 'streaming-agent', resumeOnRemount: true } );
		await mount( { agentId: 'streaming-agent', resumeOnRemount: true } );

		expect( hasPrompt( chat ) ).toBe( true );
		expect( chat.isProcessing ).toBe( true );
		expect( chat.progressMessage ).toBe( 'Writing the reply…' );

		await finishReply();

		expect( chat.isProcessing ).toBe( false );
	} );

	it( 'shows a reply that finished while the chat was unmounted', async () => {
		await sendThenUnmount( { agentId: 'finished-agent', resumeOnRemount: true } );
		await finishReply();
		await mount( { agentId: 'finished-agent', resumeOnRemount: true } );

		expect( hasPrompt( chat ) ).toBe( true );
		expect( chat.isProcessing ).toBe( false );
	} );

	it( 'starts a new chat once the agent is removed, out of reach of its send', async () => {
		await sendThenUnmount( { agentId: 'removed-agent', resumeOnRemount: true } );
		endResumableChat( 'removed-agent' );
		await mount( { agentId: 'removed-agent', resumeOnRemount: true } );

		expect( chat.messages ).toEqual( [] );
		expect( chat.isProcessing ).toBe( false );

		await finishReply();

		expect( chat.messages ).toEqual( [] );
	} );

	it( 'takes a component’s message actions off the chat it leaves', async () => {
		const props = { agentId: 'actions-agent', resumeOnRemount: true };

		await mount( props );

		await act( async () => {
			await chat.loadMessages( [
				{
					role: 'agent',
					kind: 'message',
					messageId: 'reply',
					parts: [ { type: 'text', text: 'Hi' } ],
				},
			] );

			chat.registerMessageActions( {
				id: 'copy',
				actions: [ { id: 'copy', label: 'Copy', onClick: () => {} } ],
			} );
		} );

		expect( chat.messages[ 0 ].actions ).toHaveLength( 1 );

		await act( async () => root.unmount() );

		expect( getResumableChat( 'actions-agent' ).state.uiMessages[ 0 ].actions ).toBeUndefined();

		await mount( props );
	} );

	it( 'drops an error the component it leaves has already shown', async () => {
		const props = { agentId: 'failing-agent', resumeOnRemount: true };

		vi.mocked( getAgentManager().sendMessageStream ).mockImplementation(
			// eslint-disable-next-line require-yield
			async function* () {
				throw new Error( 'Network down' );
			}
		);
		await mount( props );
		await act( async () => {
			await chat.onSubmit( PROMPT ).catch( () => {} );
		} );

		expect( chat.error ).toBe( 'Network down' );

		await act( async () => root.unmount() );
		await mount( props );

		expect( chat.error ).toBeNull();
	} );

	it( "keeps each agent's chat to itself", async () => {
		await sendThenUnmount( { agentId: 'first-agent', resumeOnRemount: true } );
		await mount( { agentId: 'second-agent', resumeOnRemount: true } );

		expect( chat.messages ).toEqual( [] );

		await finishReply();
	} );

	it( 'starts a chat that mounts again empty without it', async () => {
		await sendThenUnmount( { agentId: 'own-agent', resumeOnRemount: false } );
		await mount( { agentId: 'own-agent', resumeOnRemount: false } );

		expect( chat.messages ).toEqual( [] );
		expect( chat.isProcessing ).toBe( false );

		await finishReply();
	} );
} );
