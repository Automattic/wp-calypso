/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { dispatch, register, createReduxStore, select } from '@wordpress/data';
import { STORE_KEY as AM_KEY } from '../../agents-manager/constants';
import { STORE_KEY as HC_KEY } from '../../help-center/constants';
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
