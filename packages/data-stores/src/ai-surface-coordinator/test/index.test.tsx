/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { dispatch, register, createReduxStore, select } from '@wordpress/data';
import { STORE_KEY as AM_KEY } from '../../agents-manager/constants';
import { STORE_KEY as HC_KEY } from '../../help-center/constants';
import { CSS_VAR_AM_STACK_BOTTOM, CSS_VAR_HC_STACK_BOTTOM, CSS_VAR_RAIL_INSET } from '../constants';
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

it( 'minimizes Agents Manager when Help Center opens while AM is floating-open', () => {
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );
	act( () => {
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( true );
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

it( 'writes layout CSS custom properties onto documentElement when enabled', () => {
	// Both surfaces minimized: AM open+minimized, HC shown+minimized, lastExpanded = help-center.
	// That means HC is on bottom (slot 0), AM is raised.
	window.localStorage.setItem( 'ai-surface-last-expanded', 'help-center' );
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true, isMinimized: true } );
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true, isMinimized: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );

	// After boot reconciliation the CSS vars should be set.
	const root = document.documentElement;
	expect( root.style.getPropertyValue( CSS_VAR_HC_STACK_BOTTOM ) ).toBe( '0px' );
	expect( root.style.getPropertyValue( CSS_VAR_AM_STACK_BOTTOM ) ).toBe( '64px' ); // MINIMIZED_BAR_HEIGHT(56) + STACK_GAP(8)
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
	// Round 1: AM open, HC opens → AM gets minimized.
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isOpen: true } );
	} );
	const { unmount } = renderHook( () => useAiSurfaceCoordinator( true ) );
	act( () => {
		( dispatch( HC_KEY ) as HCDispatch ).set( { showHelpCenter: true } );
	} );
	expect( select( AM_KEY ).getIsMinimized() ).toBe( true );

	// Round 2: restore AM to expanded (isMinimized: false), with HC still shown.
	// Now AM just-expanded → HC should be minimized.
	act( () => {
		( dispatch( AM_KEY ) as AMDispatch ).set( { isMinimized: false } );
	} );
	expect( select( HC_KEY ).getIsMinimized() ).toBe( true );

	unmount();
} );
