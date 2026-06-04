/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { dispatch, register, createReduxStore, select } from '@wordpress/data';
import { STORE_KEY as AM_KEY } from '../../agents-manager/constants';
import { STORE_KEY as HC_KEY } from '../../help-center/constants';
import { CSS_VAR_HC_BOTTOM_OFFSET, CSS_VAR_RAIL_INSET } from '../constants';
import { useAiSurfaceCoordinator } from '../index';

function registerStubStores() {
	register(
		createReduxStore( HC_KEY, {
			reducer: (
				state = { showHelpCenter: false, isMinimized: false },
				action: { type: string; payload?: Record< string, unknown > }
			) => ( action.type === 'SET' ? { ...state, ...action.payload } : state ),
			actions: {
				set: ( payload: Record< string, unknown > ) => ( { type: 'SET', payload } ),
				setIsMinimized: ( isMinimized: boolean ) => ( {
					type: 'SET',
					payload: { isMinimized },
				} ),
			},
			selectors: {
				isHelpCenterShown: ( s: { showHelpCenter: boolean } ) => s.showHelpCenter,
				getIsMinimized: ( s: { isMinimized: boolean } ) => s.isMinimized,
			},
		} )
	);
	register(
		createReduxStore( AM_KEY, {
			reducer: (
				state = { isOpen: false, isMinimized: false, isDocked: false },
				action: { type: string; payload?: Record< string, unknown > }
			) => ( action.type === 'SET' ? { ...state, ...action.payload } : state ),
			actions: {
				set: ( payload: Record< string, unknown > ) => ( { type: 'SET', payload } ),
				setIsOpen: ( isOpen: boolean ) => ( { type: 'SET', payload: { isOpen } } ),
				setIsMinimized: ( isMinimized: boolean ) => ( {
					type: 'SET',
					payload: { isMinimized },
				} ),
			},
			selectors: {
				getIsOpen: ( s: { isOpen: boolean } ) => s.isOpen,
				getIsMinimized: ( s: { isMinimized: boolean } ) => s.isMinimized,
				getIsDocked: ( s: { isDocked: boolean } ) => s.isDocked,
			},
		} )
	);
}

type HCDispatch = { set: ( p: Record< string, unknown > ) => void };
type AMDispatch = { set: ( p: Record< string, unknown > ) => void };

let storesRegistered = false;
beforeEach( () => {
	window.localStorage.clear();
	if ( ! storesRegistered ) {
		registerStubStores();
		storesRegistered = true;
	}
	// Reset store state between tests.
	( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: false, isMinimized: false } );
	( dispatch( AM_KEY ) as AMDispatch ).set( {
		isOpen: false,
		isMinimized: false,
		isDocked: false,
	} );
} );

it( 'minimizes Agents Manager to its bar when Help Center opens while AM is expanded', () => {
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );
	act( () => {
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( true );
	expect( select( AM_KEY ).getIsOpen() ).toBe( true ); // still open, just minimized to the bar
	unmount();
} );

it( 'minimizes Help Center when Agents Manager expands over an open Help Center', () => {
	act( () => {
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true } );
	} );
	expect( select( HC_KEY ).getIsMinimized() ).toBe( true );
	unmount();
} );

it( 'no-ops when disabled', () => {
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( false ) );
	act( () => {
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( false );
	unmount();
} );

it( "offsets Help Center above Agents Manager's Ask AI bar via a CSS custom property", () => {
	// AM open + minimized → its Ask AI bar is shown, HC open above it.
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true, isMinimized: true } );
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );

	const root = document.documentElement;
	expect( root.style.getPropertyValue( CSS_VAR_HC_BOTTOM_OFFSET ) ).toBe( '64px' ); // 56 + 8
	expect( root.style.getPropertyValue( CSS_VAR_RAIL_INSET ) ).toBe( '0px' );
	unmount();
} );

it( 'does NOT coordinate after unmount', () => {
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );
	unmount();

	// After unmount, opening HC must NOT minimize AM.
	act( () => {
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( false );
} );

it( 'handles a second conflict correctly after a first (re-entrancy / stale prev)', () => {
	// Round 1: AM open, HC opens → AM minimized to its bar.
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );
	act( () => {
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( true );

	// Round 2: AM un-minimizes (re-expands) while HC is still shown → AM just
	// became expanded, so Help Center is minimized.
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isMinimized: false } );
	} );
	expect( select( HC_KEY ).getIsMinimized() ).toBe( true );

	unmount();
} );
