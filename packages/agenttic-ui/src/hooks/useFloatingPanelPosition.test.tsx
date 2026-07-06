// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { animate, type PanInfo } from 'framer-motion';

// Spy on animate while keeping the real implementation so the springs still run.
vi.mock( 'framer-motion', async ( importOriginal ) => {
	const actual = await importOriginal< typeof import('framer-motion') >();
	return { ...actual, animate: vi.fn( actual.animate ) };
} );
const animateSpy = vi.mocked( animate );
import { STYLE_CONSTANTS } from '../utils/constants';
import {
	useFloatingPanelPosition,
	type UseFloatingPanelPositionArgs,
	type UseFloatingPanelPositionResult,
} from './useFloatingPanelPosition';

// Opt into React's act environment so state updates don't warn (matches the
// component test suites).
(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

type Args = Partial< UseFloatingPanelPositionArgs >;

function buildArgs( overrides: Args ): UseFloatingPanelPositionArgs {
	return {
		freeDrag: false,
		initialFreeDragPosition: undefined,
		chatState: 'expanded',
		...overrides,
	};
}

function renderHook( initialArgs: Args ) {
	const captured: { current: UseFloatingPanelPositionResult | null } = {
		current: null,
	};
	let currentArgs = buildArgs( initialArgs );
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	const root = createRoot( container );

	function Probe() {
		captured.current = useFloatingPanelPosition( currentArgs );
		return null;
	}

	const render = async () => {
		await act( async () => {
			root.render( createElement( Probe ) );
		} );
	};

	const rerender = async ( next: Args ) => {
		currentArgs = buildArgs( next );
		await render();
	};

	const unmount = async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	};

	return { captured, render, rerender, unmount };
}

const PAN_INFO = { velocity: { x: 0, y: 0 } } as PanInfo;

describe( 'useFloatingPanelPosition', () => {
	let harness: ReturnType< typeof renderHook >;

	beforeEach( () => {
		localStorage.clear();
		window.innerWidth = 1280;
		window.innerHeight = 1024;
		animateSpy.mockClear();
	} );

	afterEach( async () => {
		await harness.unmount();
		vi.restoreAllMocks();
		localStorage.clear();
	} );

	it( 'calculateSnapPosition docks the right side analytically (DOM-free)', async () => {
		harness = renderHook( { initialChatPosition: 'right' } );
		await harness.render();
		const result = harness.captured.current!;

		const position = result.calculateSnapPosition( 'right' );
		// Analytic dock x = innerWidth - width - 2*offset; bottom-anchored y = 0.
		expect( position ).toEqual( {
			x:
				window.innerWidth -
				STYLE_CONSTANTS.COMPACT_WIDTH -
				STYLE_CONSTANTS.VIEWPORT_OFFSET * 2,
			y: 0,
		} );
	} );

	it( 'calculateSnapPosition docks the left side to the origin (DOM-free)', async () => {
		harness = renderHook( { initialChatPosition: 'left' } );
		await harness.render();
		const result = harness.captured.current!;

		const position = result.calculateSnapPosition( 'left' );
		expect( position ).toEqual( { x: 0, y: 0 } );
	} );

	it( 'fires onChatPositionChange once when the drop lands on the opposite side', async () => {
		const onChatPositionChange = vi.fn();
		harness = renderHook( {
			initialChatPosition: 'left',
			onChatPositionChange,
		} );
		await harness.render();
		const result = harness.captured.current!;

		// Drop clearly on the right half.
		await act( async () => {
			result.x.set( window.innerWidth );
			result.handleDragEnd( null, PAN_INFO );
		} );

		expect( onChatPositionChange ).toHaveBeenCalledTimes( 1 );
		expect( onChatPositionChange ).toHaveBeenCalledWith( 'right' );
	} );

	it( 'does not fire onChatPositionChange when the drop stays on the same side', async () => {
		const onChatPositionChange = vi.fn();
		harness = renderHook( {
			initialChatPosition: 'left',
			onChatPositionChange,
		} );
		await harness.render();
		const result = harness.captured.current!;

		await act( async () => {
			result.x.set( 0 );
			result.handleDragEnd( null, PAN_INFO );
		} );

		expect( onChatPositionChange ).not.toHaveBeenCalled();
	} );

	it( 'reports the dropped pixel position via onFreeDragEnd in free-drag mode', async () => {
		const onFreeDragEnd = vi.fn();
		harness = renderHook( { freeDrag: true, onFreeDragEnd } );
		await harness.render();
		const result = harness.captured.current!;

		await act( async () => {
			result.x.set( 240 );
			result.y.set( -120 );
			result.handleDragEnd( null, PAN_INFO );
		} );

		expect( onFreeDragEnd ).toHaveBeenCalledTimes( 1 );
		expect( onFreeDragEnd ).toHaveBeenCalledWith( { x: 240, y: -120 } );
	} );

	it( 'does not start a move-drag when the target is from an iframe', async () => {
		harness = renderHook( {} );
		await harness.render();
		const result = harness.captured.current!;
		const startSpy = vi.spyOn( result.dragControls, 'start' );

		// A different ownerDocument signals an iframe-hosted element.
		const iframeTarget = {
			ownerDocument: {},
			closest: () => null,
		};
		result.handlePointerDown( {
			target: iframeTarget,
			nativeEvent: {},
			preventDefault: () => {},
		} as unknown as React.PointerEvent< HTMLDivElement > );

		expect( startSpy ).not.toHaveBeenCalled();
	} );

	it( 'starts a move-drag for a plain body pointer-down', async () => {
		harness = renderHook( {} );
		await harness.render();
		const result = harness.captured.current!;
		const startSpy = vi.spyOn( result.dragControls, 'start' );

		const body = document.createElement( 'div' );
		result.handlePointerDown( {
			target: body,
			nativeEvent: {},
			preventDefault: () => {},
		} as unknown as React.PointerEvent< HTMLDivElement > );

		expect( startSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'drag-end snap docks to the analytic corner { cornerX, 0 }', async () => {
		harness = renderHook( { initialChatPosition: 'right' } );
		await harness.render();
		const result = harness.captured.current!;

		// Drop on the right half so newSide stays 'right'.
		await act( async () => {
			result.x.set( window.innerWidth );
			result.handleDragEnd( null, PAN_INFO );
		} );

		const animateTargetFor = ( motionValue: unknown ) =>
			animateSpy.mock.calls.find(
				( call ) => call[ 0 ] === motionValue
			)?.[ 1 ];

		const cornerX =
			window.innerWidth -
			STYLE_CONSTANTS.COMPACT_WIDTH -
			STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;
		expect( animateTargetFor( result.x ) ).toBe( cornerX );
		expect( animateTargetFor( result.y ) ).toBe( 0 );
	} );
} );
