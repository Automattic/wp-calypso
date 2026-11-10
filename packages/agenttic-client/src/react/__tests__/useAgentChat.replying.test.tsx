import React, { act } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { getAgentManager } from '../agentManager';
import { useAgentChat, type UseAgentChatReturn } from '../useAgentChat';
import type { TaskUpdate } from '../../client/types';

// Required for React 18's act() in jsdom.
( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock( '../agentManager', () => {
	const agentManager = {
		createAgent: vi.fn().mockResolvedValue( {} ),
		getAgent: vi.fn().mockReturnValue( null ),
		hasAgent: vi.fn().mockReturnValue( false ),
		removeAgent: vi.fn(),
		sendMessage: vi.fn(),
		sendMessageStream: vi.fn(),
		sendToolResult: vi.fn(),
		resetConversation: vi.fn(),
		replaceMessages: vi.fn(),
		getConversationHistory: vi.fn().mockReturnValue( [] ),
		updateSessionId: vi.fn(),
		abortCurrentRequest: vi.fn(),
		clear: vi.fn(),
	};
	return {
		getAgentManager: () => agentManager,
	};
} );

function HookHarness( props: {
	trackReplying?: boolean;
	onRender: ( chat: UseAgentChatReturn ) => void;
} ): null {
	const chat = useAgentChat( {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agents',
		sessionId: 'test-session',
		trackReplying: props.trackReplying,
	} );

	props.onRender( chat );

	return null;
}

function update( fields: Partial< TaskUpdate > ): TaskUpdate {
	return { id: 'task-1', status: { state: 'working' }, text: '', ...fields };
}

const progress = update( { kind: 'status', progressMessage: 'Checking how the changes look…' } );
const keepAlive = update( { kind: 'delta', delta: { deltaType: 'content', content: '' } } );
const replyText = update( {
	kind: 'delta',
	delta: { deltaType: 'content', content: 'Done.' },
	text: 'Done.',
} );
const toolCall = update( {
	kind: 'delta',
	delta: { deltaType: 'tool_argument', content: '{}', toolCallId: 'call-1' },
	text: 'Done.',
} );
const finalUpdate = update( { status: { state: 'completed' }, final: true, kind: 'status' } );

// Lets the stream run until it awaits its next pause.
const flush = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'useAgentChat — isReplying', () => {
	let container: HTMLDivElement;
	let root: Root;
	let chat: UseAgentChatReturn;
	let sendMessageStream: MockedFunction<
		ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
	>;
	let resume: () => void;
	const pause = () =>
		new Promise< void >( ( resolve ) => {
			resume = resolve;
		} );

	async function renderHarness( trackReplying?: boolean ): Promise< void > {
		await act( async () => {
			root.render(
				React.createElement( HookHarness, {
					trackReplying,
					onRender: ( latest ) => {
						chat = latest;
					},
				} )
			);
		} );
	}

	async function step(): Promise< void > {
		await act( async () => {
			resume();
			await flush();
		} );
	}

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		vi.clearAllMocks();
		sendMessageStream = getAgentManager().sendMessageStream as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
		>;
		sendMessageStream.mockReset();
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	it( 'is on while reply text streams, ignoring keep-alives, and clears the stale progress text', async () => {
		sendMessageStream.mockImplementation( async function* () {
			yield progress;
			yield keepAlive;
			await pause();

			yield replyText;
			await pause();

			yield toolCall;
			await pause();

			yield finalUpdate;
		} );
		await renderHarness( true );

		let sending!: Promise< void >;
		await act( async () => {
			sending = chat.onSubmit( 'Make it orange' );
			await flush();
		} );

		expect( chat.isReplying ).toBe( false );
		expect( chat.progressMessage ).toBe( 'Checking how the changes look…' );

		await step();

		expect( chat.isReplying ).toBe( true );
		expect( chat.progressMessage ).toBeNull();

		await step();

		expect( chat.isReplying ).toBe( false );

		await act( async () => {
			resume();
			await sending;
		} );
	} );

	it( 'is unset between turns and starts each turn off, even after a turn stopped mid-reply', async () => {
		sendMessageStream.mockImplementationOnce( async function* () {
			yield replyText;
			throw Object.assign( new Error( 'Stopped' ), { name: 'AbortError' } );
		} );
		sendMessageStream.mockImplementationOnce( async function* () {
			await pause();

			yield finalUpdate;
		} );
		await renderHarness( true );

		await act( async () => {
			await chat.onSubmit( 'Make it red' );
		} );

		expect( chat.isReplying ).toBeUndefined();

		let sending!: Promise< void >;
		await act( async () => {
			sending = chat.onSubmit( 'Make it orange' );
			await flush();
		} );

		expect( chat.isReplying ).toBe( false );

		await act( async () => {
			resume();
			await sending;
		} );
	} );

	it( 'changes nothing without `trackReplying`', async () => {
		sendMessageStream.mockImplementation( async function* () {
			yield progress;
			yield replyText;
			await pause();

			yield finalUpdate;
		} );
		await renderHarness();

		let sending!: Promise< void >;
		await act( async () => {
			sending = chat.onSubmit( 'Make it orange' );
			await flush();
		} );

		expect( chat.isReplying ).toBeUndefined();
		expect( chat.progressMessage ).toBe( 'Checking how the changes look…' );

		await act( async () => {
			resume();
			await sending;
		} );
	} );
} );
