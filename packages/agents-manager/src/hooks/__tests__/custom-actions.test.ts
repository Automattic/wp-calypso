/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { takeActionOrigin } from '../../utils/action-origin';
import { getExternalContextEntries } from '../../utils/external-context';
import { clearSiteEditorActions, getSiteEditorActions } from '../../utils/site-editor-context';
import { recordAgentsManagerTracksEvent, recordBigSkyTracksEvent } from '../../utils/tracks';
import { useRegisterCustomActions, useSetupCustomActions } from '../custom-actions';

jest.mock( '../../utils/tracks', () => ( {
	BIG_SKY_EVENT_PREFIX: jest.requireActual( '../../utils/tracks' ).BIG_SKY_EVENT_PREFIX,
	recordAgentsManagerTracksEvent: jest.fn(),
	recordBigSkyTracksEvent: jest.fn(),
} ) );

const mockRecordBigSkyTracksEvent = recordBigSkyTracksEvent as jest.MockedFunction<
	typeof recordBigSkyTracksEvent
>;
const mockRecordAgentsManagerTracksEvent = recordAgentsManagerTracksEvent as jest.MockedFunction<
	typeof recordAgentsManagerTracksEvent
>;

const mockSetIsOpen = jest.fn();
const mockSetIsDocked = jest.fn();
const mockSetIsMinimized = jest.fn();
let mockContext = {
	getTabSessionId: jest.fn( () => 'session-123' ),
	resumeChat: jest.fn(),
	agentConfig: { agentId: 'reader-chat' },
};
let mockSelectState: {
	hasLoaded: boolean;
	isOpen: boolean;
	isDocked: boolean;
	isMinimized?: boolean;
	isChatVisible?: boolean;
	floatingPosition: string;
} = {
	hasLoaded: true,
	isOpen: false,
	isDocked: false,
	floatingPosition: '',
};
let mockLocation = { pathname: '/chat' };

jest.mock( '@wordpress/data', () => ( {
	useSelect: jest.fn( () => mockSelectState ),
	useDispatch: jest.fn( () => ( {
		setIsOpen: mockSetIsOpen,
		setIsDocked: mockSetIsDocked,
		setIsMinimized: mockSetIsMinimized,
	} ) ),
} ) );

jest.mock( 'react-router-dom', () => ( {
	useNavigate: jest.fn( () => jest.fn() ),
	useLocation: jest.fn( () => mockLocation ),
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
	setIsChatEnabled: jest.fn(),
	setDesktopMediaQuery: jest.fn(),
};

describe( 'useSetupCustomActions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		delete window.__agentsManagerActions;
		clearSiteEditorActions();
		takeActionOrigin( 'open' );
		takeActionOrigin( 'close' );
		takeActionOrigin( 'send' );
		mockContext = {
			getTabSessionId: jest.fn( () => 'session-123' ),
			resumeChat: jest.fn(),
			agentConfig: { agentId: 'reader-chat' },
		};
		mockSelectState = { hasLoaded: true, isOpen: false, isDocked: false, floatingPosition: '' };
		mockLocation = { pathname: '/chat' };
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
		expect( snapshot?.recordBigSkyTracksEvent ).toBeInstanceOf( Function );
		expect( snapshot?.resumeChat ).toBe( mockContext.resumeChat );
		expect( snapshot?.isReady ).toBe( true );
	} );

	it( 'relays full-name bridge Tracks calls unchanged', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		window.__agentsManagerActions?.recordBigSkyTracksEvent?.(
			'jetpack_big_sky_split_screen_guide_click',
			{
				component_type: 'proofread',
			}
		);
		expect( mockRecordBigSkyTracksEvent ).toHaveBeenCalledWith(
			'jetpack_big_sky_split_screen_guide_click',
			{
				component_type: 'proofread',
			}
		);
	} );

	it( 'drops malformed bridge Tracks event names', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		const record = window.__agentsManagerActions?.recordBigSkyTracksEvent as unknown as (
			eventName: unknown
		) => void;
		record( 'split_screen_guide_click' );
		record( 'jetpack_big_sky_' );
		record( '' );
		record( 123 );
		expect( mockRecordBigSkyTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'opens Reader Chat without persisting shared Agents Manager state', () => {
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( true, false );
	} );

	it( 'opens regular agents while preserving shared Agents Manager state persistence', () => {
		mockContext = {
			getTabSessionId: jest.fn( () => 'session-123' ),
			resumeChat: jest.fn(),
			agentConfig: { agentId: 'wp-orchestrator' },
		};
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( mockSetIsOpen ).toHaveBeenCalledWith( true, true );
	} );

	it( 'marks an open asked for through the bridge as host-triggered', () => {
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( takeActionOrigin( 'open' ) ).toBe( 'host' );
	} );

	it( 'does not mark an open that changes nothing', () => {
		mockSelectState = { ...mockSelectState, isOpen: true };
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( takeActionOrigin( 'open' ) ).toBe( 'user' );
	} );

	it( 'records a context hand-off from a host', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		window.__agentsManagerActions?.setContextEntry?.( {
			id: 'woocommerce-ai/intelligence',
			type: 'intelligence-tool',
			source: 'WooCommerce AI',
			delivery: 'conversation',
		} );

		expect( getExternalContextEntries().map( ( entry ) => entry.id ) ).toEqual( [
			'woocommerce-ai/intelligence',
		] );
		expect( mockRecordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_context_published',
			{ source: 'woocommerce_ai', type: 'intelligence_tool', delivery: 'conversation' }
		);
	} );

	it( 'normalises a missing delivery to Tracks form', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		window.__agentsManagerActions?.setContextEntry?.( {
			id: 'woocommerce-ai/page',
			source: 'WooCommerce AI',
			type: 'external-context',
		} );

		expect( mockRecordAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_agents_manager_context_published',
			{ source: 'woocommerce_ai', type: 'external_context', delivery: 'next_message' }
		);
	} );

	it( 'records nothing for a context entry without an id', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		window.__agentsManagerActions?.setContextEntry?.( { id: '' } );

		expect( mockRecordAgentsManagerTracksEvent ).not.toHaveBeenCalled();
	} );

	it( 'expands a minimized chat with a single save: un-minimize, no redundant open', () => {
		mockSelectState = {
			hasLoaded: true,
			isOpen: true,
			isDocked: false,
			isMinimized: true,
			floatingPosition: '',
		};
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( mockSetIsMinimized ).toHaveBeenCalledWith( false );
		// Open is unchanged, so no second (racing) save.
		expect( mockSetIsOpen ).not.toHaveBeenCalled();
		expect( takeActionOrigin( 'open' ) ).toBe( 'host' );
	} );

	it( 'opens a closed chat without a redundant minimized save', () => {
		mockSelectState = { hasLoaded: true, isOpen: false, isDocked: false, floatingPosition: '' };
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( true );

		expect( mockSetIsMinimized ).not.toHaveBeenCalled();
		expect( mockSetIsOpen ).toHaveBeenCalled();
	} );

	it( 'leaves the minimized state untouched when closing', () => {
		mockSelectState = { hasLoaded: true, isOpen: true, isDocked: false, floatingPosition: '' };
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( false );

		expect( mockSetIsMinimized ).not.toHaveBeenCalled();
	} );

	it( 'marks a close a host asked for, but not one that changes nothing', () => {
		mockSelectState = { hasLoaded: true, isOpen: true, isDocked: false, floatingPosition: '' };
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( false );
		expect( takeActionOrigin( 'close' ) ).toBe( 'host' );

		mockSelectState = { ...mockSelectState, isOpen: false };
		renderHook( () => useSetupCustomActions( { ...baseProps, canDock: false } ) );

		window.__agentsManagerActions?.setChatOpen?.( false );
		expect( takeActionOrigin( 'close' ) ).toBe( 'user' );
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

	it( 'resolves a pending `getChatState` once the store finishes loading', async () => {
		mockSelectState = { hasLoaded: false, isOpen: true, isDocked: false, floatingPosition: 'br' };
		const { rerender } = renderHook( () => useSetupCustomActions( baseProps ) );

		// Called before the store loads: the promise must stay pending.
		const pending = window.__agentsManagerActions!.getChatState();

		mockSelectState = { hasLoaded: true, isOpen: true, isDocked: false, floatingPosition: 'br' };
		rerender();

		await expect( pending ).resolves.toEqual( {
			isOpen: true,
			isDocked: false,
			floatingPosition: 'br',
		} );
	} );

	it( 'exposes a site editor action recorder on the actions API', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		window.__agentsManagerActions?.setSiteEditorAction?.( 'colorPickerItemSelected', 'Ruby' );

		expect( getSiteEditorActions() ).toEqual( {
			colorPickerItemSelected: 'Ruby',
		} );
	} );

	it( '`isChatVisible` reports the chat visibility from the store', () => {
		mockSelectState = {
			hasLoaded: true,
			isOpen: true,
			isDocked: false,
			isMinimized: false,
			isChatVisible: true,
			floatingPosition: '',
		};

		const { rerender } = renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions?.isChatVisible?.() ).toBe( true );

		mockSelectState = { ...mockSelectState, isChatVisible: false };
		rerender();

		expect( window.__agentsManagerActions?.isChatVisible?.() ).toBe( false );
	} );

	it( 'reports the current route via `getCurrentRoute`', () => {
		mockLocation = { pathname: '/history' };
		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions?.getCurrentRoute?.() ).toBe( '/history' );
	} );

	it( 'exposes the tab id the chat events carry via `getTabId`', () => {
		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions?.getTabId?.() ).toBe( 'fake-uuid' );
	} );

	it( 'exposes the current turn the chat events carry via `getTurnId`', () => {
		sessionStorage.setItem( 'agents-manager-turn-id', 'turn-1' );
		renderHook( () => useSetupCustomActions( baseProps ) );

		expect( window.__agentsManagerActions?.getTurnId?.() ).toBe( 'turn-1' );
		sessionStorage.removeItem( 'agents-manager-turn-id' );
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

	it( 'adapts when the set of registered keys changes between renders', () => {
		const setChatInput = jest.fn();
		const submitChatMessage = jest.fn( async () => undefined );

		const { rerender } = renderHook< void, { actions: Partial< AgentsManagerActions > } >(
			( { actions } ) => useRegisterCustomActions( actions ),
			{ initialProps: { actions: { setChatInput } } }
		);

		expect( window.__agentsManagerActions?.setChatInput ).toBe( setChatInput );

		// Drop `setChatInput`, add `submitChatMessage`: a key removed on re-render
		// (not just on unmount) must disappear, and a newly added key must publish.
		rerender( { actions: { submitChatMessage } } );

		expect( window.__agentsManagerActions?.setChatInput ).toBeUndefined();
		expect( window.__agentsManagerActions?.submitChatMessage ).toBe( submitChatMessage );
	} );
} );
