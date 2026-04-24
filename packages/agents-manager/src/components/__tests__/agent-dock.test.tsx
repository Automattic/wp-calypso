/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AgentsManagerContextType } from '../../contexts';

const mockAbortCurrentRequest = jest.fn();
const mockSetIsOpen = jest.fn();
const mockSetIsDocked = jest.fn();
let mockShouldUseUnifiedAgent = false;
let mockContext: Partial< AgentsManagerContextType > = {};

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
	} ),
	useSelect: () => ( {
		isOpen: true,
		isDocked: false,
	} ),
} ) );
jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );
jest.mock( '@wordpress/icons', () => ( {
	comment: 'comment',
	drawerRight: 'drawerRight',
	help: 'help',
	login: 'login',
	lifesaver: 'lifesaver',
} ) );
jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: () => mockContext,
} ) );
jest.mock( '../../hooks/use-admin-bar-integration', () => () => {} );
jest.mock( '../../hooks/use-agent-layout-manager', () => () => ( {
	isDocked: false,
	canDock: false,
	dock: jest.fn(),
	undock: jest.fn(),
	openSidebar: jest.fn(),
	closeSidebar: jest.fn(),
	createAgentPortal: ( children: React.ReactNode ) => children,
} ) );
jest.mock( '../../hooks/use-setup-custom-actions', () => () => {} );
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
	default: ( { chatHeaderOptions }: { chatHeaderOptions: { title: string }[] } ) => (
		<div data-testid="orchestrator-chat">
			{ chatHeaderOptions.map( ( option ) => option.title ).join( '|' ) }
		</div>
	),
} ) );
jest.mock( '../zendesk-chat', () => ( {
	__esModule: true,
	default: () => <div data-testid="zendesk-chat">Zendesk chat</div>,
} ) );
jest.mock( '../agent-history', () => ( {
	__esModule: true,
	default: () => <div data-testid="agent-history">History</div>,
} ) );
jest.mock( '../support-guide', () => ( {
	__esModule: true,
	default: () => <div data-testid="support-guide">Support guide</div>,
} ) );
jest.mock( '../support-guides', () => ( {
	__esModule: true,
	default: () => <div data-testid="support-guides">Support guides</div>,
} ) );

import AgentDock from '../agent-dock';

function renderAgentDock( initialEntry = '/chat' ) {
	return render(
		<MemoryRouter initialEntries={ [ initialEntry ] }>
			<AgentDock />
		</MemoryRouter>
	);
}

describe( 'AgentDock', () => {
	beforeEach( () => {
		mockShouldUseUnifiedAgent = false;
		mockContext = {
			siteKey: 'site-1',
			sectionName: 'reader-chat',
			agentConfig: {
				agentId: 'reader-chat',
			},
		} as Partial< AgentsManagerContextType >;
	} );

	it( 'does not expose Zendesk chat for Reader Chat when Unified Chat is enabled', async () => {
		mockShouldUseUnifiedAgent = true;

		renderAgentDock();

		expect( screen.getByTestId( 'orchestrator-chat' ).textContent ).toContain( 'New chat' );
		expect( screen.getByTestId( 'orchestrator-chat' ).textContent ).not.toContain(
			'New Zendesk chat'
		);

		renderAgentDock( '/zendesk' );

		await waitFor( () => expect( screen.queryByTestId( 'zendesk-chat' ) ).toBeNull() );
	} );

	it( 'keeps Zendesk chat available for regular agents when Unified Chat is enabled', () => {
		mockShouldUseUnifiedAgent = true;
		mockContext = {
			siteKey: 'site-1',
			sectionName: 'wp-admin',
			agentConfig: {
				agentId: 'wp-orchestrator',
			},
		} as Partial< AgentsManagerContextType >;

		renderAgentDock();

		expect( screen.getByTestId( 'orchestrator-chat' ).textContent ).toContain( 'New Zendesk chat' );
	} );
} );
