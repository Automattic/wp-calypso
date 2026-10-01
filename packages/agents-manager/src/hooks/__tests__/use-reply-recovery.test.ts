/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import type { Message, PendingClientTools } from '@automattic/agenttic-client';

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
		// Mimics the real primitive: unresolved turns whose text occurs more
		// often locally than on the server come back appended as failed.
		reconcileWithServer: jest.fn( async ( messages: Message[], fetchServer ) => {
			const server: Message[] | null = await fetchServer();
			const unresolved = messages.filter( isUnresolved );
			const markFailed = ( message: Message ) => ( {
				...message,
				metadata: { ...message.metadata, deliveryStatus: 'failed' },
			} );
			if ( ! server || server.length === 0 ) {
				return messages.map( ( message ) =>
					isUnresolved( message ) ? markFailed( message ) : message
				);
			}
			const counts = ( list: Message[] ) => {
				const map = new Map< string, number >();
				for ( const message of list ) {
					if ( message.role !== 'user' ) {
						continue;
					}
					map.set( text( message ), ( map.get( text( message ) ) ?? 0 ) + 1 );
				}
				return map;
			};
			const extras = new Map< string, number >();
			const serverCounts = counts( server );
			for ( const [ value, localCount ] of counts( messages ) ) {
				extras.set( value, Math.max( 0, localCount - ( serverCounts.get( value ) ?? 0 ) ) );
			}
			const orphanedFailed: Message[] = [];
			for ( let i = unresolved.length - 1; i >= 0; i-- ) {
				const message = unresolved[ i ]!;
				const extra = extras.get( text( message ) ) ?? 0;
				if ( extra > 0 ) {
					extras.set( text( message ), extra - 1 );
					orphanedFailed.unshift( markFailed( message ) );
				}
			}
			return orphanedFailed.length === 0 ? server : [ ...server, ...orphanedFailed ];
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

let mockParkedNavigationCallId: string | undefined;
jest.mock( '../../utils/wp-admin-navigation-state', () => ( {
	getPendingNavigation: () =>
		mockParkedNavigationCallId ? { toolCallId: mockParkedNavigationCallId } : null,
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
import useReplyRecovery, {
	LOST_AFTER_MS,
	RESUME_AFTER_MS,
	UNANSWERED_AFTER_MS,
} from '../use-reply-recovery';
import { INTERRUPTED_TOOL_RESULT } from '../../utils/tool-call-resume';

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
	const resumeToolCalls = jest.fn().mockResolvedValue( true );
	const hook = renderHook(
		( props: { enabled: boolean } ) =>
			useReplyRecovery( {
				hydratedMessages: hydrated,
				enabled: props.enabled,
				sendRetry,
				resumeToolCalls,
			} ),
		{ initialProps: { enabled } }
	);
	await flush();
	await flush();
	// Feeds the probe query one result, as its refetch would.
	const probeResult = async ( messages: Message[], pendingClientTools?: PendingClientTools ) => {
		mockProbe = {
			data: { messages, ...( pendingClientTools && { pendingClientTools } ) },
			dataUpdatedAt: mockProbe.dataUpdatedAt + 1,
		};
		hook.rerender( { enabled } );
		await flush();
		await flush();
	};
	return { ...hook, sendRetry, resumeToolCalls, probeResult };
}

describe( 'useReplyRecovery', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		jest.clearAllMocks();
		mockIsTurnInFlight.mockReturnValue( false );
		mockParkedNavigationCallId = undefined;
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

	it( 'rehydrates when the reply lands after hydration but before the first probe', async () => {
		const reply = message( 'agent', 'You have 12.', 12 );
		const { result, probeResult } = await setup( {
			stored: [ pendingQuestion ],
			hydrated: [ previousAnswer, questionOnServer ],
		} );

		await probeResult( [ previousAnswer, questionOnServer, reply ] );
		expect( mockInvalidateQueries ).not.toHaveBeenCalled();
		expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );

		await probeResult( [ previousAnswer, questionOnServer, reply ] );
		expect( mockInvalidateQueries ).toHaveBeenCalledTimes( 1 );
		expect( result.current.notice ).toBeUndefined();
	} );

	it( 'treats a repeated question the server does not have as never arrived', async () => {
		const earlierQuestion = message( 'user', 'How many orders?', 9 );
		const { result, probeResult } = await setup( {
			stored: [ earlierQuestion, previousAnswer, pendingQuestion ],
			hydrated: [ earlierQuestion, previousAnswer ],
		} );
		await probeResult( [ earlierQuestion, previousAnswer ] );

		expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );

		await act( async () => {
			jest.advanceTimersByTime( LOST_AFTER_MS );
		} );
		await flush();

		expect( result.current.notice?.message ).toBe(
			"Your last question didn't reach the assistant."
		);
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
	describe( 'a turn paused on a browser tool', () => {
		// MySQL datetime in UTC, as the server stores it.
		const storedSecondsAgo = ( seconds: number ) =>
			new Date( Date.now() - seconds * 1000 ).toISOString().slice( 0, 19 ).replace( 'T', ' ' );
		const pendingTools = (
			state: PendingClientTools[ 'state' ],
			secondsAgo = 30
		): PendingClientTools => ( {
			state,
			calls: [
				{
					toolCallId: 'call-top',
					toolId: 'woocommerce__get_top_products',
					arguments: { limit: 5 },
					createdAt: storedSecondsAgo( secondsAgo ),
				},
			],
		} );

		const seenLongEnough = async (
			probeResult: (
				messages: Message[],
				pendingClientTools?: PendingClientTools
			) => Promise< void >
		) => {
			await probeResult( [ previousAnswer, questionOnServer ], pendingTools( 'unanswered' ) );
			await act( async () => {
				jest.advanceTimersByTime( RESUME_AFTER_MS );
			} );
			await probeResult( [ previousAnswer, questionOnServer ], pendingTools( 'unanswered' ) );
		};

		it( 'resumes the turn with an interrupted result and the calls of the turn', async () => {
			const { result, resumeToolCalls, probeResult } = await setup( {
				stored: [ pendingQuestion ],
				hydrated: [ previousAnswer, questionOnServer ],
			} );
			let finishResume: ( replied: boolean ) => void = () => {};
			resumeToolCalls.mockReturnValue( new Promise( ( resolve ) => ( finishResume = resolve ) ) );

			await seenLongEnough( probeResult );

			expect( resumeToolCalls ).toHaveBeenCalledWith(
				[
					{
						toolCallId: 'call-top',
						toolId: 'woocommerce__get_top_products',
						result: INTERRUPTED_TOOL_RESULT,
					},
				],
				[
					{
						toolCallId: 'call-top',
						toolId: 'woocommerce__get_top_products',
						arguments: { limit: 5 },
					},
				]
			);
			expect( result.current.notice?.message ).toBe( 'Picking up your last question…' );
			expect( mockQueryOptions.enabled ).toBe( false );

			await act( async () => finishResume( true ) );
			expect( result.current.notice ).toBeUndefined();
		} );

		it( 'sends the result the old page stored instead of an interrupted one', async () => {
			const storedResult = {
				role: 'agent',
				kind: 'message',
				messageId: 'm-results',
				parts: [
					{
						type: 'data',
						data: {
							toolCallId: 'call-top',
							toolId: 'woocommerce__get_top_products',
							result: { rows: 5 },
						},
					},
				],
				metadata: {},
			} as unknown as Message;
			const { resumeToolCalls, probeResult } = await setup( {
				stored: [ pendingQuestion, storedResult ],
				hydrated: [ previousAnswer, questionOnServer ],
			} );

			await seenLongEnough( probeResult );

			expect( resumeToolCalls.mock.calls[ 0 ][ 0 ][ 0 ].result ).toEqual( { rows: 5 } );
		} );

		it( 'gives the old page time to send its own result first', async () => {
			const { resumeToolCalls, probeResult } = await setup( {
				stored: [ pendingQuestion ],
				hydrated: [ previousAnswer, questionOnServer ],
			} );

			await probeResult( [ previousAnswer, questionOnServer ], pendingTools( 'unanswered', 2 ) );
			expect( resumeToolCalls ).not.toHaveBeenCalled();

			await act( async () => {
				jest.advanceTimersByTime( RESUME_AFTER_MS );
			} );
			await probeResult( [ previousAnswer, questionOnServer ], pendingTools( 'unanswered', 12 ) );
			expect( resumeToolCalls ).toHaveBeenCalledTimes( 1 );
		} );

		it.each( [ 'claimed', 'running' ] as const )(
			'keeps waiting while the turn is %s elsewhere',
			async ( state ) => {
				const { result, resumeToolCalls, probeResult } = await setup( {
					stored: [ pendingQuestion ],
					hydrated: [ previousAnswer, questionOnServer ],
				} );

				await probeResult( [ previousAnswer, questionOnServer ], pendingTools( state ) );

				expect( resumeToolCalls ).not.toHaveBeenCalled();
				expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );
			}
		);

		it( 'goes back to waiting, once, when the resume brings no reply', async () => {
			const { result, resumeToolCalls, probeResult } = await setup( {
				stored: [ pendingQuestion ],
				hydrated: [ previousAnswer, questionOnServer ],
			} );
			resumeToolCalls.mockResolvedValue( false );

			await seenLongEnough( probeResult );
			expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );

			await probeResult( [ previousAnswer, questionOnServer ], pendingTools( 'unanswered' ) );
			expect( resumeToolCalls ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'goes back to waiting when the resume loses the race', async () => {
			const { result, resumeToolCalls, probeResult } = await setup( {
				stored: [ pendingQuestion ],
				hydrated: [ previousAnswer, questionOnServer ],
			} );
			resumeToolCalls.mockRejectedValue(
				new Error( 'Streaming error: This tool result was already received.' )
			);

			await seenLongEnough( probeResult );

			expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );
		} );

		it( 'leaves a parked wp-admin-navigate call to the navigation continuation', async () => {
			mockParkedNavigationCallId = 'call-top';
			const { resumeToolCalls, probeResult } = await setup( {
				stored: [ pendingQuestion ],
				hydrated: [ previousAnswer, questionOnServer ],
			} );

			await probeResult( [ previousAnswer, questionOnServer ], pendingTools( 'unanswered' ) );

			expect( resumeToolCalls ).not.toHaveBeenCalled();
		} );
	} );
} );
