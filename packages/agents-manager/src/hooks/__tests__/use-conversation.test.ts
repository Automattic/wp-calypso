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

jest.mock( '../../utils/agent-session', () => ( {
	isFreshSession: jest.fn(),
} ) );

import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { useAgentsManagerContext } from '../../contexts';
import useConversation from '../use-conversation';
import { isFreshSession } from '../../utils/agent-session';

const mockUseQuery = useQuery as jest.Mock;
const mockUseAgentsManagerContext = useAgentsManagerContext as jest.Mock;
const mockIsFreshSession = isFreshSession as jest.Mock;

describe( 'useConversation', () => {
	beforeEach( () => {
		mockUseQuery.mockReturnValue( {
			data: undefined,
			error: null,
			isError: false,
			isLoading: false,
		} );
		// Default: not fresh at mount, so the fresh-session gate is a no-op for the
		// existing cases (a resumed/server-backed session still fetches).
		mockIsFreshSession.mockReturnValue( false );
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

	it( 'skips the fetch for a session that was fresh at mount (client-generated, never sent to the server)', () => {
		mockIsFreshSession.mockReturnValue( true );
		mockUseAgentsManagerContext.mockReturnValue( {
			agentConfig: {
				agentId: 'wp-orchestrator',
				sessionId: 'fresh-session',
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

	it( 'still fetches a resumed (non-fresh) session for a server-backed host', () => {
		mockIsFreshSession.mockReturnValue( false );
		mockUseAgentsManagerContext.mockReturnValue( {
			agentConfig: {
				agentId: 'wp-orchestrator',
				sessionId: 'used-session',
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
} );
