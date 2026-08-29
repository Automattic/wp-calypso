/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		loadAllMessagesFromServer: jest.fn(),
	} ),
	{ virtual: true }
);

jest.mock( '@tanstack/react-query', () => ( {
	useQuery: jest.fn(),
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: jest.fn(),
} ) );

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
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
