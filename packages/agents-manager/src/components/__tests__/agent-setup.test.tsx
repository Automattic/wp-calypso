/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- `AgentsManager` must be imported after `jest.mock` */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const mockAgentManager = {
	hasAgent: jest.fn( () => true ),
	abortCurrentRequest: jest.fn(),
	removeAgent: jest.fn(),
};
let mockIsOpen = true;
let mockHasAiChatEntry = false;
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
jest.mock( '@wordpress/data', () => ( {
	useSelect: () => ( { hasLoaded: true, isOpen: mockIsOpen } ),
} ) );
jest.mock( '../../hooks/use-has-ai-chat-entry-button', () => ( {
	__esModule: true,
	default: () => mockHasAiChatEntry,
} ) );
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
jest.mock( '../agent-dock', () => {
	const { useAgentsManagerContext } = jest.requireActual( '../../contexts' );
	const { useNavigate } = jest.requireActual( 'react-router-dom' );
	function MockAgentDock() {
		const { agentConfig } = useAgentsManagerContext();
		const navigate = useNavigate();
		return (
			<>
				<div data-testid="published-session">{ agentConfig?.sessionId ?? '' }</div>
				<button onClick={ () => navigate( '/history' ) }>go-history</button>
				<button onClick={ () => navigate( '/chat' ) }>go-chat</button>
				<button onClick={ () => navigate( '/chat', { state: { isNewChat: true } } ) }>
					go-new-chat
				</button>
			</>
		);
	}
	return { __esModule: true, default: MockAgentDock };
} );

import AgentsManager from '../agents-manager';
import { getSessionId, saveSessionId, setSessionSiteKey } from '../../utils/agent-session';
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
		mockAgentManager.hasAgent.mockReturnValue( true );
		mockIsOpen = true;
		mockHasAiChatEntry = false;
		sessionStorage.clear();
		clearAnnouncedSessionId( undefined, '111' );
		clearAnnouncedSessionId( undefined, '222' );
		clearAnnouncedSessionId( undefined, 'no-site' );
		setSessionSiteKey( 'no-site' );
	} );

	it( 'does not re-initialize when the tab session catches up to the announced session', async () => {
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		// The server assigns a session mid-conversation: the config's callback
		// saves it and announces it, without any navigation.
		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live', undefined, '111' );

		rerender( manager( 111 ) );

		await act( async () => {} );
		expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'aligns the config with the announced session when leaving the chat view', async () => {
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live', undefined, '111' );
		rerender( manager( 111 ) );

		await act( async () => {} );
		expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 );

		fireEvent.click( screen.getByText( 'go-history' ) );

		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 ) );
		expect( mockCreateAgentConfig ).toHaveBeenLastCalledWith(
			expect.objectContaining( { sessionId: 'session-live' } )
		);
	} );

	it( 'does not re-initialize when returning with an aligned config', async () => {
		render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live', undefined, '111' );

		fireEvent.click( screen.getByText( 'go-history' ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 ) );

		fireEvent.click( screen.getByText( 'go-chat' ) );

		await act( async () => {} );
		expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 );
		expect( screen.getByTestId( 'published-session' ).textContent ).toBe( 'session-live' );
	} );

	it( 'clears the session, announcement, and recreates the agent on a new chat', async () => {
		render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live', undefined, '111' );
		mockAgentManager.removeAgent.mockImplementation( () => {
			mockAgentManager.hasAgent.mockReturnValue( false );
			return true;
		} );

		fireEvent.click( screen.getByText( 'go-new-chat' ) );

		await waitFor( () => expect( mockAgentManager.removeAgent ).toHaveBeenCalled() );
		expect( mockAgentManager.abortCurrentRequest ).toHaveBeenCalled();
		expect( getSessionId() ).toBe( '' );
		expect( getAnnouncedSessionId( undefined, '111' ) ).toBeUndefined();

		// A fresh config must publish even though it matches the cleared session,
		// or `useAgentChat` never recreates the removed agent.
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 ) );
		expect( mockCreateAgentConfig ).toHaveBeenLastCalledWith(
			expect.objectContaining( { sessionId: '' } )
		);
	} );

	it( 're-initializes on catch-up when the agent no longer exists', async () => {
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		// A late stream event can announce a session after its agent was
		// discarded — the announcement must not suppress the re-initialization.
		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live', undefined, '111' );
		mockAgentManager.hasAgent.mockReturnValue( false );

		rerender( manager( 111 ) );

		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 ) );
		expect( mockCreateAgentConfig ).toHaveBeenLastCalledWith(
			expect.objectContaining( { sessionId: 'session-live' } )
		);
	} );

	it( 'realigns when the chat is closed and reopened without a route change', async () => {
		mockHasAiChatEntry = true;
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live', undefined, '111' );

		mockIsOpen = false;
		rerender( manager( 111 ) );

		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 ) );
		expect( mockCreateAgentConfig ).toHaveBeenLastCalledWith(
			expect.objectContaining( { sessionId: 'session-live' } )
		);

		mockIsOpen = true;
		rerender( manager( 111 ) );

		await act( async () => {} );
		expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'realigns on returning to the chat view when the alignment was superseded', async () => {
		render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		saveSessionId( 'session-live' );
		setAnnouncedSessionId( 'session-live', undefined, '111' );

		let resolveAlignment!: () => void;
		mockCreateAgentConfig.mockImplementationOnce(
			( { sessionId, agentId }: { sessionId: string; agentId: string } ) =>
				new Promise( ( resolve ) => {
					resolveAlignment = () => resolve( { agentId, sessionId } );
				} )
		);

		fireEvent.click( screen.getByText( 'go-history' ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 2 ) );

		fireEvent.click( screen.getByText( 'go-chat' ) );

		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 3 ) );
		expect( mockCreateAgentConfig ).toHaveBeenLastCalledWith(
			expect.objectContaining( { sessionId: 'session-live' } )
		);

		act( () => resolveAlignment() );
		await act( async () => {} );

		expect( screen.getByTestId( 'published-session' ).textContent ).toBe( 'session-live' );
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

	it( 'ignores a superseded initialization that resolves after a site switch', async () => {
		setSessionSiteKey( '111' );
		saveSessionId( 'session-a' );
		setSessionSiteKey( '222' );
		saveSessionId( 'session-b' );

		let resolveSiteA!: () => void;
		mockCreateAgentConfig.mockImplementationOnce(
			( { sessionId, agentId }: { sessionId: string; agentId: string } ) =>
				new Promise( ( resolve ) => {
					resolveSiteA = () => resolve( { agentId, sessionId } );
				} )
		);

		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		rerender( manager( 222 ) );

		await waitFor( () =>
			expect( screen.getByTestId( 'published-session' ).textContent ).toBe( 'session-b' )
		);

		act( () => resolveSiteA() );
		await act( async () => {} );

		expect( screen.getByTestId( 'published-session' ).textContent ).toBe( 'session-b' );
	} );

	it( 'discards the agent when the session scope changes without a site change', async () => {
		const site = { ID: 111, domain: 'example.com' };
		const { rerender } = render(
			<AgentsManager sectionName="wp-admin" site={ site } currentSiteId={ 111 } />
		);
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		mockAgentManager.hasAgent.mockReturnValue( true );

		rerender( <AgentsManager sectionName="wp-admin" site={ site } currentSiteId={ undefined } /> );

		await waitFor( () => expect( mockAgentManager.removeAgent ).toHaveBeenCalled() );
		expect( mockAgentManager.abortCurrentRequest ).toHaveBeenCalled();
	} );

	it( 'discards the previous agent and its announced session on a site switch', async () => {
		const { rerender } = render( manager( 111 ) );
		await waitFor( () => expect( mockCreateAgentConfig ).toHaveBeenCalledTimes( 1 ) );

		setAnnouncedSessionId( 'session-live', undefined, '111' );
		mockAgentManager.hasAgent.mockReturnValue( true );

		rerender( manager( 222 ) );

		await waitFor( () => expect( mockAgentManager.removeAgent ).toHaveBeenCalled() );
		expect( mockAgentManager.abortCurrentRequest ).toHaveBeenCalled();
		expect( getAnnouncedSessionId( undefined, '111' ) ).toBeUndefined();
	} );
} );
