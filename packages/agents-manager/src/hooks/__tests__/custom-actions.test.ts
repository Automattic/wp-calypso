/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { useRegisterCustomActions, useSetupCustomActions } from '../custom-actions';

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

describe( 'useSetupCustomActions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		delete window.__agentsManagerActions;
		mockContext = {
			getActiveSessionId: jest.fn( () => 'session-123' ),
			agentConfig: { agentId: 'reader-chat' },
		};
	} );

	it( 'sets `isReady` on the global after mount', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions?.isReady ).toBe( true );
	} );

	it( 'dispatches `agents-manager-ready` event after mount', () => {
		const listener = jest.fn();
		window.addEventListener( 'agents-manager-ready', listener );

		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( listener ).toHaveBeenCalledTimes( 1 );

		window.removeEventListener( 'agents-manager-ready', listener );
	} );

	it( 'fires `agents-manager-ready` only once across re-renders', () => {
		const listener = jest.fn();
		window.addEventListener( 'agents-manager-ready', listener );

		const { rerender } = renderHook( () => useSetupCustomActions( baseProps ) );
		rerender();
		rerender();

		expect( listener ).toHaveBeenCalledTimes( 1 );

		window.removeEventListener( 'agents-manager-ready', listener );
	} );

	it( 'populates the actions API before firing `agents-manager-ready`', () => {
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

	it( 'removes its actions from the global on unmount', () => {
		const { unmount } = renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions?.setChatOpen ).toBeInstanceOf( Function );

		unmount();

		expect( window.__agentsManagerActions?.setChatOpen ).toBeUndefined();
		expect( window.__agentsManagerActions?.isReady ).toBeUndefined();
	} );

	it( 'preserves pre-set initial values across mount', () => {
		window.__agentsManagerActions = {
			isCompactMode: true,
			isChatEnabled: false,
		} as AgentsManagerActions;

		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions.isCompactMode ).toBe( true );
		expect( window.__agentsManagerActions.isChatEnabled ).toBe( false );
		expect( window.__agentsManagerActions.setChatOpen ).toBeInstanceOf( Function );
	} );

	it( 'resolves `getChatState` immediately once the store has loaded', async () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		const state = await window.__agentsManagerActions?.getChatState?.();

		expect( state ).toEqual( {
			isOpen: false,
			isDocked: false,
			floatingPosition: '',
		} );
	} );
} );

describe( 'useRegisterCustomActions', () => {
	beforeEach( () => {
		delete window.__agentsManagerActions;
	} );

	it( 'publishes actions onto the global after mount', () => {
		const setChatInput = jest.fn();

		renderHook( () => useRegisterCustomActions( { setChatInput } ) );

		window.__agentsManagerActions?.setChatInput?.( 'hello' );
		expect( setChatInput ).toHaveBeenCalledWith( 'hello' );
	} );

	it( 'removes its keys from the global on unmount', () => {
		const setChatInput = jest.fn();
		const { unmount } = renderHook( () => useRegisterCustomActions( { setChatInput } ) );

		expect( window.__agentsManagerActions?.setChatInput ).toBe( setChatInput );

		unmount();

		expect( window.__agentsManagerActions?.setChatInput ).toBeUndefined();
	} );

	it( 'preserves pre-existing keys (merge, not replace)', () => {
		const setChatInput = jest.fn();
		window.__agentsManagerActions = { isCompactMode: true } as AgentsManagerActions;

		renderHook( () => useRegisterCustomActions( { setChatInput } ) );

		expect( window.__agentsManagerActions.isCompactMode ).toBe( true );
		expect( window.__agentsManagerActions.setChatInput ).toBe( setChatInput );
	} );

	it( 'leaves a key alone on cleanup if another caller has overwritten it', () => {
		const firstFn = jest.fn();
		const secondFn = jest.fn();

		const { unmount } = renderHook( () => useRegisterCustomActions( { setChatInput: firstFn } ) );

		// Simulate another owner overwriting the key.
		window.__agentsManagerActions!.setChatInput = secondFn;

		unmount();

		// The cleanup must not delete the second owner's value.
		expect( window.__agentsManagerActions?.setChatInput ).toBe( secondFn );
	} );

	it( 'updates the global when an action reference changes', () => {
		const first = jest.fn();
		const second = jest.fn();

		const { rerender } = renderHook(
			( { fn }: { fn: ( value: string ) => void } ) =>
				useRegisterCustomActions( { setChatInput: fn } ),
			{ initialProps: { fn: first } }
		);

		expect( window.__agentsManagerActions?.setChatInput ).toBe( first );

		rerender( { fn: second } );

		expect( window.__agentsManagerActions?.setChatInput ).toBe( second );
	} );
} );
