// @vitest-environment jsdom
import { act } from 'react';
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

function HookHarness(): null {
	latestHookValue = useAgentChat( {
		agentId: 'ui-only-test',
		agentUrl: 'https://example.com/agents',
		sessionId: 'ui-only-test-session',
	} );

	return null;
}

// End-to-end coverage of the default reconcile path every message takes.
describe( 'useAgentChat normal send reconcile', () => {
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

	it( 'preserves a tool-injected UI-only message through a normal send', async () => {
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			async function* (): AsyncIterable< TaskUpdate > {
				yield {
					id: 'task-1',
					final: true,
					status: {
						state: 'completed',
						message: clientMessage(
							'agent-2',
							'agent',
							'Second answer',
							Date.now() + 2
						),
					},
					text: 'Second answer',
				};
			}
		);

		await act( async () => {
			root.render( <HookHarness /> );
		} );

		await act( async () => {
			await latestHookValue?.loadMessages( [
				clientMessage( 'user-1', 'user', 'First question', 1 ),
				clientMessage( 'agent-1', 'agent', 'First answer', 2 ),
			] );
		} );

		// A tool injects a message that lives only in the UI, never in the
		// agent's client history.
		const toolInjectedMessage: UIMessage = {
			id: 'tool-injected-1',
			role: 'agent',
			content: [ { type: 'text', text: 'Injected by a tool' } ],
			timestamp: Date.now() + 1,
			archived: false,
			showIcon: true,
		};

		await act( async () => {
			latestHookValue?.addMessage( toolInjectedMessage );
		} );

		await act( async () => {
			await latestHookValue?.onSubmit( 'Second question' );
		} );

		const messageIds = latestHookValue?.messages.map(
			( message ) => message.id
		);

		// The tool-injected message survives the reconcile, alongside the new
		// server response.
		expect( messageIds ).toContain( 'tool-injected-1' );
		expect( messageIds ).toContain( 'agent-2' );
		expect( latestHookValue?.isProcessing ).toBe( false );
	} );

	it( 'keeps the optimistic user message when actions re-register mid-send', async () => {
		// A consumer that re-registers a message action while a send is in
		// flight must not drop the optimistic user message. The drop is
		// transient — the server echo restores it on completion — so this asserts
		// mid-send, holding the stream open before the final response.
		let releaseFinal: () => void = () => {};
		const finalGate = new Promise< void >( ( resolve ) => {
			releaseFinal = resolve;
		} );
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			async function* (): AsyncIterable< TaskUpdate > {
				yield {
					id: 'task-1',
					final: false,
					kind: 'delta',
					status: { state: 'working' },
					text: 'Second',
				};
				await finalGate;
				yield {
					id: 'task-1',
					final: true,
					status: {
						state: 'completed',
						message: clientMessage(
							'agent-2',
							'agent',
							'Second answer',
							Date.now() + 2
						),
					},
					text: 'Second answer',
				};
			}
		);

		await act( async () => {
			root.render( <HookHarness /> );
		} );

		// Non-empty history: the re-transform effect skips an empty conversation.
		await act( async () => {
			await latestHookValue?.loadMessages( [
				clientMessage( 'user-1', 'user', 'First question', 1 ),
				clientMessage( 'agent-1', 'agent', 'First answer', 2 ),
			] );
		} );

		// Start the send; it parks at the gate after opening a streaming bubble.
		let sendDone: Promise< void > | undefined;
		await act( async () => {
			sendDone = latestHookValue?.onSubmit( 'Second question' );
			// Let the stream reach the gate (optimistic message + first delta).
			for ( let i = 0; i < 5; i++ ) {
				await new Promise( ( resolve ) => setTimeout( resolve, 0 ) );
			}
		} );

		// Re-register mid-send, while isSendingRef is true.
		await act( async () => {
			latestHookValue?.registerMessageActions( {
				id: 'mid-send-action',
				actions: () => [],
			} );
		} );

		const midSendCopies = latestHookValue?.messages.filter(
			( message ) =>
				message.role === 'user' &&
				message.content.some(
					( part ) => part.text === 'Second question'
				)
		);

		expect( midSendCopies ).toHaveLength( 1 );

		await act( async () => {
			releaseFinal();
			await sendDone;
		} );
	} );

	it( 'does not duplicate the user message when actions re-register after a streaming send', async () => {
		// The "double user message" report: a streaming send keeps the optimistic
		// user message while the server echoes it into history under a new id. A
		// later re-registration must not surface both copies.
		vi.mocked( mockClient.sendMessageStream ).mockImplementation(
			async function* (): AsyncIterable< TaskUpdate > {
				// A non-final delta opens a streaming bubble, so completion takes
				// the path that keeps the optimistic user message.
				yield {
					id: 'task-1',
					final: false,
					kind: 'delta',
					status: { state: 'working' },
					text: 'Second',
				};
				yield {
					id: 'task-1',
					final: true,
					status: {
						state: 'completed',
						message: clientMessage(
							'agent-2',
							'agent',
							'Second answer',
							Date.now() + 2
						),
					},
					text: 'Second answer',
				};
			}
		);

		await act( async () => {
			root.render( <HookHarness /> );
		} );

		await act( async () => {
			await latestHookValue?.loadMessages( [
				clientMessage( 'user-1', 'user', 'First question', 1 ),
				clientMessage( 'agent-1', 'agent', 'First answer', 2 ),
			] );
		} );

		await act( async () => {
			await latestHookValue?.onSubmit( 'Second question' );
		} );

		// A re-registration after the send re-runs the re-transform effect.
		await act( async () => {
			latestHookValue?.registerMessageActions( {
				id: 'post-send-action',
				actions: () => [],
			} );
		} );

		const userCopies = latestHookValue?.messages.filter(
			( message ) =>
				message.role === 'user' &&
				message.content.some(
					( part ) => part.text === 'Second question'
				)
		);

		expect( userCopies ).toHaveLength( 1 );
	} );
} );
