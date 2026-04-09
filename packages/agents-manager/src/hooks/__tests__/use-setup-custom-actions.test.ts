/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { recordTracksEvent, trackEvent, __resetTrackingForTests } from '../../tracking';
import useSetupCustomActions from '../use-setup-custom-actions';

jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ), {
	virtual: true,
} );

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
		__resetTrackingForTests();
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

describe( 'useSetupCustomActions — tracking integration', () => {
	beforeEach( () => {
		delete window.__agentsManagerActions;
		__resetTrackingForTests();
	} );

	it( 'wires a pre-set trackingHandler into the tracking module', () => {
		const fn = jest.fn();
		window.__agentsManagerActions = { trackingHandler: fn } as AgentsManagerActions;

		renderHook( () => useSetupCustomActions( baseProps ) );

		trackEvent( 'panel_view', { chat_state: 'sidebar' } );

		expect( fn ).toHaveBeenCalledWith( 'panel_view', {
			chat_state: 'sidebar',
		} );
	} );

	it( 'does not register a handler when none is pre-set', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		// No handler → trackEvent should be a no-op. Since we can't directly
		// observe "nothing happened", rely on the absence of throws and the
		// fact that default tracks still fire (via the other test below).
		expect( () => trackEvent( 'panel_view' ) ).not.toThrow();
	} );

	it( 'disables the default Calypso tracks path when disableDefaultTracks is pre-set', () => {
		window.__agentsManagerActions = {
			disableDefaultTracks: true,
		} as AgentsManagerActions;

		renderHook( () => useSetupCustomActions( baseProps ) );

		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const {
			recordTracksEvent: calypsoRecordTracksEvent,
		} = require( '@automattic/calypso-analytics' );

		recordTracksEvent( 'agents_manager_link_click', { href: '/a' } );

		expect( calypsoRecordTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'leaves the default Calypso tracks path enabled when disableDefaultTracks is not pre-set', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		// eslint-disable-next-line @typescript-eslint/no-require-imports
		const {
			recordTracksEvent: calypsoRecordTracksEvent,
		} = require( '@automattic/calypso-analytics' );
		calypsoRecordTracksEvent.mockClear();

		recordTracksEvent( 'agents_manager_link_click', { href: '/a' } );

		expect( calypsoRecordTracksEvent ).toHaveBeenCalledWith( 'calypso_agents_manager_link_click', {
			href: '/a',
		} );
	} );
} );
