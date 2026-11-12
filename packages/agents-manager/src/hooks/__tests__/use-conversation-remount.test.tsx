/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
/* eslint-disable import/order */
import { vi } from 'vitest';
const mockIsTurnInFlight = vi.fn( () => false );
const mockLoadAllMessagesFromServer = vi.fn();

vi.mock( '@automattic/agenttic-client', () => ( {
	getAgentManager: () => ( { isTurnInFlight: mockIsTurnInFlight } ),
	isOdieBotId: () => false,
	createOdieBotId: ( agentId: string ) => agentId,
	loadAllMessagesFromServer: ( ...args: unknown[] ) => mockLoadAllMessagesFromServer( ...args ),
} ) );

vi.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => ( {
		agentConfig: {
			agentId: 'wp-orchestrator',
			sessionId: 'orchestrator-session',
			authProvider: {},
		},
	} ),
} ) );

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import useConversation from '../use-conversation';
import type { ReactNode } from 'react';

const reply = ( text: string ) => ( {
	role: 'agent',
	kind: 'message',
	parts: [ { type: 'text', text } ],
	messageId: text,
	metadata: { serverId: 1, timestamp: 0 },
} );

function deferredLoad() {
	let resolve!: ( messages: object[] ) => void;
	const promise = new Promise( ( settle ) => {
		resolve = ( messages ) => settle( { messages } );
	} );

	return { promise, resolve };
}

describe( 'useConversation across mounts', () => {
	it.each( [
		[ 'while idle', false ],
		[ 'mid-turn', true ],
	] )(
		'requests its own copy when the previous mount left one in flight, requested %s',
		async ( _case, isTurnInFlight ) => {
			const queryClient = new QueryClient();
			const wrapper = ( { children }: { children: ReactNode } ) => (
				<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
			);
			const inherited = deferredLoad();
			const own = deferredLoad();
			const onSuccess = vi.fn();

			mockLoadAllMessagesFromServer
				.mockReturnValueOnce( inherited.promise )
				.mockReturnValueOnce( own.promise );
			mockIsTurnInFlight.mockReturnValue( isTurnInFlight );

			const { unmount } = renderHook( () => useConversation( { waitForReply: true, onSuccess } ), {
				wrapper,
			} );

			unmount();
			mockIsTurnInFlight.mockReturnValue( false );
			renderHook( () => useConversation( { waitForReply: true, onSuccess } ), { wrapper } );

			await act( async () => {
				inherited.resolve( [ reply( 'Inherited' ) ] );
				own.resolve( [ reply( 'Own' ) ] );
			} );

			await waitFor( () => expect( onSuccess ).toHaveBeenCalledTimes( 1 ) );
			expect( onSuccess ).toHaveBeenCalledWith( [ reply( 'Own' ) ], 'orchestrator-session', false );

			queryClient.clear();
		}
	);
} );
