/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useSetupCustomActions from '../use-setup-custom-actions';

const mockSetIsOpen = jest.fn();
const mockSetIsDocked = jest.fn();
let mockContext = {
	getActiveSessionId: jest.fn( () => 'session-123' ),
	agentConfig: { agentId: 'reader-chat' },
};

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( () => ( {
		hasLoaded: true,
		isOpen: false,
		isDocked: false,
		floatingPosition: '',
	} ) ),
	useDispatch: jest.fn( () => ( {
		setIsOpen: mockSetIsOpen,
		setIsDocked: mockSetIsDocked,
	} ) ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: jest.fn( () => jest.fn() ),
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: jest.fn( () => mockContext ),
} ) );

jest.mock( '../../stores', () => ( {
	AGENTS_MANAGER_STORE: 'agents-manager-store',
} ) );

const baseProps = {
	dock: jest.fn(),
	undock: jest.fn(),
	openSidebar: jest.fn(),
	closeSidebar: jest.fn(),
	canDock: true,
	setIsCompactMode: jest.fn(),
	setShouldRenderChat: jest.fn(),
	setDesktopMediaQuery: jest.fn(),
};

describe( 'useSetupCustomActions — ready signal', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		delete window.__agentsManagerActions;
		mockContext = {
			getActiveSessionId: jest.fn( () => 'session-123' ),
			agentConfig: { agentId: 'reader-chat' },
		};
	} );

	it( 'sets isReady on the global after mount', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions?.isReady ).toBe( true );
	} );

	it( 'dispatches agents-manager-ready event after mount', () => {
		const listener = jest.fn();
		window.addEventListener( 'agents-manager-ready', listener );

		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( listener ).toHaveBeenCalledTimes( 1 );

		window.removeEventListener( 'agents-manager-ready', listener );
	} );

	it( 'fires the ready event only once across re-renders', () => {
		const listener = jest.fn();
		window.addEventListener( 'agents-manager-ready', listener );

		const { rerender } = renderHook( () => useSetupCustomActions( baseProps ) );
		rerender();
		rerender();

		expect( listener ).toHaveBeenCalledTimes( 1 );

		window.removeEventListener( 'agents-manager-ready', listener );
	} );

	it( 'populates the actions API before firing the ready event', () => {
		let snapshot: AgentsManagerActions | undefined;
		window.addEventListener( 'agents-manager-ready', () => {
			snapshot = window.__agentsManagerActions;
		} );

		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( snapshot?.setChatOpen ).toBeInstanceOf( Function );
		expect( snapshot?.setChatDocked ).toBeInstanceOf( Function );
		expect( snapshot?.isReady ).toBe( true );
	} );

	it( 'opens Reader Chat without persisting shared Agents Manager state', () => {
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( true, false );
	} );

	it( 'opens regular agents while preserving shared Agents Manager state persistence', () => {
		mockContext = {
			getActiveSessionId: jest.fn( () => 'session-123' ),
			agentConfig: { agentId: 'wp-orchestrator' },
		};
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( true, true );
	} );
} );
