/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import type { Message } from '@automattic/agenttic-client';

const mockIsTurnInFlight = jest.fn( () => false );
const isUnresolved = ( message: Message ) =>
	message.metadata?.deliveryStatus === 'pending' ||
	message.metadata?.deliveryStatus === 'streaming';
const text = ( message: Message ) =>
	message.parts.map( ( part ) => ( part as { text: string } ).text ).join( '' );

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getUnresolvedMessages: jest.fn( ( messages: Message[] ) => messages.filter( isUnresolved ) ),
		messageTextContent: ( message: Message ) =>
			message.parts.map( ( part ) => ( part as { text: string } ).text ).join( '' ),
		// Mimics the real primitive: a pending turn the server has no copy of
		// (by text) comes back appended as failed.
		reconcileWithServer: jest.fn( async ( messages: Message[], fetchServer ) => {
			const server: Message[] | null = await fetchServer();
			const serverTexts = ( server ?? [] ).filter( ( m ) => m.role === 'user' ).map( text );
			const failed = messages
				.filter( isUnresolved )
				.filter( ( m ) => ! serverTexts.includes( text( m ) ) )
				.map( ( m ) => ( { ...m, metadata: { ...m.metadata, deliveryStatus: 'failed' } } ) );
			return [ ...( server ?? [] ), ...failed ];
		} ),
		loadConversation: jest.fn(),
		loadChatFromServer: jest.fn(),
		getAgentManager: jest.fn( () => ( { isTurnInFlight: mockIsTurnInFlight } ) ),
	} ),
	{ virtual: true }
);

const mockInvalidateQueries = jest.fn();
let mockProbe: { data?: { messages: Message[] }; dataUpdatedAt: number };
let mockQueryOptions: Record< string, any >;

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn( ( options ) => {
		mockQueryOptions = options;
		return mockProbe;
	} ),
	useQueryClient: () => ( { invalidateQueries: mockInvalidateQueries } ),
} ) );

jest.mock( '../../utils/conversation-bot-id', () => ( {
	getConversationBotId: ( agentId: string ) => agentId,
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( {
		agentConfig: { agentId: 'wpcom-agent', sessionId: 'session-1', authProvider: jest.fn() },
	} ),
} ) );

import { loadChatFromServer, loadConversation } from '@automattic/agenttic-client';
import { act, renderHook } from '@testing-library/react';
import useReplyRecovery, { LOST_AFTER_MS, UNANSWERED_AFTER_MS } from '../use-reply-recovery';

const message = (
	role: 'user' | 'agent',
	content: string,
	serverId?: number,
	deliveryStatus?: string
): Message =>
	( {
		role,
		kind: 'message',
		messageId: `m-${ role }-${ content }`,
		parts: [ { type: 'text', text: content } ],
		metadata: { serverId, deliveryStatus },
	} ) as unknown as Message;

const previousAnswer = message( 'agent', 'Earlier answer', 10 );
const questionOnServer = message( 'user', 'How many orders?', 11 );
const pendingQuestion = message( 'user', 'How many orders?', undefined, 'pending' );

const flush = async () => {
	await act( async () => {
		await Promise.resolve();
	} );
};

interface SetupOptions {
	stored: Message[];
	hydrated: Message[];
	enabled?: boolean;
}

async function setup( { stored, hydrated, enabled = true }: SetupOptions ) {
	( loadConversation as jest.Mock ).mockResolvedValue( { messages: stored } );
	mockProbe = { data: undefined, dataUpdatedAt: 0 };
	const sendRetry = jest.fn().mockResolvedValue( true );
	const hook = renderHook(
		( props: { enabled: boolean } ) =>
			useReplyRecovery( {
				hydratedMessages: hydrated,
				enabled: props.enabled,
				sendRetry,
			} ),
		{ initialProps: { enabled } }
	);
	await flush();
	await flush();
	// Feeds the probe query one result, as its refetch would.
	const probeResult = async ( messages: Message[] ) => {
		mockProbe = { data: { messages }, dataUpdatedAt: mockProbe.dataUpdatedAt + 1 };
		hook.rerender( { enabled } );
		await flush();
		await flush();
	};
	return { ...hook, sendRetry, probeResult };
}

describe( 'useReplyRecovery', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockIsTurnInFlight.mockReturnValue( false );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'stays idle when the conversation ends on an answered turn', async () => {
		const { result } = await setup( { stored: [], hydrated: [ previousAnswer ] } );

		expect( result.current.notice ).toBeUndefined();
		expect( mockQueryOptions.enabled ).toBe( false );
	} );

	it( 'waits in the notice slot and probes page 1 without tool messages', async () => {
		const { result } = await setup( {
			stored: [],
			hydrated: [ previousAnswer, questionOnServer ],
		} );

		expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );
		expect( result.current.notice?.dismissible ).toBe( false );
		expect( mockQueryOptions.enabled ).toBe( true );
		expect( mockQueryOptions.queryKey ).toEqual( [ 'agents-manager-reply-probe', 'session-1' ] );

		( loadChatFromServer as jest.Mock ).mockResolvedValue( { messages: [] } );
		await mockQueryOptions.queryFn();
		expect( loadChatFromServer ).toHaveBeenCalledWith(
			'session-1',
			expect.any( Object ),
			1,
			50,
			false
		);
	} );

	it( 'rehydrates once, after a reply is stable for a second probe', async () => {
		const { result, probeResult } = await setup( {
			stored: [],
			hydrated: [ previousAnswer, questionOnServer ],
		} );
		const reply = message( 'agent', 'You have 12.', 12 );

		await probeResult( [ previousAnswer, questionOnServer ] );
		await probeResult( [ previousAnswer, questionOnServer, reply ] );
		expect( mockInvalidateQueries ).not.toHaveBeenCalled();

		await probeResult( [ previousAnswer, questionOnServer, reply ] );
		expect( mockInvalidateQueries ).toHaveBeenCalledTimes( 1 );
		expect( mockInvalidateQueries ).toHaveBeenCalledWith( {
			queryKey: [ 'agents-manager-conversation', 'session-1' ],
			exact: true,
		} );
		expect( result.current.notice ).toBeUndefined();
		expect( mockQueryOptions.enabled ).toBe( false );
	} );

	it( 'does not rehydrate over a turn that started meanwhile', async () => {
		const { probeResult } = await setup( {
			stored: [],
			hydrated: [ previousAnswer, questionOnServer ],
		} );
		const reply = message( 'agent', 'You have 12.', 12 );
		mockIsTurnInFlight.mockReturnValue( true );

		await probeResult( [ previousAnswer, questionOnServer, reply ] );
		await probeResult( [ previousAnswer, questionOnServer, reply ] );

		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
	} );

	it( 'stops polling when the reply was already in the first probe', async () => {
		const reply = message( 'agent', 'You have 12.', 12 );
		const { result, probeResult } = await setup( {
			stored: [ pendingQuestion ],
			hydrated: [ previousAnswer, questionOnServer, reply ],
		} );

		await probeResult( [ previousAnswer, questionOnServer, reply ] );

		expect( result.current.notice ).toBeUndefined();
		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
		expect( mockQueryOptions.enabled ).toBe( false );
	} );

	it( 'gives up on a question the server never received and offers a retry', async () => {
		const { result, sendRetry, probeResult } = await setup( {
			stored: [ pendingQuestion ],
			hydrated: [ previousAnswer ],
		} );
		await probeResult( [ previousAnswer ] );

		await act( async () => {
			jest.advanceTimersByTime( LOST_AFTER_MS );
		} );
		await flush();

		expect( result.current.notice?.message ).toBe(
			"Your last question didn't reach the assistant."
		);
		expect( mockQueryOptions.enabled ).toBe( false );

		await act( async () => {
			await ( result.current.notice?.action?.onClick as () => Promise< void > )();
		} );
		expect( sendRetry ).toHaveBeenCalledWith( 'How many orders?' );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'waits for the reply while the server has the question', async () => {
		const { result, sendRetry, probeResult } = await setup( {
			stored: [ pendingQuestion ],
			hydrated: [ previousAnswer, questionOnServer ],
		} );
		await probeResult( [ previousAnswer, questionOnServer ] );

		await act( async () => {
			jest.advanceTimersByTime( LOST_AFTER_MS + 1000 );
		} );
		await flush();
		expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );

		await act( async () => {
			jest.advanceTimersByTime( UNANSWERED_AFTER_MS );
		} );
		expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );
		expect( mockQueryOptions.enabled ).toBe( false );

		await act( async () => {
			await ( result.current.notice?.action?.onClick as () => Promise< void > )();
		} );
		expect( sendRetry ).toHaveBeenCalledWith( 'How many orders?' );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'keeps the notice when the retry could not be sent', async () => {
		const { result, sendRetry, probeResult } = await setup( {
			stored: [],
			hydrated: [ previousAnswer, questionOnServer ],
		} );
		sendRetry.mockResolvedValue( false );
		await probeResult( [ previousAnswer, questionOnServer ] );
		await act( async () => {
			jest.advanceTimersByTime( UNANSWERED_AFTER_MS );
		} );

		await act( async () => {
			await ( result.current.notice?.action?.onClick as () => Promise< void > )();
		} );

		expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );
	} );

	it( 'stops when the merchant sends or a turn goes in flight, and never restarts', async () => {
		const { result, rerender } = await setup( {
			stored: [],
			hydrated: [ previousAnswer, questionOnServer ],
		} );
		expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );

		rerender( { enabled: false } );
		expect( result.current.notice ).toBeUndefined();
		expect( mockQueryOptions.enabled ).toBe( false );

		rerender( { enabled: true } );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'does not read the local store or wait when disabled', async () => {
		const { result } = await setup( {
			stored: [],
			hydrated: [ previousAnswer, questionOnServer ],
			enabled: false,
		} );

		expect( loadConversation ).not.toHaveBeenCalled();
		expect( result.current.notice ).toBeUndefined();
	} );
} );
