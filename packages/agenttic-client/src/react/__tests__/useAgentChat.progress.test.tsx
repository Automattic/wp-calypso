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

let latest: UseAgentChatReturn | undefined;

function HookHarness(): null {
	latest = useAgentChat( {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agents',
		sessionId: 'test-session',
	} );

	return null;
}

const flushRender = () => new Promise( ( resolve ) => setTimeout( resolve, 0 ) );

describe( 'useAgentChat — progress label', () => {
	let container: HTMLDivElement;
	let root: Root;
	let sendMessageStream: MockedFunction<
		ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
	>;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		vi.clearAllMocks();
		sendMessageStream = getAgentManager().sendMessageStream as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
		>;
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
		latest = undefined;
	} );

	it( 'drops the progress label once answer text starts streaming', async () => {
		let sendAnswerText = () => {};
		let endStream = () => {};
		const answerTextReleased = new Promise< void >( ( resolve ) => ( sendAnswerText = resolve ) );
		const streamEnded = new Promise< void >( ( resolve ) => ( endStream = resolve ) );

		sendMessageStream.mockImplementation( async function* () {
			yield {
				id: 'task-1',
				status: { state: 'working' },
				final: false,
				text: '',
				progressMessage: 'Checking which products are low on stock.',
				progressPhase: 'commentary',
				kind: 'status',
			} as TaskUpdate;
			await answerTextReleased;

			yield {
				id: 'task-1',
				status: { state: 'working' },
				final: false,
				text: 'Two products',
				kind: 'delta',
			} as TaskUpdate;
			await streamEnded;
		} );

		await act( async () => {
			root.render( React.createElement( HookHarness ) );
		} );

		let submitted: Promise< void > | undefined;
		await act( async () => {
			submitted = latest?.onSubmit( 'Which products are low on stock?' );
			await flushRender();
		} );
		expect( latest?.progressMessage ).toBe( 'Checking which products are low on stock.' );
		expect( latest?.progressPhase ).toBe( 'commentary' );

		await act( async () => {
			sendAnswerText();
			await flushRender();
		} );
		expect( latest?.progressMessage ).toBeNull();
		expect( latest?.progressPhase ).toBeNull();

		await act( async () => {
			endStream();
			await submitted;
		} );
	} );
} );
