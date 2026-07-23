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
const mockSetIsMinimized = jest.fn();
const mockUseAgentLayoutManager = jest.fn();
const mockResumeActiveChat = jest.fn();
const mockCloseSidebar = jest.fn();
let mockLayoutIsDocked = false;
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
		setIsMinimized: mockSetIsMinimized,
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
jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
	recordAgentsManagerTracksEvent: jest.fn(),
} ) );
jest.mock( '../../hooks/use-admin-bar-integration', () => ( {
	__esModule: true,
	default: () => mockHasAdminBar,
} ) );
jest.mock( '../../hooks/use-agent-layout-manager', () => ( options: unknown ) => {
	mockUseAgentLayoutManager( options );
	return {
		isDocked: mockLayoutIsDocked,
		isSidebarOpen: mockLayoutIsDocked && mockAgentsManagerState.isOpen !== false,
		canDock: mockLayoutIsDocked,
		dock: jest.fn(),
		undock: jest.fn(),
		openSidebar: jest.fn(),
		closeSidebar: mockCloseSidebar,
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
jest.mock( '../editor-ai-chat-button', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../editor-help-center-button', () => ( {
	__esModule: true,
	default: () => null,
} ) );
jest.mock( '../orchestrator-chat', () => ( {
	__esModule: true,
	default: ( {
		chatHeaderOptions,
		isOpen,
		onExpand,
		onClose,
	}: {
		chatHeaderOptions: { title: string }[];
		isOpen: boolean;
		onExpand: () => void;
		onClose: () => void;
	} ) => (
		<div data-testid="orchestrator-chat" data-chat-open={ String( isOpen ) }>
			{ chatHeaderOptions.map( ( option ) => option.title ).join( '|' ) }
			<button onClick={ onExpand }>Expand chat</button>
			<button onClick={ onClose }>Close chat</button>
		</div>
	),
} ) );

jest.mock( '../zendesk-chat', () => ( {
	__esModule: true,
	default: ( { onExpand }: { onExpand: () => void } ) => {
		return (
			<div data-testid="zendesk-chat">
				Zendesk chat
				<button onClick={ onExpand }>Expand Zendesk</button>
			</div>
		);
	},
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
import { recordBigSkyTracksEvent } from '../../utils/tracks';

const mockRecordBigSkyTracksEvent = recordBigSkyTracksEvent as jest.Mock;

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
		zendeskConversationTags: [],
	} as unknown as Partial< AgentsManagerContextType >;
}

describe( 'AgentDock', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHasAdminBar = false;
		mockShouldUseUnifiedAgent = false;
		mockLayoutIsDocked = false;
		mockAgentsManagerState = { isOpen: true, isDocked: false };
		mockContext = {
			siteKey: 'site-1',
			sectionName: 'reader-chat',
			agentConfig: {
				agentId: 'reader-chat',
			},
			getActiveSessionId: () => 'session-123',
			resumeActiveChat: mockResumeActiveChat,
			zendeskConversationTags: [],
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

	it( 'keeps the support guides list without the WP admin bar trigger', () => {
		// The route stays registered even without an entry button, so a
		// mid-session entry-button change (Site Editor navigation) can't
		// redirect a user off the list.
		useWpAdminAgent();
		mockShouldUseUnifiedAgent = true;

		renderAgentDock( '/support-guides' );

		expect( screen.getByTestId( 'support-guides' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'location' ).textContent ).toBe( '/support-guides' );
	} );

	it( 'hides the support guides list without the unified agent', () => {
		// Unknown paths fall back to `/chat`.
		useWpAdminAgent();
		mockHasAdminBar = true;

		renderAgentDock( '/support-guides' );

		expect( screen.queryByTestId( 'support-guides' ) ).toBeNull();
		expect( screen.getByTestId( 'location' ).textContent ).toBe( '/chat' );
	} );

	it( 'clears the minimized flag when the entry button disappears mid-session', () => {
		useWpAdminAgent();
		mockHasAdminBar = true;
		mockAgentsManagerState = { isOpen: true, isDocked: false, isMinimized: true };

		const { rerender } = renderAgentDock();
		expect( mockSetIsMinimized ).not.toHaveBeenCalled();

		mockHasAdminBar = false;
		rerender(
			<MemoryRouter initialEntries={ [ '/chat' ] }>
				<AgentDock />
				<LocationProbe />
			</MemoryRouter>
		);

		expect( mockSetIsMinimized ).toHaveBeenCalledWith( false );
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

	it( 'fires only dock_back_button_click when closing while undocked', () => {
		useWpAdminAgent();
		mockLayoutIsDocked = false;

		renderAgentDock();
		fireEvent.click( screen.getByText( 'Close chat' ) );

		// Undocked close collapses the floating panel and tracks the back button.
		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith( 'dock_back_button_click' );
		expect( mockRecordBigSkyTracksEvent ).not.toHaveBeenCalledWith( 'sidebar_close_click' );
		expect( mockCloseSidebar ).not.toHaveBeenCalled();
		expect( mockSetIsOpen ).toHaveBeenCalledWith( false, true );
	} );

	it( 'collapses the sidebar without dock_back_button_click when closing while docked', () => {
		useWpAdminAgent();
		mockLayoutIsDocked = true;

		renderAgentDock();
		fireEvent.click( screen.getByText( 'Close chat' ) );

		// Docked close goes through closeSidebar, which fires sidebar_close_click
		// via onCloseSidebar — so dock_back_button_click must not fire here.
		expect( mockCloseSidebar ).toHaveBeenCalledTimes( 1 );
		expect( mockRecordBigSkyTracksEvent ).not.toHaveBeenCalledWith( 'dock_back_button_click' );
	} );

	it( 'opens regular agents and saves shared Agents Manager state', () => {
		useWpAdminAgent();
		mockAgentsManagerState = { isOpen: false, isDocked: false };

		renderAgentDock();

		fireEvent.click( screen.getByText( 'Expand chat' ) );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( true, true );
	} );
} );
