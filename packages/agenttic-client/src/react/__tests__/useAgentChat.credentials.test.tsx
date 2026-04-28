import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
	type MockedFunction,
} from 'vitest';
import { useAgentChat } from '../useAgentChat';
import { getAgentManager } from '../agentManager';

// Required for React 18's act() to work in jsdom — without it React logs a
// "current testing environment is not configured to support act" warning.
(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

vi.mock( '../agentManager', () => {
	const createAgent = vi.fn().mockResolvedValue( {} );
	const agentManager = {
		createAgent,
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

function HookHarness( props: { credentials?: RequestCredentials } ): null {
	useAgentChat( {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agents',
		sessionId: 'test-session',
		credentials: props.credentials,
	} );
	return null;
}

describe( 'useAgentChat — credentials pass-through', () => {
	let container: HTMLDivElement;
	let root: Root;
	let createAgent: MockedFunction<
		ReturnType< typeof getAgentManager >[ 'createAgent' ]
	>;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		createAgent = getAgentManager().createAgent as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'createAgent' ]
		>;
		createAgent.mockClear();
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	it( "forwards credentials: 'include' to agentManager.createAgent when configured", async () => {
		await act( async () => {
			root.render(
				React.createElement( HookHarness, { credentials: 'include' } )
			);
		} );

		expect( createAgent ).toHaveBeenCalledTimes( 1 );
		const [ , managerConfig ] = createAgent.mock.calls[ 0 ];
		expect( managerConfig.credentials ).toBe( 'include' );
	} );

	it( 'forwards credentials as undefined when not configured', async () => {
		await act( async () => {
			root.render( React.createElement( HookHarness, {} ) );
		} );

		expect( createAgent ).toHaveBeenCalledTimes( 1 );
		const [ , managerConfig ] = createAgent.mock.calls[ 0 ];
		expect( managerConfig.credentials ).toBeUndefined();
	} );
} );
