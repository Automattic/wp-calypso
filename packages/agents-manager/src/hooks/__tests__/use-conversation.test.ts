/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
const mockIsTurnInFlight = vi.fn( () => false );
const mockCancelQueries = vi.fn();
const mockGetQueryData = vi.fn();
const mockLoadChatFromServer = vi.fn();
const mockLoadAllMessagesFromServer = vi.fn();
const mockWithUniqueMessageIds = vi.fn( ( messages: unknown[] ) => messages );
let mockParkedNavigationCallId: string | undefined;

vi.mock( '@automattic/agenttic-client', () => ( {
	getAgentManager: () => ( { isTurnInFlight: mockIsTurnInFlight } ),
	isOdieBotId: () => false,
	createOdieBotId: ( agentId: string ) => agentId,
	loadAllMessagesFromServer: ( ...args: unknown[] ) => mockLoadAllMessagesFromServer( ...args ),
	loadChatFromServer: ( ...args: unknown[] ) => mockLoadChatFromServer( ...args ),
	withUniqueMessageIds: ( messages: unknown[] ) => mockWithUniqueMessageIds( messages ),
} ) );

vi.mock( '@tanstack/react-query', () => ( {
	useQuery: vi.fn(),
	useQueryClient: () => ( { cancelQueries: mockCancelQueries, getQueryData: mockGetQueryData } ),
} ) );

vi.mock( '../../contexts', () => ( {
	useAgentsManagerContext: vi.fn(),
} ) );

vi.mock( '../../utils/wp-admin-navigation-state', () => ( {
	getPendingNavigation: () =>
		mockParkedNavigationCallId ? { toolCallId: mockParkedNavigationCallId } : null,
} ) );

import { useQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { useAgentsManagerContext } from '../../contexts';
import { getOrCreateSessionId, markSessionSent } from '../../utils/agent-session';
import { INTERRUPTED_TOOL_RESULT } from '../../utils/tool-call-resume';
import useConversation, { MAX_REPLY_WAIT_MS, RESUME_AFTER_MS } from '../use-conversation';
import type { PendingClientTools } from '@automattic/agenttic-client';

const mockUseQuery = useQuery as Mock;
const mockUseAgentsManagerContext = useAgentsManagerContext as Mock;

const serverMessage = (
	serverId: number,
	role: 'user' | 'agent',
	text: string,
	timestamp = Date.now()
) => ( {
	role,
	kind: 'message',
	parts: [ { type: 'text', text } ],
	messageId: `message-${ serverId }`,
	metadata: { serverId, timestamp },
} );

const question = serverMessage( 1, 'user', 'How many products do I have?' );
const toolResult = serverMessage(
	2,
	'agent',
	JSON.stringify( { tool_id: 'woo__get_products', data: {} } )
);
const reply = serverMessage( 3, 'agent', 'You have 12 products.' );

// Each load is a new object, as a refetch returns.
const mockLoadedConversation = ( messages: object[], pendingClientTools?: PendingClientTools ) =>
	mockUseQuery.mockReturnValue( {
		data: {
			messages: [ ...messages ],
			turnCount: 0,
			...( pendingClientTools && { pendingClientTools } ),
		},
		error: null,
		isError: false,
		isLoading: false,
		isFetchedAfterMount: true,
	} );

const lastQueryOptions = () => mockUseQuery.mock.calls.at( -1 )[ 0 ];

const renderWaitingConversation = ( onSuccess = vi.fn(), onRetry = vi.fn() ) =>
	renderHook( () => useConversation( { waitForReply: true, onSuccess, onRetry } ) );

describe( 'useConversation', () => {
	beforeEach( () => {
		mockUseQuery.mockReturnValue( {
			data: undefined,
			error: null,
			isError: false,
			isLoading: false,
		} );
	} );

	afterEach( () => {
		vi.clearAllMocks();
	} );

	it( 'does not fetch stored conversations for Reader Chat', () => {
		mockUseAgentsManagerContext.mockReturnValue( {
			agentConfig: {
				agentId: 'reader-chat',
				sessionId: 'reader-session',
				authProvider: {},
			},
		} );

		renderHook( () => useConversation( {} ) );

		expect( mockUseQuery ).toHaveBeenCalledWith(
			expect.objectContaining( {
				enabled: false,
			} )
		);
	} );

	it( 'fetches stored conversations for non-Reader Chat agents with a session ID', () => {
		mockUseAgentsManagerContext.mockReturnValue( {
			agentConfig: {
				agentId: 'wp-orchestrator',
				sessionId: 'orchestrator-session',
				authProvider: {},
			},
		} );

		renderHook( () => useConversation( {} ) );

		expect( mockUseQuery ).toHaveBeenCalledWith(
			expect.objectContaining( {
				enabled: true,
			} )
		);
	} );

	it( 'does not fetch a session minted in this tab before a turn is sent in it', () => {
		const sessionId = getOrCreateSessionId( 'wp-orchestrator' );
		mockUseAgentsManagerContext.mockReturnValue( {
			agentConfig: { agentId: 'wp-orchestrator', sessionId, authProvider: {} },
		} );

		const { rerender } = renderHook( () => useConversation( {} ) );
		expect( mockUseQuery ).toHaveBeenLastCalledWith(
			expect.objectContaining( { enabled: false } )
		);

		// Sending does not start a fetch that would replace the live stream.
		markSessionSent( sessionId );
		rerender();
		expect( mockUseQuery ).toHaveBeenLastCalledWith(
			expect.objectContaining( { enabled: false } )
		);

		// The next page load fetches it.
		renderHook( () => useConversation( {} ) );
		expect( mockUseQuery ).toHaveBeenLastCalledWith( expect.objectContaining( { enabled: true } ) );
	} );

	describe( 'waiting for the reply to a loaded question', () => {
		beforeEach( () => {
			mockIsTurnInFlight.mockReturnValue( false );
			mockUseAgentsManagerContext.mockReturnValue( {
				agentConfig: {
					agentId: 'wp-orchestrator',
					sessionId: 'orchestrator-session',
					authProvider: {},
				},
			} );
		} );

		it( 'reloads until the reply lands and holds, loading each new row once', () => {
			const onSuccess = vi.fn();
			mockLoadedConversation( [ question ] );

			const { result, rerender } = renderWaitingConversation( onSuccess );

			expect( lastQueryOptions().refetchInterval ).toBe( 3000 );
			expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );

			// A tool result that holds is not the reply yet.
			mockLoadedConversation( [ question, toolResult ] );
			rerender();
			mockLoadedConversation( [ question, toolResult ] );
			rerender();

			expect( lastQueryOptions().refetchInterval ).toBe( 3000 );

			mockLoadedConversation( [ question, toolResult, reply ] );
			rerender();

			expect( onSuccess ).toHaveBeenCalledTimes( 3 );
			expect( lastQueryOptions().refetchInterval ).toBe( 3000 );

			// The same reply on the next load: it is complete.
			mockLoadedConversation( [ question, toolResult, reply ] );
			rerender();

			expect( onSuccess ).toHaveBeenCalledTimes( 3 );
			expect( lastQueryOptions().refetchInterval ).toBe( false );
			expect( result.current.notice ).toBeUndefined();
		} );

		it.each( [
			[ 'the conversation ends on a reply', [ question, reply ], false, true ],
			[
				'the question is older than the wait',
				[ serverMessage( 1, 'user', 'An old question', Date.now() - MAX_REPLY_WAIT_MS - 1 ) ],
				false,
				true,
			],
			[ 'the agent is still running a turn', [ question ], true, true ],
			[ 'the chat is processing', [ question ], false, false ],
		] )( 'does not wait when %s', ( _case, messages, isTurnInFlight, waitForReply ) => {
			mockIsTurnInFlight.mockReturnValue( isTurnInFlight );
			mockLoadedConversation( messages );

			const { result } = renderHook( () => useConversation( { waitForReply } ) );

			expect( lastQueryOptions().refetchInterval ).toBe( false );
			expect( result.current.notice ).toBeUndefined();
		} );

		it( 'marks a copy requested while a turn runs', async () => {
			renderHook( () => useConversation( {} ) );
			mockIsTurnInFlight.mockReturnValue( true );
			mockLoadAllMessagesFromServer.mockResolvedValue( { messages: [ question ] } );

			const result = await lastQueryOptions().queryFn();

			expect( result.isRequestedMidTurn ).toBe( true );
		} );

		it( 'keeps the live history over a copy requested mid-turn once the turn is over', () => {
			const onSuccess = vi.fn();
			mockUseQuery.mockReturnValue( {
				data: { messages: [ question ], turnCount: 0, isRequestedMidTurn: true },
				error: null,
				isError: false,
				isLoading: false,
				isFetchedAfterMount: true,
			} );

			const { result } = renderWaitingConversation( onSuccess );

			expect( onSuccess ).toHaveBeenCalledWith( [ question ], 'orchestrator-session', true );
			expect( lastQueryOptions().refetchInterval ).toBe( false );
			expect( result.current.notice ).toBeUndefined();
		} );

		it( 'leaves a copy an earlier mount cached to this mount’s fetch', () => {
			const onSuccess = vi.fn();
			mockUseQuery.mockReturnValue( {
				data: { messages: [ question ], turnCount: 0 },
				error: null,
				isError: false,
				isLoading: false,
				isFetchedAfterMount: false,
			} );

			const { rerender } = renderWaitingConversation( onSuccess );

			expect( onSuccess ).not.toHaveBeenCalled();

			mockLoadedConversation( [ question, reply ] );
			rerender();

			expect( onSuccess ).toHaveBeenCalledWith(
				[ question, reply ],
				'orchestrator-session',
				false
			);
		} );

		it.each( [
			[ 'the agent starts a turn', true, true ],
			[ 'the chat starts processing', false, false ],
		] )(
			'stops without loading a reload that lands as %s',
			( _case, isTurnInFlight, waitForReply ) => {
				const onSuccess = vi.fn();
				mockLoadedConversation( [ question ] );
				const { result, rerender } = renderHook(
					( props: { waitForReply: boolean } ) => useConversation( { ...props, onSuccess } ),
					{ initialProps: { waitForReply: true } }
				);

				mockIsTurnInFlight.mockReturnValue( isTurnInFlight );
				mockLoadedConversation( [ question, reply ] );
				rerender( { waitForReply } );

				expect( onSuccess ).toHaveBeenCalledTimes( 1 );
				expect( lastQueryOptions().refetchInterval ).toBe( false );
				expect( result.current.notice ).toBeUndefined();
			}
		);

		it( 'drops the Retry notice once the chat starts processing', () => {
			vi.useFakeTimers();
			mockLoadedConversation( [ question ] );
			const { result, rerender } = renderHook(
				( props: { waitForReply: boolean } ) => useConversation( props ),
				{ initialProps: { waitForReply: true } }
			);
			act( () => vi.advanceTimersByTime( MAX_REPLY_WAIT_MS ) );
			expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );

			rerender( { waitForReply: false } );

			expect( result.current.notice ).toBeUndefined();
			vi.useRealTimers();
		} );

		it( 'cancels the reload in flight when the chat starts processing', () => {
			mockLoadedConversation( [ question ] );
			const { rerender } = renderHook(
				( props: { waitForReply: boolean } ) => useConversation( props ),
				{ initialProps: { waitForReply: true } }
			);

			rerender( { waitForReply: false } );

			expect( mockCancelQueries ).toHaveBeenCalledWith( {
				queryKey: [ 'agents-manager-conversation', 'orchestrator-session' ],
				exact: true,
			} );
		} );

		it( 'marks a copy with the turns that had started when it was requested', async () => {
			const { rerender } = renderHook(
				( props: { waitForReply: boolean } ) => useConversation( props ),
				{ initialProps: { waitForReply: true } }
			);

			rerender( { waitForReply: false } );
			mockLoadAllMessagesFromServer.mockResolvedValue( { messages: [ question ] } );

			const result = await lastQueryOptions().queryFn();

			expect( result.turnCount ).toBe( 1 );
		} );

		it( 'keeps the live history over a copy requested before a turn that started since', () => {
			const onSuccess = vi.fn();
			const { rerender } = renderHook(
				( props: { waitForReply: boolean } ) => useConversation( { ...props, onSuccess } ),
				{ initialProps: { waitForReply: true } }
			);

			rerender( { waitForReply: false } );
			mockLoadedConversation( [ question ] );
			rerender( { waitForReply: true } );

			expect( onSuccess ).toHaveBeenCalledWith( [ question ], 'orchestrator-session', true );
		} );

		it.each( [
			[ 'an image only', [] ],
			[ 'an image and text', [ { type: 'text', text: 'What is in this photo?' } ] ],
		] )(
			'waits for a question with %s but asks it again by hand instead of Retry',
			( _case, textParts ) => {
				vi.useFakeTimers();
				const withImage = {
					...question,
					parts: [ ...textParts, { type: 'file', file: { uri: 'https://example.test/a.png' } } ],
				};
				mockLoadedConversation( [ withImage ] );
				const { result } = renderWaitingConversation();

				expect( lastQueryOptions().refetchInterval ).toBe( 3000 );

				act( () => vi.advanceTimersByTime( MAX_REPLY_WAIT_MS ) );

				expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );
				expect( result.current.notice?.action ).toBeUndefined();

				vi.useRealTimers();
			}
		);

		it( 'stops for good and offers Retry with the question when no reply arrives in time', () => {
			vi.useFakeTimers();
			const onRetry = vi.fn();
			mockLoadedConversation( [ question ] );
			const { result, rerender } = renderWaitingConversation( vi.fn(), onRetry );

			act( () => vi.advanceTimersByTime( MAX_REPLY_WAIT_MS ) );

			expect( lastQueryOptions().refetchInterval ).toBe( false );
			expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );

			// A later load of the same question (e.g. on reconnect) does not start another wait.
			mockLoadedConversation( [ question ] );
			rerender();
			act( () => vi.advanceTimersByTime( MAX_REPLY_WAIT_MS ) );

			expect( lastQueryOptions().refetchInterval ).toBe( false );
			expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );

			act( () => ( result.current.notice?.action as { onClick: () => void } ).onClick() );

			expect( onRetry ).toHaveBeenCalledWith( 'How many products do I have?' );
			expect( result.current.notice ).toBeUndefined();

			vi.useRealTimers();
		} );

		it( 'reloads only the newest page while it waits, keeping the older ones', async () => {
			mockLoadedConversation( [ question ] );
			renderWaitingConversation();
			mockGetQueryData.mockReturnValue( { messages: [ question ] } );
			mockLoadChatFromServer.mockResolvedValue( { messages: [ toolResult, reply ] } );

			const result = await lastQueryOptions().queryFn();

			expect( mockLoadAllMessagesFromServer ).not.toHaveBeenCalled();
			expect( mockLoadChatFromServer.mock.calls[ 0 ].slice( 2 ) ).toEqual( [ 1, 50, true ] );
			expect( result.messages ).toEqual( [ toolResult, reply, question ] );
		} );

		it( 'keeps each message ID on one message of the merged pages', async () => {
			const unique = [ reply, { ...question, messageId: '1' } ];
			mockLoadedConversation( [ question ] );
			renderWaitingConversation();
			mockGetQueryData.mockReturnValue( { messages: [ question ] } );
			mockLoadChatFromServer.mockResolvedValue( { messages: [ reply ] } );
			mockWithUniqueMessageIds.mockReturnValueOnce( unique );

			const result = await lastQueryOptions().queryFn();

			expect( mockWithUniqueMessageIds ).toHaveBeenCalledWith( [ reply, question ] );
			expect( result.messages ).toBe( unique );
		} );

		it( 'restarts the wait whenever a new message lands', () => {
			vi.useFakeTimers();
			mockLoadedConversation( [ question ] );
			const { result, rerender } = renderWaitingConversation();

			act( () => vi.advanceTimersByTime( MAX_REPLY_WAIT_MS - 1000 ) );
			mockLoadedConversation( [ question, toolResult ] );
			rerender();
			act( () => vi.advanceTimersByTime( MAX_REPLY_WAIT_MS - 1000 ) );

			expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );

			act( () => vi.advanceTimersByTime( 1000 ) );

			expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );
			vi.useRealTimers();
		} );

		describe( 'a turn paused on a browser tool', () => {
			const pausedOn = ( state: PendingClientTools[ 'state' ] ): PendingClientTools => ( {
				state,
				calls: [
					{
						toolCallId: 'call-top',
						toolId: 'woocommerce__get_top_products',
						arguments: { limit: 5 },
					},
				],
			} );

			const renderPaused = ( onResume: Mock, state: PendingClientTools[ 'state' ] ) => {
				mockLoadedConversation( [ question, toolResult ], pausedOn( state ) );
				return renderHook( () =>
					useConversation( { waitForReply: true, onSuccess: vi.fn(), onResume } )
				);
			};

			beforeEach( () => {
				vi.useFakeTimers();
				mockParkedNavigationCallId = undefined;
			} );

			afterEach( () => {
				vi.useRealTimers();
			} );

			it( 'gives the old page time, then resumes with an interrupted result and the calls of the turn', async () => {
				let finishResume: ( replied: boolean ) => void = () => {};
				const onResume = vi.fn(
					() => new Promise< boolean >( ( resolve ) => ( finishResume = resolve ) )
				);
				const { result } = renderPaused( onResume, 'unanswered' );

				act( () => vi.advanceTimersByTime( RESUME_AFTER_MS - 1 ) );
				expect( onResume ).not.toHaveBeenCalled();

				await act( async () => vi.advanceTimersByTime( 1 ) );

				expect( onResume ).toHaveBeenCalledWith(
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
				expect( lastQueryOptions().refetchInterval ).toBe( false );

				await act( async () => finishResume( true ) );

				expect( result.current.notice ).toBeUndefined();
			} );

			it( 'keeps waiting while a run holds the turn elsewhere', async () => {
				const onResume = vi.fn();
				const { result } = renderPaused( onResume, 'running' );

				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( onResume ).not.toHaveBeenCalled();
				expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );
			} );

			it.each( [
				[ 'brings no reply', vi.fn().mockResolvedValue( false ) ],
				[ 'loses the race', vi.fn().mockRejectedValue( new Error( 'already received' ) ) ],
			] )( 'goes back to waiting, once, when the resume %s', async ( _case, onResume ) => {
				const consoleError = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
				const { result, rerender } = renderPaused( onResume, 'unanswered' );

				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( result.current.notice?.message ).toBe( 'Waiting for the reply…' );
				expect( lastQueryOptions().refetchInterval ).toBe( 3000 );

				mockLoadedConversation( [ question, toolResult ], pausedOn( 'unanswered' ) );
				rerender();
				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( onResume ).toHaveBeenCalledTimes( 1 );
				consoleError.mockRestore();
			} );

			it( 'logs a failed resume', async () => {
				const consoleError = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
				renderPaused( vi.fn().mockRejectedValue( new Error( 'network' ) ), 'unanswered' );

				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( consoleError ).toHaveBeenCalledWith(
					'[AgentsManager] Error resuming the paused turn:',
					expect.any( Error )
				);
				consoleError.mockRestore();
			} );

			it( 'does not load a reload over the reply the resume streams', async () => {
				const onSuccess = vi.fn();
				const onResume = vi.fn( () => new Promise< boolean >( () => {} ) );
				mockLoadedConversation( [ question, toolResult ], pausedOn( 'unanswered' ) );
				const { rerender } = renderHook( () =>
					useConversation( { waitForReply: true, onSuccess, onResume } )
				);
				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				mockLoadedConversation( [ question, toolResult, reply ] );
				rerender();

				expect( onSuccess ).toHaveBeenCalledTimes( 1 );
			} );

			const pausedOnCall = ( toolCallId: string ): PendingClientTools => ( {
				state: 'unanswered',
				calls: [ { toolCallId, toolId: 'woocommerce__get_top_products', arguments: {} } ],
			} );

			it( 'gives a new set of pending calls its own wait before resuming', async () => {
				const onResume = vi.fn().mockResolvedValue( false );
				mockLoadedConversation( [ question, toolResult ], pausedOnCall( 'call-a' ) );
				const { rerender } = renderHook( () =>
					useConversation( { waitForReply: true, onSuccess: vi.fn(), onResume } )
				);

				act( () => vi.advanceTimersByTime( RESUME_AFTER_MS / 2 ) );
				mockLoadedConversation( [ question, toolResult ], pausedOnCall( 'call-b' ) );
				rerender();
				act( () => vi.advanceTimersByTime( RESUME_AFTER_MS - 1 ) );

				expect( onResume ).not.toHaveBeenCalled();

				await act( async () => vi.advanceTimersByTime( 1 ) );

				expect( onResume ).toHaveBeenCalledTimes( 1 );
				expect( onResume.mock.calls[ 0 ][ 0 ][ 0 ].toolCallId ).toBe( 'call-b' );
			} );

			it( 'resumes a later turn that pauses again after an earlier resume', async () => {
				const onResume = vi.fn().mockResolvedValue( false );
				mockLoadedConversation( [ question, toolResult ], pausedOnCall( 'call-a' ) );
				const { rerender } = renderHook( () =>
					useConversation( { waitForReply: true, onSuccess: vi.fn(), onResume } )
				);
				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				mockLoadedConversation( [ question, toolResult, reply ], pausedOnCall( 'call-b' ) );
				rerender();
				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( onResume ).toHaveBeenCalledTimes( 2 );
				expect( onResume.mock.calls[ 1 ][ 0 ][ 0 ].toolCallId ).toBe( 'call-b' );
			} );

			it( 'loads a reply that landed mid-resume when the resume brings none', async () => {
				const onSuccess = vi.fn();
				let finishResume: ( replied: boolean ) => void = () => {};
				const onResume = vi.fn(
					() => new Promise< boolean >( ( resolve ) => ( finishResume = resolve ) )
				);
				mockLoadedConversation( [ question, toolResult ], pausedOn( 'unanswered' ) );
				const { rerender } = renderHook( () =>
					useConversation( { waitForReply: true, onSuccess, onResume } )
				);
				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				mockLoadedConversation( [ question, toolResult, reply ] );
				rerender();
				await act( async () => finishResume( false ) );

				expect( onSuccess ).toHaveBeenCalledTimes( 2 );
				expect( onSuccess.mock.calls[ 1 ][ 0 ] ).toContainEqual( reply );
			} );

			it( 'reports a failed resume until the next turn starts', async () => {
				const consoleError = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
				mockLoadedConversation( [ question, toolResult ], pausedOn( 'unanswered' ) );
				const { result, rerender } = renderHook(
					( props: { waitForReply: boolean } ) =>
						useConversation( {
							...props,
							onSuccess: vi.fn(),
							onResume: vi.fn().mockRejectedValue( new Error( 'already received' ) ),
						} ),
					{ initialProps: { waitForReply: true } }
				);

				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( result.current.hasFailedResume ).toBe( true );

				rerender( { waitForReply: false } );

				expect( result.current.hasFailedResume ).toBe( false );
				consoleError.mockRestore();
			} );

			it( 'stops reporting a failed resume when the chat changes', async () => {
				const consoleError = vi.spyOn( console, 'error' ).mockImplementation( () => {} );
				mockLoadedConversation( [ question, toolResult ], pausedOn( 'unanswered' ) );
				const { result, rerender } = renderHook( () =>
					useConversation( {
						waitForReply: true,
						onSuccess: vi.fn(),
						onResume: vi.fn().mockRejectedValue( new Error( 'already received' ) ),
					} )
				);

				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( result.current.hasFailedResume ).toBe( true );

				mockUseAgentsManagerContext.mockReturnValue( {
					agentConfig: { agentId: 'wp-orchestrator', sessionId: 'other-session', authProvider: {} },
				} );
				rerender();

				expect( result.current.hasFailedResume ).toBe( false );
				consoleError.mockRestore();
			} );

			it( 'leaves a parked wp-admin-navigate call to the navigation continuation', async () => {
				mockParkedNavigationCallId = 'call-top';
				const onResume = vi.fn();
				renderPaused( onResume, 'unanswered' );

				await act( async () => vi.advanceTimersByTime( RESUME_AFTER_MS ) );

				expect( onResume ).not.toHaveBeenCalled();
			} );
		} );
	} );
} );
