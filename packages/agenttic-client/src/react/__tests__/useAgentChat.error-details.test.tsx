import React, { act } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, type MockedFunction, vi } from 'vitest';
import { AgentRequestError } from '../../client/utils/internal/errors';
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

let chat: UseAgentChatReturn | undefined;
const onSilentError = vi.fn();

function HookHarness(): null {
	chat = useAgentChat( {
		agentId: 'test-agent',
		agentUrl: 'https://example.com/agents',
		sessionId: 'test-session',
		onSilentError,
	} );
	return null;
}

const abortError = ( fields: Record< string, unknown > = {} ) =>
	Object.assign( new Error( 'The operation was aborted.' ), { name: 'AbortError', ...fields } );

const taskUpdate = ( state: TaskUpdate[ 'status' ][ 'state' ], final: boolean ): TaskUpdate => ( {
	id: 'task-1',
	status: { state },
	final,
	text: '',
} );

describe( 'useAgentChat — error details', () => {
	let container: HTMLDivElement;
	let root: Root;
	let sendMessageStream: MockedFunction<
		ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
	>;

	const failSendWith = ( error: Error ) => {
		// The hook consumes the return value with `for await`.
		// eslint-disable-next-line require-yield
		sendMessageStream.mockImplementation( async function* () {
			throw error;
		} );
	};

	const send = async () => {
		await act( async () => {
			await chat?.onSubmit( 'hello' ).catch( () => {} );
		} );
	};

	beforeEach( async () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
		vi.clearAllMocks();
		sendMessageStream = getAgentManager().sendMessageStream as MockedFunction<
			ReturnType< typeof getAgentManager >[ 'sendMessageStream' ]
		>;
		await act( async () => {
			root.render( React.createElement( HookHarness ) );
		} );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
		chat = undefined;
	} );

	it( 'keeps the status and code of a failed request beside its message', async () => {
		failSendWith(
			new AgentRequestError( 'HTTP error! status: 503', { status: 503, code: 'upstream_down' } )
		);

		await send();

		expect( chat?.error ).toBe( 'HTTP error! status: 503' );
		expect( chat?.errorDetails ).toEqual( {
			name: 'AgentRequestError',
			status: 503,
			code: 'upstream_down',
		} );
	} );

	it( 'keeps a fetch failure’s name', async () => {
		failSendWith( new TypeError( 'Load failed' ) );

		await send();

		expect( chat?.errorDetails ).toEqual( { name: 'TypeError' } );
	} );

	it( 'shows nothing for a timed-out request, but reports it', async () => {
		failSendWith( abortError( { timedOut: true } ) );

		await send();

		expect( chat?.error ).toBeNull();
		expect( chat?.errorDetails ).toBeNull();
		expect( onSilentError ).toHaveBeenCalledWith( { name: 'AbortError', timedOut: true } );
	} );

	it( 'shows nothing for a stream that ends mid-turn, but reports it', async () => {
		sendMessageStream.mockImplementation( async function* () {
			yield taskUpdate( 'working', false );
		} );

		await send();

		expect( chat?.error ).toBeNull();
		expect( chat?.isProcessing ).toBe( false );
		expect( onSilentError ).toHaveBeenCalledWith( { name: 'StreamIncompleteError' } );
	} );

	it( 'reports nothing for a completed turn', async () => {
		sendMessageStream.mockImplementation( async function* () {
			yield taskUpdate( 'working', false );
			yield taskUpdate( 'completed', true );
		} );

		await send();

		expect( onSilentError ).not.toHaveBeenCalled();
	} );

	it( 'reports nothing for a turn paused on a client-side tool call', async () => {
		sendMessageStream.mockImplementation( async function* () {
			yield taskUpdate( 'input-required', false );
		} );

		await send();

		expect( onSilentError ).not.toHaveBeenCalled();
	} );

	it( 'clears the details with the error on the next send', async () => {
		failSendWith( new AgentRequestError( 'HTTP error! status: 503', { status: 503 } ) );
		await send();

		sendMessageStream.mockImplementation( async function* () {
			yield taskUpdate( 'completed', true );
		} );
		await send();

		expect( chat?.error ).toBeNull();
		expect( chat?.errorDetails ).toBeNull();
		expect( onSilentError ).not.toHaveBeenCalled();
	} );

	it( 'shows nothing for a cancelled request', async () => {
		failSendWith( abortError() );

		await send();

		expect( chat?.error ).toBeNull();
		expect( chat?.errorDetails ).toBeNull();
		expect( onSilentError ).not.toHaveBeenCalled();
	} );
} );
