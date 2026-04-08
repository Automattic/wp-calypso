/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useSetupCustomActions from '../use-setup-custom-actions';

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( () => ( {
		hasLoaded: true,
		isOpen: false,
		isDocked: false,
		floatingPosition: '',
	} ) ),
	useDispatch: jest.fn( () => ( {
		setIsOpen: jest.fn(),
		setIsDocked: jest.fn(),
	} ) ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: jest.fn( () => jest.fn() ),
} ) );

jest.mock( '../../contexts', () => ( {
	useAgentsManagerContext: jest.fn( () => ( {
		getActiveSessionId: jest.fn( () => 'session-123' ),
	} ) ),
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
		delete window.__agentsManagerActions;
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
} );
