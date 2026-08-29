/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		loadAllMessagesFromServer: jest.fn(),
		loadConversation: jest.fn( async () => ( { messages: [] } ) ),
		getUnresolvedMessages: ( messages: Array< { metadata?: { deliveryStatus?: string } } > ) =>
			messages.filter( ( m ) => m.metadata?.deliveryStatus === 'pending' ),
		messageTextContent: ( m: { parts: Array< { type: string; text?: string } > } ) =>
			m.parts
				.filter( ( part ) => part.type === 'text' )
				.map( ( part ) => part.text )
				.join( '\n' ),
	} ),
	{ virtual: true }
);

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn(),
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: jest.fn(),
} ) );

import { loadConversation } from '@automattic/agenttic-client';
import { useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useAgentsManagerContext } from '../../contexts';
import useConversation from '../use-conversation';

const mockUseQuery = useQuery as jest.Mock;
const mockUseAgentsManagerContext = useAgentsManagerContext as jest.Mock;

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

	describe( 'refetchWhileAwaitingReply', () => {
		const setOrchestrator = () =>
			mockUseAgentsManagerContext.mockReturnValue( {
				agentConfig: { agentId: 'wp-orchestrator', sessionId: 's1', authProvider: {} },
			} );
		const user = { role: 'user', kind: 'message', messageId: 'u', parts: [] };
		const agent = { role: 'agent', kind: 'message', messageId: 'a', parts: [] };
		const intervalFor = ( messages: unknown[] ) => {
			const { refetchInterval } = mockUseQuery.mock.calls[ 0 ][ 0 ];
			return refetchInterval( { state: { data: { messages } } } );
		};

		it( 'polls while the transcript ends on a user turn', () => {
			setOrchestrator();
			mockUseQuery.mockReturnValue( {
				data: { messages: [ user ] },
				error: null,
				isError: false,
				isLoading: false,
			} );

			const { result } = renderHook( () => useConversation( { refetchWhileAwaitingReply: true } ) );

			expect( intervalFor( [ user ] ) ).toBe( 3000 );
			expect( mockUseQuery.mock.calls[ 0 ][ 0 ].refetchIntervalInBackground ).toBe( true );
			expect( result.current.isAwaitingReply ).toBe( true );
		} );

		it( 'stops once a reply lands', () => {
			setOrchestrator();
			mockUseQuery.mockReturnValue( {
				data: { messages: [ user, agent ] },
				error: null,
				isError: false,
				isLoading: false,
			} );

			const { result } = renderHook( () => useConversation( { refetchWhileAwaitingReply: true } ) );

			expect( intervalFor( [ user, agent ] ) ).toBe( false );
			expect( result.current.isAwaitingReply ).toBe( false );
		} );

		it( 'does not poll unless asked to', () => {
			setOrchestrator();
			renderHook( () => useConversation( {} ) );
			expect( intervalFor( [ user ] ) ).toBe( false );
		} );

		it( 'polls while a locally pending turn has no reply on the server yet', async () => {
			setOrchestrator();
			const pendingUser = {
				role: 'user',
				kind: 'message',
				messageId: 'p',
				parts: [ { type: 'text', text: 'still waiting' } ],
				metadata: { deliveryStatus: 'pending' },
			};
			( loadConversation as jest.Mock ).mockResolvedValueOnce( { messages: [ pendingUser ] } );
			// Server transcript ends on an older agent turn and lacks the pending question.
			mockUseQuery.mockReturnValue( {
				data: { messages: [ user, agent ] },
				error: null,
				isError: false,
				isLoading: false,
			} );

			const { result } = renderHook( () => useConversation( { refetchWhileAwaitingReply: true } ) );
			await waitFor( () => expect( result.current.isAwaitingReply ).toBe( true ) );

			const { refetchInterval } = mockUseQuery.mock.calls.at( -1 )[ 0 ];
			expect( refetchInterval( { state: { data: { messages: [ user, agent ] } } } ) ).toBe( 3000 );
			const answered = [ user, agent, { ...pendingUser, metadata: {} }, agent ];
			expect( refetchInterval( { state: { data: { messages: answered } } } ) ).toBe( false );
		} );

		it( 'gives up after the timeout', () => {
			setOrchestrator();
			const now = jest.spyOn( Date, 'now' ).mockReturnValue( 1_000 );
			renderHook( () => useConversation( { refetchWhileAwaitingReply: true } ) );

			expect( intervalFor( [ user ] ) ).toBe( 3000 );
			now.mockReturnValue( 1_000 + 90_000 );
			expect( intervalFor( [ user ] ) ).toBe( false );
			now.mockRestore();
		} );
	} );
} );
