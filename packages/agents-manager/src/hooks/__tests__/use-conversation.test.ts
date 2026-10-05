/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
const mockIsTurnInFlight = jest.fn( () => false );
const mockCancelQueries = jest.fn();

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getAgentManager: () => ( { isTurnInFlight: mockIsTurnInFlight } ),
		loadAllMessagesFromServer: jest.fn(),
	} ),
	{ virtual: true }
);

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn(),
	useQueryClient: () => ( { cancelQueries: mockCancelQueries } ),
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: jest.fn(),
} ) );

import { useQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { useAgentsManagerContext } from '../../contexts';
import { getOrCreateSessionId, markSessionSent } from '../../utils/agent-session';
import useConversation, { MAX_REPLY_WAIT_MS } from '../use-conversation';

const mockUseQuery = useQuery as jest.Mock;
const mockUseAgentsManagerContext = useAgentsManagerContext as jest.Mock;

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
const mockLoadedConversation = ( messages: object[] ) =>
	mockUseQuery.mockReturnValue( {
		data: { messages: [ ...messages ] },
		error: null,
		isError: false,
		isLoading: false,
	} );

const lastQueryOptions = () => mockUseQuery.mock.calls.at( -1 )[ 0 ];

const renderWaitingConversation = ( onSuccess = jest.fn(), onRetry = jest.fn() ) =>
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
		jest.clearAllMocks();
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
			const onSuccess = jest.fn();
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

		it.each( [
			[ 'the agent starts a turn', true, true ],
			[ 'the chat starts processing', false, false ],
		] )(
			'stops without loading a reload that lands as %s',
			( _case, isTurnInFlight, waitForReply ) => {
				const onSuccess = jest.fn();
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

		it( 'stops for good and offers Retry with the question when no reply arrives in time', () => {
			jest.useFakeTimers();
			const onRetry = jest.fn();
			mockLoadedConversation( [ question ] );
			const { result, rerender } = renderWaitingConversation( jest.fn(), onRetry );

			act( () => jest.advanceTimersByTime( MAX_REPLY_WAIT_MS ) );

			expect( lastQueryOptions().refetchInterval ).toBe( false );
			expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );

			// A later load of the same question (e.g. on reconnect) does not start another wait.
			mockLoadedConversation( [ question ] );
			rerender();
			act( () => jest.advanceTimersByTime( MAX_REPLY_WAIT_MS ) );

			expect( lastQueryOptions().refetchInterval ).toBe( false );
			expect( result.current.notice?.message ).toBe( 'No reply arrived for your last question.' );

			act( () => ( result.current.notice?.action as { onClick: () => void } ).onClick() );

			expect( onRetry ).toHaveBeenCalledWith( 'How many products do I have?' );
			expect( result.current.notice ).toBeUndefined();

			jest.useRealTimers();
		} );
	} );
} );
