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

function HookHarness( props: {
	onReady?: ( onSubmit: UseAgentChatReturn[ 'onSubmit' ] ) => void;
} ): null {
	const { onReady } = props;
	const chat = useAgentChat( {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agents',
		sessionId: 'test-session',
	} );

	React.useEffect( () => {
		onReady?.( chat.onSubmit );
	}, [ chat.onSubmit, onReady ] );

	return null;
}

describe( 'useAgentChat — send lock', () => {
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
		// The hook consumes the return value with `for await`.
		sendMessageStream.mockImplementation( async function* () {} );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	it( 'keeps accepting messages after a rejected tool result', async () => {
		let onSubmit: UseAgentChatReturn[ 'onSubmit' ] | undefined;
		await act( async () => {
			root.render(
				React.createElement( HookHarness, {
					onReady: ( submit ) => {
						onSubmit = submit;
					},
				} )
			);
		} );

		// A tool result missing its ids is rejected before anything is sent.
		await expect( onSubmit?.( 'result', { type: 'tool_result' } ) ).rejects.toThrow( /toolCallId/ );
		expect( sendMessageStream ).not.toHaveBeenCalled();

		// The rejection must not have left the send lock held: an ordinary
		// message still goes out.
		await act( async () => {
			await onSubmit?.( 'hello' );
		} );

		expect( sendMessageStream ).toHaveBeenCalledTimes( 1 );
	} );
} );
