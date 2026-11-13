import React, { act } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { getAgentManager } from '../agentManager';
import { useAgentChat, type UseAgentChatReturn } from '../useAgentChat';
import type { TaskUpdate } from '../../client/types/index';

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

function HookHarness( props: { onChange: ( chat: UseAgentChatReturn ) => void } ): null {
	const chat = useAgentChat( {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agents',
		sessionId: 'test-session',
	} );

	props.onChange( chat );

	return null;
}

describe( 'useAgentChat — action approvals', () => {
	let container: HTMLDivElement;
	let root: Root;
	let chat: UseAgentChatReturn | undefined;
	let sendMessageStream: MockedFunction<
		ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
	>;

	beforeEach( async () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		vi.clearAllMocks();
		sendMessageStream = getAgentManager().sendMessageStream as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
		>;
		// The hook consumes the return value with `for await`.
		sendMessageStream.mockImplementation( async function* () {} );

		await act( async () => {
			root.render(
				React.createElement( HookHarness, {
					onChange: ( current ) => {
						chat = current;
					},
				} )
			);
		} );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	describe( 'data messages', () => {
		const decision = { approvalDecision: { proposalId: 123, decision: 'allow' } };

		it( 'sends one data part and no text, left out of later turns’ history', async () => {
			await act( async () => {
				await chat?.onSubmit( '', { type: 'data', data: decision } );
			} );

			expect( sendMessageStream ).toHaveBeenCalledTimes( 1 );
			const [ agentKey, , options ] = sendMessageStream.mock.calls[ 0 ];
			expect( agentKey ).toBe( 'test-agent' );
			expect( options?.excludeFromHistory ).toBe( true );
			expect( options?.message ).toMatchObject( {
				role: 'user',
				parts: [ { type: 'data', data: decision } ],
			} );
			expect( options?.message?.parts ).toHaveLength( 1 );
		} );

		it( 'shows no user message while its reply streams', async () => {
			let finishStream = () => {};
			// A stream that yields nothing until it ends.
			// eslint-disable-next-line require-yield
			sendMessageStream.mockImplementation( async function* () {
				await new Promise< void >( ( resolve ) => {
					finishStream = resolve;
				} );
			} );
			let submission: Promise< void > | undefined;

			await act( async () => {
				submission = chat?.onSubmit( '', { type: 'data', data: decision } );
			} );

			expect( chat?.messages ).toEqual( [] );

			await act( async () => {
				finishStream();
				await submission;
			} );
		} );

		it( 'requires the data', async () => {
			await expect( chat?.onSubmit( '', { type: 'data' } ) ).rejects.toThrow(
				'`data` is required'
			);
			expect( sendMessageStream ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'a held call', () => {
		const approvalRequestUpdate: TaskUpdate = {
			id: 'task-1',
			status: {
				state: 'auth-required',
				final: true,
				message: {
					role: 'agent',
					kind: 'message',
					messageId: 'approval-message',
					parts: [
						{ type: 'text', text: 'This action needs your approval: Uninstall plugin.' },
						{
							type: 'data',
							data: { approvalRequest: { proposalId: 123, toolCallId: 'call-1' } },
						},
					],
				},
			},
			final: true,
			text: 'This action needs your approval: Uninstall plugin.',
			kind: 'status',
		};

		it( 'ends the turn', async () => {
			let releaseStream = () => {};
			const streamReleased = new Promise< void >( ( resolve ) => {
				releaseStream = resolve;
			} );
			sendMessageStream.mockImplementation( async function* () {
				await streamReleased;
				yield approvalRequestUpdate;
			} );
			let submission: Promise< void > | undefined;

			await act( async () => {
				submission = chat?.onSubmit( 'Uninstall Hello Dolly' );
			} );
			expect( chat?.isProcessing ).toBe( true );

			await act( async () => {
				releaseStream();
				await submission;
			} );

			expect( chat?.isProcessing ).toBe( false );
		} );

		it( 'keeps the reply streamed before it as its own message', async () => {
			const preamble = 'Sure.';
			sendMessageStream.mockImplementation( async function* () {
				yield {
					id: 'task-1',
					status: { state: 'working' },
					final: false,
					text: preamble,
					kind: 'delta',
					delta: { deltaType: 'content', content: preamble },
				} as TaskUpdate;
				yield approvalRequestUpdate;
			} );

			await act( async () => {
				await chat?.onSubmit( 'Uninstall Hello Dolly' );
			} );

			const agentTexts = chat?.messages
				.filter( ( message ) => message.role === 'agent' )
				.map( ( message ) => message.content[ 0 ]?.text );
			expect( agentTexts ).toEqual( [
				preamble,
				'This action needs your approval: Uninstall plugin.',
			] );
			expect(
				chat?.messages.find( ( message ) => message.id === 'approval-message' )
			).toBeTruthy();
		} );
	} );
} );
