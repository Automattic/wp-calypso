/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- `AgentsManager` must be imported after `jest.mock` */
import { act, render, waitFor } from '@testing-library/react';

const mockAgentManager = {
	hasAgent: jest.fn( () => false ),
	abortCurrentRequest: jest.fn(),
	removeAgent: jest.fn(),
};
const mockCreateAgentConfig = jest.fn(
	async ( { sessionId, agentId }: { sessionId: string; agentId: string } ) => ( {
		agentId,
		sessionId,
	} )
);

// Packages that Jest can't resolve in this environment
jest.mock( '@automattic/agenttic-client', () => ( { getAgentManager: () => mockAgentManager } ), {
	virtual: true,
} );
jest.mock( '@automattic/data-stores', () => ( {} ), { virtual: true } );

// Simulate `store` ready so the component renders
jest.mock( '@wordpress/data', () => ( { useSelect: () => ( { hasLoaded: true } ) } ) );
jest.mock( '@tanstack/react-query', () => ( {
	QueryClient: jest.fn(),
	QueryClientProvider: ( { children }: { children: React.ReactNode } ) => children,
} ) );

jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );
jest.mock( '../../utils/create-agent-config', () => ( {
	createAgentConfig: ( options: { sessionId: string; agentId: string } ) =>
		mockCreateAgentConfig( options ),
} ) );
jest.mock( '../../hooks/use-agent-config', () => ( {
	useAgentConfig: () => ( { agentId: 'wp-orchestrator', isLoading: false } ),
} ) );
jest.mock( '../../hooks/use-open-chat-url-param', () => ( {
	useOpenChatUrlParam: () => true,
} ) );
jest.mock( '../../utils/load-external-providers', () => ( {
	loadExternalProviders: async () => ( { providerIds: [] } ),
} ) );
jest.mock( '../../hooks/use-empty-view-suggestions', () => ( {
	useEmptyViewSuggestions: () => [],
} ) );
jest.mock( '../agent-dock', () => ( { __esModule: true, default: () => null } ) );

import AgentsManager from '../agents-manager';
import { saveSessionId, setSessionSiteKey } from '../../utils/agent-session';
import {
	clearAnnouncedSessionId,
	getAnnouncedSessionId,
	setAnnouncedSessionId,
} from '../../utils/announced-sessions';

function manager( siteId: number ) {
	return (
		<AgentsManager
			sectionName="wp-admin"
			site={ { ID: siteId, domain: 'example.com' } }
			currentSiteId={ siteId }
		/>
	);
}

describe( 'AgentSetup', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockAgentManager.hasAgent.mockReturnValue( false );
		sessionStorage.clear();
		clearAnnouncedSessionId();
		setSessionSiteKey( 'no-site' );
	} );

	it( 'does not re-initialize when the tab session catches up to the announced session', async () => {
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		// The server assigns a session mid-conversation: the config's callback
		// saves it and announces it, without any navigation.
		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live' );

		rerender( manager( 111 ) );

		await act( async () => {} );
		expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 );
	} );

	it( 're-initializes for a session that was not announced (conversation switch)', async () => {
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		saveSessionId( 'session-selected' );

		rerender( manager( 111 ) );

		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 ) );
		expect( mockCreateAgentConfig ).toHaveBeenLastCalledWith(
			expect.objectContaining( { sessionId: 'session-selected' } )
		);
	} );

	it( 'discards the previous agent and its announced session on a site switch', async () => {
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		setAnnouncedSessionId( 'session-live' );
		mockAgentManager.hasAgent.mockReturnValue( true );

		rerender( manager( 222 ) );

		await waitFor( () => expect( mockAgentManager.removeAgent ).toHaveBeenCalled() );
		expect( mockAgentManager.abortCurrentRequest ).toHaveBeenCalled();
		expect( getAnnouncedSessionId() ).toBeUndefined();
	} );
} );
