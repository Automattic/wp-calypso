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
} );
