// @vitest-environment jsdom
import React, { act } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '../../client/index';
import type {
	Client,
	Message as ClientMessage,
	TaskUpdate,
} from '../../client/types/index';
import { getAgentManager } from '../agentManager';
import { useAgentChat } from '../useAgentChat';
import type { UIMessage, UseAgentChatReturn } from '../useAgentChat';

vi.mock( '../../client/index', async ( importOriginal ) => {
	const actual =
		await importOriginal< typeof import('../../client/index') >();

	return {
		...actual,
		createClient: vi.fn(),
	};
} );

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

const clientMessage = (
	messageId: string,
	role: 'user' | 'agent',
	text: string,
	timestamp: number
): ClientMessage => ( {
	messageId,
	role,
	kind: 'message',
	parts: [ { type: 'text', text } ],
	metadata: { timestamp },
} );

let latestHookValue: UseAgentChatReturn | null = null;

function HookHarness( { registerActions = false } = {} ): null {
	const chat = useAgentChat( {
		agentId: 'regenerate-action-test',
		agentUrl: 'https://example.com/agents',
		sessionId: 'regenerate-action-test-session',
	} );
	const { getRegenerateHandler, registerMessageActions } = chat;

	React.useEffect( () => {
		if ( ! registerActions ) {
			return;
		}

		registerMessageActions( {
			id: 'test-regenerate',
			actions: ( message: UIMessage ) => {
				const onRegenerate = getRegenerateHandler( message );

				return onRegenerate
					? [
							{
								id: 'regenerate',
								label: 'Regenerate',
								onClick: onRegenerate,
							},
					  ]
					: [];
			},
		} );
	}, [ getRegenerateHandler, registerActions, registerMessageActions ] );

	latestHookValue = chat;

	return null;
}

describe( 'useAgentChat regenerate action', () => {
	let container: HTMLDivElement;
	let root: Root;
	let mockClient: Client;

	beforeEach( () => {
		getAgentManager().clear();
		sessionStorage.clear();
		mockClient = {
			sendMessage: vi.fn(),
			sendMessageStream: vi.fn(),
			continueTask: vi.fn(),
			getTask: vi.fn(),
			cancelTask: vi.fn(),
		};
		vi.mocked( createClient ).mockReturnValue( mockClient );
		latestHookValue = null;
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		getAgentManager().clear();
		sessionStorage.clear();
		latestHookValue = null;
		container.remove();
	} );

	it( 'returns a regenerate handler only for eligible agent messages', async () => {
		await act( async () => {
			root.render( <HookHarness /> );
		} );

		await act( async () => {
			await latestHookValue?.loadMessages( [
				clientMessage( 'user-1', 'user', 'Generate a title', 1 ),
				clientMessage( 'agent-1', 'agent', 'Petals and Poetry', 2 ),
			] );
		} );

		const userMessage = latestHookValue?.messages.find(
			( message ) => message.id === 'user-1'
		) as UIMessage | undefined;
		const agentMessage = latestHookValue?.messages.find(
			( message ) => message.id === 'agent-1'
		) as UIMessage | undefined;

		// Opt-in: the hook never attaches the action itself.
		expect( agentMessage?.actions ).toBeUndefined();
		expect(
			userMessage
				? latestHookValue?.getRegenerateHandler( userMessage )
				: null
		).toBeNull();

		expect(
			typeof ( agentMessage
				? latestHookValue?.getRegenerateHandler( agentMessage )
				: null )
		).toBe( 'function' );
		expect( typeof latestHookValue?.getRegenerateHandler() ).toBe(
			'function'
		);
	} );

	it( 'replaces the latest agent response when actions refresh during regenerate', async () => {
		const replacementMessage = clientMessage(
			'agent-2',
			'agent',
			'Blooming Wonders',
			Date.now() + 1
		);
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			async function* (): AsyncIterable< TaskUpdate > {
				yield {
					id: 'task-1',
					final: true,
					status: {
						state: 'completed',
						message: replacementMessage,
					},
					text: 'Blooming Wonders',
				};
			}
		);

		await act( async () => {
			root.render( <HookHarness registerActions /> );
		} );

		await act( async () => {
			await latestHookValue?.loadMessages( [
				clientMessage( 'user-1', 'user', 'Generate a title', 1 ),
				clientMessage( 'agent-1', 'agent', 'Petals and Poetry', 2 ),
			] );
		} );

		const onRegenerate = latestHookValue?.getRegenerateHandler() ?? null;

		if ( ! onRegenerate ) {
			throw new Error( 'Expected a regenerate handler' );
		}

		await act( async () => {
			await onRegenerate();
		} );

		const agentMessages = latestHookValue?.messages.filter(
			( message ) => message.role === 'agent'
		);
		const agentMessageTexts = agentMessages?.map( ( message ) =>
			message.content
				.map( ( part ) => part.text )
				.filter( Boolean )
				.join( '\n' )
		);

		expect( agentMessageTexts ).toEqual( [ 'Blooming Wonders' ] );
		expect(
			getAgentManager()
				.getConversationHistory( 'regenerate-action-test' )
				.map( ( message ) => message.messageId )
		).toEqual( [ expect.not.stringMatching( /^agent-/ ), 'agent-2' ] );
	} );

	it( 'resolves the regenerate action on a completed agent response', async () => {
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			async function* (): AsyncIterable< TaskUpdate > {
				yield {
					id: 'task-1',
					final: true,
					status: {
						state: 'completed',
						message: clientMessage(
							'agent-1',
							'agent',
							'Petals and Poetry',
							Date.now() + 1
						),
					},
					text: 'Petals and Poetry',
				};
			}
		);

		await act( async () => {
			root.render( <HookHarness registerActions /> );
		} );

		await act( async () => {
			await latestHookValue?.onSubmit( 'Generate a title' );
		} );

		const agentMessage = latestHookValue?.messages.find(
			( message ) => message.role === 'agent'
		);

		expect(
			agentMessage?.actions?.map( ( action ) => action.id )
		).toContain( 'regenerate' );
	} );

	const loadBaseConversation = async () => {
		await act( async () => {
			await latestHookValue?.loadMessages( [
				clientMessage( 'user-1', 'user', 'Generate a title', 1 ),
				clientMessage( 'agent-1', 'agent', 'Petals and Poetry', 2 ),
			] );
		} );
	};

	const clickLatestRegenerate = async () => {
		const onRegenerate = latestHookValue?.getRegenerateHandler() ?? null;

		if ( ! onRegenerate ) {
			throw new Error( 'Expected a regenerate handler' );
		}

		await act( async () => {
			await Promise.resolve( onRegenerate() ).catch( () => {} );
		} );
	};

	it( 'restores the original conversation when regenerate fails', async () => {
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			// eslint-disable-next-line require-yield
			async function* (): AsyncIterable< TaskUpdate > {
				throw new Error( 'network down' );
			}
		);

		await act( async () => {
			root.render( <HookHarness registerActions /> );
		} );
		await loadBaseConversation();
		await clickLatestRegenerate();

		expect(
			getAgentManager()
				.getConversationHistory( 'regenerate-action-test' )
				.map( ( message ) => message.messageId )
		).toEqual( [ 'user-1', 'agent-1' ] );

		const agentTexts = latestHookValue?.messages
			.filter( ( message ) => message.role === 'agent' )
			.map( ( message ) =>
				message.content
					.map( ( part ) => part.text )
					.filter( Boolean )
					.join( '\n' )
			);

		expect( agentTexts ).toEqual( [ 'Petals and Poetry' ] );
		expect( latestHookValue?.error ).toBe( 'network down' );
		expect( latestHookValue?.isProcessing ).toBe( false );
	} );

	it( 'clears state without an error when regenerate is aborted', async () => {
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			// eslint-disable-next-line require-yield
			async function* (): AsyncIterable< TaskUpdate > {
				const abortError = new Error( 'Aborted' );
				abortError.name = 'AbortError';
				throw abortError;
			}
		);

		await act( async () => {
			root.render( <HookHarness registerActions /> );
		} );
		await loadBaseConversation();
		await clickLatestRegenerate();

		expect(
			getAgentManager()
				.getConversationHistory( 'regenerate-action-test' )
				.map( ( message ) => message.messageId )
		).toEqual( [ 'user-1', 'agent-1' ] );
		expect( latestHookValue?.error ).toBeNull();
		expect( latestHookValue?.isProcessing ).toBe( false );
	} );

	it( 'still surfaces the failure when restoring the conversation also fails', async () => {
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			// eslint-disable-next-line require-yield
			async function* (): AsyncIterable< TaskUpdate > {
				throw new Error( 'network down' );
			}
		);

		await act( async () => {
			root.render( <HookHarness registerActions /> );
		} );
		await loadBaseConversation();

		// Simulate storage failing while restoring the original conversation.
		const agentManager = getAgentManager();
		const originalReplace =
			agentManager.replaceMessages.bind( agentManager );
		let failRestore = false;
		vi.spyOn( agentManager, 'replaceMessages' ).mockImplementation(
			async ( key: string, messages: ClientMessage[] ) => {
				if (
					failRestore &&
					messages.some( ( message ) => message.role === 'agent' )
				) {
					throw new Error( 'storage failed' );
				}
				return originalReplace( key, messages );
			}
		);
		failRestore = true;

		await clickLatestRegenerate();

		expect( latestHookValue?.error ).toBe( 'network down' );
		expect( latestHookValue?.isProcessing ).toBe( false );
	} );
} );
