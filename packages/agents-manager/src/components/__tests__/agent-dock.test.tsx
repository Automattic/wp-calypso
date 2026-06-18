/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { AgentsManagerContextType } from '../../contexts';

const mockAbortCurrentRequest = jest.fn();
const mockSetIsOpen = jest.fn();
const mockSetIsDocked = jest.fn();
const mockUseAgentLayoutManager = jest.fn();
const mockResumeActiveChat = jest.fn();
let mockContext: Partial< AgentsManagerContextType > = {};
let mockAgentsManagerState: {
	isOpen?: boolean;
	isDocked?: boolean;
	isMinimized?: boolean;
} = { isOpen: true, isDocked: false };
let mockHasAdminBar = false;
let mockShouldUseUnifiedAgent = false;

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getAgentManager: () => ( {
			hasAgent: () => true,
			abortCurrentRequest: mockAbortCurrentRequest,
		} ),
	} ),
	{ virtual: true }
);
jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( {
		setIsOpen: mockSetIsOpen,
		setIsDocked: mockSetIsDocked,
		setIsMinimized: jest.fn(),
	} ),
	useSelect: () => mockAgentsManagerState,
} ) );
jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );
jest.mock( '@wordpress/icons', () => ( {
	columns: 'columns',
	comment: 'comment',
	drawerRight: 'drawerRight',
	lineSolid: 'lineSolid',
	login: 'login',
} ) );
jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => mockContext,
} ) );
jest.mock( '../../hooks/use-admin-bar-integration', () => ( {
	__esModule: true,
	default: () => mockHasAdminBar,
} ) );
jest.mock( '../../hooks/use-agent-layout-manager', () => ( options: unknown ) => {
	mockUseAgentLayoutManager( options );
	return {
		isDocked: false,
		canDock: false,
		dock: jest.fn(),
		undock: jest.fn(),
		openSidebar: jest.fn(),
		closeSidebar: jest.fn(),
		createAgentPortal: ( children: React.ReactNode ) => children,
	};
} );
jest.mock( '../../hooks/custom-actions', () => ( {
	useSetupCustomActions: () => {},
} ) );
jest.mock( '../../hooks/use-should-use-unified-agent', () => ( {
	useShouldUseUnifiedAgent: () => mockShouldUseUnifiedAgent,
} ) );
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'agents-manager' } ) );
jest.mock( '../../utils/persist-last-activity', () => ( {
	persistLastActivity: jest.fn(),
} ) );
jest.mock( '../agent-dock/style.scss', () => ( {} ) );
jest.mock( '../orchestrator-chat', () => ( {
	__esModule: true,
	default: ( {
		chatHeaderOptions,
		isOpen,
		onExpand,
	}: {
		chatHeaderOptions: { title: string }[];
		isOpen: boolean;
		onExpand: () => void;
	} ) => (
		<div data-testid="orchestrator-chat" data-chat-open={ String( isOpen ) }>
			{ chatHeaderOptions.map( ( option ) => option.title ).join( '|' ) }
			<button onClick={ onExpand }>Expand chat</button>
		</div>
	),
} ) );
jest.mock( '../zendesk-chat', () => ( {
	__esModule: true,
	default: ( { onExpand }: { onExpand: () => void } ) => (
		<div data-testid="zendesk-chat">
			Zendesk chat
			<button onClick={ onExpand }>Expand Zendesk</button>
		</div>
	),
} ) );
jest.mock( '../agent-history', () => ( {
	__esModule: true,
	default: ( { onExpand }: { onExpand: () => void } ) => (
		<div data-testid="agent-history">
			History
			<button onClick={ onExpand }>Expand history</button>
		</div>
	),
} ) );
jest.mock( '../support-guide', () => ( {
	__esModule: true,
	default: () => <div data-testid="support-guide">Support guide</div>,
} ) );
jest.mock( '../support-guides', () => ( {
	__esModule: true,
	default: ( { onExpand }: { onExpand: () => void } ) => (
		<div data-testid="support-guides">
			Support guides
			<button onClick={ onExpand }>Expand guides</button>
		</div>
	),
} ) );

import AgentDock from '../agent-dock';

function LocationProbe() {
	const { pathname } = useLocation();
	return <div data-testid="location">{ pathname }</div>;
}

function renderAgentDock( initialEntry = '/chat' ) {
	return render(
		<MemoryRouter initialEntries={ [ initialEntry ] }>
			<AgentDock />
			<LocationProbe />
		</MemoryRouter>
	);
}

// A regular (non-reader) agent running in wp-admin.
function useWpAdminAgent() {
	mockContext = {
		siteKey: 'site-1',
		sectionName: 'wp-admin',
		agentConfig: {
			agentId: 'wp-orchestrator',
		},
		getActiveSessionId: () => 'session-123',
		resumeActiveChat: mockResumeActiveChat,
	} as unknown as Partial< AgentsManagerContextType >;
}

describe( 'AgentDock', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHasAdminBar = false;
		mockShouldUseUnifiedAgent = false;
		mockAgentsManagerState = { isOpen: true, isDocked: false };
		mockContext = {
			siteKey: 'site-1',
			sectionName: 'reader-chat',
			agentConfig: {
				agentId: 'reader-chat',
			},
			getActiveSessionId: () => 'session-123',
			resumeActiveChat: mockResumeActiveChat,
		} as unknown as Partial< AgentsManagerContextType >;
	} );

	it( 'hides the chat when closed if the WP admin bar trigger is present', () => {
		useWpAdminAgent();
		mockHasAdminBar = true;
		mockAgentsManagerState = { isOpen: false, isDocked: false };

		renderAgentDock();

		expect( screen.queryByTestId( 'orchestrator-chat' ) ).toBeNull();
	} );

	it( 'shows the chat when open with the WP admin bar trigger present', () => {
		// `beforeEach` already sets the open state.
		useWpAdminAgent();
		mockHasAdminBar = true;

		renderAgentDock();

		expect( screen.getByTestId( 'orchestrator-chat' ) ).toBeTruthy();
	} );

	it( 'keeps the chat mounted when closed without the WP admin bar trigger', () => {
		useWpAdminAgent();
		mockAgentsManagerState = { isOpen: false, isDocked: false };

		renderAgentDock();

		expect( screen.getByTestId( 'orchestrator-chat' ) ).toBeTruthy();
	} );

	it( 'shows the minimized bar (chat not expanded) when minimized with the WP admin bar trigger', () => {
		useWpAdminAgent();
		mockHasAdminBar = true;
		mockAgentsManagerState = { isOpen: true, isDocked: false, isMinimized: true };

		renderAgentDock();

		expect( screen.getByTestId( 'orchestrator-chat' ).dataset.chatOpen ).toBe( 'false' );
	} );

	it( 'ignores the minimized state without the WP admin bar trigger', () => {
		useWpAdminAgent();
		mockAgentsManagerState = { isOpen: true, isDocked: false, isMinimized: true };

		renderAgentDock();

		expect( screen.getByTestId( 'orchestrator-chat' ).dataset.chatOpen ).toBe( 'true' );
	} );

	it( 'keeps the chat history view when expanding from the minimized state', () => {
		useWpAdminAgent();
		mockHasAdminBar = true;
		mockAgentsManagerState = { isOpen: true, isDocked: false, isMinimized: true };

		renderAgentDock( '/history' );
		fireEvent.click( screen.getByText( 'Expand history' ) );

		// Expanding restores the last view instead of jumping back to the chat.
		expect( mockResumeActiveChat ).not.toHaveBeenCalled();
		expect( screen.getByTestId( 'location' ).textContent ).toBe( '/history' );
	} );

	it( 'keeps the current route when opening the docked sidebar', () => {
		useWpAdminAgent();

		renderAgentDock( '/history' );
		const { onOpenSidebar } = mockUseAgentLayoutManager.mock.calls.at( -1 )[ 0 ];
		act( () => onOpenSidebar() );

		// Opening the docked sidebar must not override a route chosen from the
		// WP admin bar (e.g. Chat history / Support guides).
		expect( screen.getByTestId( 'location' ).textContent ).toBe( '/history' );
	} );

	it( 'keeps the support guides view when expanding from the minimized state', () => {
		useWpAdminAgent();
		mockShouldUseUnifiedAgent = true;
		mockHasAdminBar = true;
		mockAgentsManagerState = { isOpen: true, isDocked: false, isMinimized: true };

		renderAgentDock( '/support-guides' );
		fireEvent.click( screen.getByText( 'Expand guides' ) );

		expect( mockResumeActiveChat ).not.toHaveBeenCalled();
		expect( screen.getByTestId( 'location' ).textContent ).toBe( '/support-guides' );
	} );

	it( 'hides the support guides list without the WP admin bar trigger', () => {
		// `mockHasAdminBar` stays false, so the list route is unavailable and
		// unknown paths fall back to `/chat`.
		useWpAdminAgent();

		renderAgentDock( '/support-guides' );

		expect( screen.queryByTestId( 'support-guides' ) ).toBeNull();
		expect( screen.getByTestId( 'location' ).textContent ).toBe( '/chat' );
	} );

	it( 'keeps the /post viewer available without the WP admin bar trigger', () => {
		// `/post` is opened from in-chat links and sources, so it must not depend
		// on the admin bar.
		useWpAdminAgent();

		renderAgentDock( '/post' );

		expect( screen.getByTestId( 'support-guide' ) ).toBeInTheDocument();
	} );

	it( 'keeps the Zendesk conversation when expanding from the minimized state', () => {
		useWpAdminAgent();
		mockShouldUseUnifiedAgent = true;
		mockHasAdminBar = true;
		mockAgentsManagerState = { isOpen: true, isDocked: false, isMinimized: true };

		renderAgentDock( '/zendesk' );
		fireEvent.click( screen.getByText( 'Expand Zendesk' ) );

		expect( screen.getByTestId( 'location' ).textContent ).toBe( '/zendesk' );
	} );

	it( 'opens Reader Chat without saving shared Agents Manager state', () => {
		mockAgentsManagerState = { isOpen: false, isDocked: false };
		renderAgentDock();

		fireEvent.click( screen.getByText( 'Expand chat' ) );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( true, false );
	} );

	it( 'forces Reader Chat to render undocked even if shared state is docked', () => {
		renderAgentDock();

		expect( mockUseAgentLayoutManager ).toHaveBeenCalledWith(
			expect.objectContaining( { defaultDocked: false } )
		);
	} );

	it( 'opens regular agents and saves shared Agents Manager state', () => {
		useWpAdminAgent();
		mockAgentsManagerState = { isOpen: false, isDocked: false };

		renderAgentDock();

		fireEvent.click( screen.getByText( 'Expand chat' ) );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( true, true );
	} );
} );
