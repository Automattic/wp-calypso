import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi, type MockedFunction } from 'vitest';
import { getAgentManager } from '../agentManager';
import { type UseAgentChatReturn, useAgentChat } from '../useAgentChat';
import type { TaskUpdate } from '../../client/types/index';

// Required for React 18's act() in jsdom.
( globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean } ).IS_REACT_ACT_ENVIRONMENT = true;

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

function HookHarness( props: {
	credentials?: RequestCredentials;
	onReady?: ( onSubmit: UseAgentChatReturn[ 'onSubmit' ] ) => void;
	onTaskUpdate?: ( update: TaskUpdate ) => void | Promise< void >;
} ): null {
	const { onReady, onTaskUpdate } = props;
	const chat = useAgentChat( {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agents',
		sessionId: 'test-session',
		credentials: props.credentials,
		onTaskUpdate,
	} );

	React.useEffect( () => {
		onReady?.( chat.onSubmit );
	}, [ chat.onSubmit, onReady ] );

	return null;
}

describe( 'useAgentChat — credentials pass-through', () => {
	let container: HTMLDivElement;
	let root: Root;
	let createAgent: MockedFunction< ReturnType< typeof getAgentManager >[ 'createAgent' ] >;
	let sendMessageStream: MockedFunction<
		ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
	>;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		vi.clearAllMocks();
		createAgent = getAgentManager().createAgent as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'createAgent' ]
		>;
		sendMessageStream = getAgentManager().sendMessageStream as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
		>;
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	it( "forwards credentials: 'include' to agentManager.createAgent when configured", async () => {
		await act( async () => {
			root.render( React.createElement( HookHarness, { credentials: 'include' } ) );
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

	it( 'notifies onTaskUpdate for each streamed task update', async () => {
		const updates: TaskUpdate[] = [
			{
				id: 'task-123',
				status: { state: 'working' },
				final: false,
				text: '',
				kind: 'delta',
			},
			{
				id: 'task-123',
				status: { state: 'completed' },
				final: true,
				text: '',
				kind: 'status',
			},
		];
		const onTaskUpdate = vi.fn();
		let onSubmit: UseAgentChatReturn[ 'onSubmit' ] | undefined;

		sendMessageStream.mockImplementation( async function* () {
			for ( const update of updates ) {
				yield update;
			}
		} );

		await act( async () => {
			root.render(
				React.createElement( HookHarness, {
					onReady: ( submit ) => {
						onSubmit = submit;
					},
					onTaskUpdate,
				} )
			);
		} );

		await act( async () => {
			await onSubmit?.( 'Hello' );
		} );

		expect( sendMessageStream ).toHaveBeenCalledWith( 'test-agent', 'Hello', {} );
		expect( onTaskUpdate ).toHaveBeenCalledTimes( updates.length );
		expect( onTaskUpdate ).toHaveBeenNthCalledWith( 1, updates[ 0 ] );
		expect( onTaskUpdate ).toHaveBeenNthCalledWith( 2, updates[ 1 ] );
	} );

	it( 'keeps the request observer when the config changes and uses the new observer on the next send', async () => {
		const workingUpdate: TaskUpdate = {
			id: 'site-a-task',
			status: { state: 'working' },
			final: false,
			text: '',
			kind: 'delta',
		};
		const terminalUpdate: TaskUpdate = {
			...workingUpdate,
			status: { state: 'completed' },
			final: true,
			kind: 'status',
			aiCredits: { blog_id: 123, credits_remaining: 12_000 },
		};
		const nextRequestUpdate: TaskUpdate = {
			...terminalUpdate,
			id: 'site-b-task',
			aiCredits: { blog_id: 456, credits_remaining: 7_000 },
		};
		let releaseTerminal = () => {};
		const terminalReady = new Promise< void >( ( resolve ) => {
			releaseTerminal = resolve;
		} );
		sendMessageStream
			.mockImplementationOnce( async function* () {
				yield workingUpdate;
				await terminalReady;
				yield terminalUpdate;
			} )
			.mockImplementationOnce( async function* () {
				yield nextRequestUpdate;
			} );
		const siteAObserver = vi.fn();
		const siteBObserver = vi.fn();
		let onSubmit: UseAgentChatReturn[ 'onSubmit' ] | undefined;
		const onReady = ( submit: UseAgentChatReturn[ 'onSubmit' ] ) => {
			onSubmit = submit;
		};
		await act( async () => {
			root.render( React.createElement( HookHarness, { onReady, onTaskUpdate: siteAObserver } ) );
		} );

		let pendingSubmit: Promise< void > | undefined;
		await act( async () => {
			pendingSubmit = onSubmit?.( 'Site A request' );
		} );
		expect( siteAObserver ).toHaveBeenCalledWith( workingUpdate );

		await act( async () => {
			root.render( React.createElement( HookHarness, { onReady, onTaskUpdate: siteBObserver } ) );
		} );
		await act( async () => {
			releaseTerminal();
			await pendingSubmit;
		} );

		expect( siteAObserver ).toHaveBeenCalledTimes( 2 );
		expect( siteAObserver ).toHaveBeenLastCalledWith( terminalUpdate );
		expect( siteBObserver ).not.toHaveBeenCalled();

		await act( async () => {
			await onSubmit?.( 'Site B request' );
		} );

		expect( siteAObserver ).toHaveBeenCalledTimes( 2 );
		expect( siteBObserver ).toHaveBeenCalledTimes( 1 );
		expect( siteBObserver ).toHaveBeenCalledWith( nextRequestUpdate );
	} );
} );
