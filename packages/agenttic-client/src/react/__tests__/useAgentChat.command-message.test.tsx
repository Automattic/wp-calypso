import React, { act } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { getAgentManager } from '../agentManager';
import { useAgentChat, type UseAgentChatReturn } from '../useAgentChat';

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

describe( 'useAgentChat — command messages', () => {
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

	it( 'sends the command as plain text, left out of later turns’ history', async () => {
		await act( async () => {
			await chat?.onSubmit( '/approve 123', { type: 'command' } );
		} );

		expect( sendMessageStream ).toHaveBeenCalledWith( 'test-agent', '/approve 123', {
			excludeFromHistory: true,
		} );
	} );

	it( 'shows no user message for a command while its reply streams', async () => {
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
			submission = chat?.onSubmit( '/decline 123', { type: 'command' } );
		} );

		expect( chat?.messages ).toEqual( [] );

		await act( async () => {
			finishStream();
			await submission;
		} );
	} );
} );
