// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { animate, type PanInfo, useMotionValue } from 'framer-motion';

// Spy on animate while keeping the real implementation so the springs still run.
vi.mock( 'framer-motion', async ( importOriginal ) => {
	const actual = await importOriginal< typeof import('framer-motion') >();
	return { ...actual, animate: vi.fn( actual.animate ) };
} );
const animateSpy = vi.mocked( animate );
import { STYLE_CONSTANTS } from '../utils/constants';
import type { ChatSize } from '../types';
import {
	useFloatingPanelPosition,
	type UseFloatingPanelPositionArgs,
	type UseFloatingPanelPositionResult,
} from './useFloatingPanelPosition';

// Opt into React's act environment so state updates don't warn (matches the
// component + resize-hook test suites).
(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

// Default size accessors the drag hook reads from the resize hook. Tests can
// override per-case; clampResizedSize is a no-op since size clamping is the
// resize hook's concern, not the drag hook's.
const FIXED_SIZE: ChatSize = {
	width: STYLE_CONSTANTS.COMPACT_WIDTH,
	height: STYLE_CONSTANTS.EXPANDED_HEIGHT,
};

// x/y are owned by the composition hook, so the Probe creates them and merges
// them in — mirrors useResizablePanel.test.tsx.
type Args = Partial< Omit< UseFloatingPanelPositionArgs, 'x' | 'y' > >;

function buildArgs(
	overrides: Args,
	x: UseFloatingPanelPositionArgs[ 'x' ],
	y: UseFloatingPanelPositionArgs[ 'y' ]
): UseFloatingPanelPositionArgs {
	const getPanelSize = overrides.getPanelSize ?? ( () => FIXED_SIZE );
	return {
		freeDrag: false,
		chatState: 'expanded',
		getPanelSize,
		clampResizedSize: () => {},
		...overrides,
		x,
		y,
	};
}

function renderHook( initialArgs: Args ) {
	const captured: { current: UseFloatingPanelPositionResult | null } = {
		current: null,
	};
	let currentOverrides = initialArgs;
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	const root = createRoot( container );

	function Probe() {
		const x = useMotionValue( 0 );
		const y = useMotionValue( 0 );
		captured.current = useFloatingPanelPosition(
			buildArgs( currentOverrides, x, y )
		);
		return null;
	}

	const render = async () => {
		await act( async () => {
			root.render( createElement( Probe ) );
		} );
	};

	const rerender = async ( next: Args ) => {
		currentOverrides = next;
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

	it( 'does not start a move-drag from a resize-handle pointer-down', async () => {
		harness = renderHook( {} );
		await harness.render();
		const result = harness.captured.current!;
		const startSpy = vi.spyOn( result.dragControls, 'start' );

		const handle = document.createElement( 'div' );
		handle.setAttribute( 'data-slot', 'resize-handle' );
		result.handlePointerDown( {
			target: handle,
			nativeEvent: {},
			preventDefault: () => {},
		} as unknown as React.PointerEvent< HTMLDivElement > );

		expect( startSpy ).not.toHaveBeenCalled();
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

	describe( 'repositionForResize', () => {
		// Pull the target of the animate() call for a given motion value. Asserts
		// the position target (not just that something animated) per the contract.
		const animateTargetFor = ( motionValue: unknown ) =>
			animateSpy.mock.calls.find(
				( call ) => call[ 0 ] === motionValue
			)?.[ 1 ];

		it( 'free-drag: clamps a grown right-side panel back on-screen (pins the right edge)', async () => {
			const grownSize: ChatSize = { width: 900, height: 700 };
			harness = renderHook( {
				freeDrag: true,
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// Panel dragged to the far right, then grown: its right edge now
			// overflows. Reposition must pull x back inside the box.
			await act( async () => {
				result.x.set( 1000 );
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize();
			} );

			// maxX = innerWidth - width - 2*offset = 1280 - 900 - 32 = 348.
			const maxX =
				window.innerWidth -
				grownSize.width -
				STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;

			expect( animateTargetFor( result.x ) ).toBe( maxX );
			// Bottom-docked (y=0) grow: the top does NOT overflow, so `y` is held
			// (skipY) — the CSS bottom anchor keeps the bottom pinned and grows the
			// box upward. No `y` animation.
			expect( animateTargetFor( result.y ) ).toBeUndefined();
		} );

		it( 'free-drag: grow at a bottom-docked position does NOT move y (bottom stays pinned)', async () => {
			const grownSize: ChatSize = { width: 372, height: 700 };
			harness = renderHook( {
				freeDrag: true,
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// Bottom-left, flush bottom: x=0, y=0. Grow tall (520 -> 700).
			await act( async () => {
				result.x.set( 0 );
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize();
			} );

			// x holds at 0 (already inside), and y is never animated — the bottom
			// edge stays pinned, the panel grows straight upward.
			expect( animateTargetFor( result.x ) ).toBe( 0 );
			expect( animateTargetFor( result.y ) ).toBeUndefined();
		} );

		it( 'free-drag: grow that overflows the top brings the top to the inset (bottom moves down, never up)', async () => {
			const grownSize: ChatSize = { width: 372, height: 700 };
			harness = renderHook( {
				freeDrag: true,
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// Panel dragged high (y very negative): with the new tall height the
			// grown TOP edge crosses the top inset. minY = 32 + 700 - 1024 = -292.
			const minY =
				2 * STYLE_CONSTANTS.VIEWPORT_OFFSET +
				grownSize.height -
				window.innerHeight;
			await act( async () => {
				result.x.set( 0 );
				result.y.set( -500 ); // below minY: top overflows the inset
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize();
			} );

			// y is raised to minY (top pinned at the inset). minY (-292) > -500, so
			// the panel moves DOWN — the bottom is never lifted further up.
			expect( animateTargetFor( result.y ) ).toBe( minY );
			expect( minY ).toBeGreaterThan( -500 );
		} );

		it( 'corner-snap left: grow holds y (no upward drift), first and repeated', async () => {
			const grownSize: ChatSize = { width: 372, height: 700 };
			harness = renderHook( {
				freeDrag: false,
				initialChatPosition: 'left',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// Docked bottom-left: x=0, y=0. minY = 32 + 700 - 1024 = -292, so y=0
			// is above it (no top overflow) → y held.
			await act( async () => {
				result.x.set( 0 );
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize();
			} );

			// Left dock x = 0; y never animated (bottom pinned, box grows upward).
			expect( animateTargetFor( result.x ) ).toBe( 0 );
			expect( animateTargetFor( result.y ) ).toBeUndefined();

			// Second grow click must behave identically — no first-click drift.
			animateSpy.mockClear();
			await act( async () => {
				result.repositionForResize();
			} );
			expect( animateTargetFor( result.x ) ).toBe( 0 );
			expect( animateTargetFor( result.y ) ).toBeUndefined();
		} );

		it( 'corner-snap right: grow slides x left to the analytic dock and holds y, first and repeated', async () => {
			const grownSize: ChatSize = { width: 600, height: 500 };
			harness = renderHook( {
				freeDrag: false,
				initialChatPosition: 'right',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			await act( async () => {
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			// Right dock x = innerWidth - width - 2*offset = 1280 - 600 - 32 = 648.
			const snapX =
				window.innerWidth -
				grownSize.width -
				STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;

			await act( async () => {
				result.repositionForResize();
			} );
			expect( animateTargetFor( result.x ) ).toBe( snapX );
			expect( animateTargetFor( result.y ) ).toBeUndefined();

			// Repeated click: same target, no drift.
			animateSpy.mockClear();
			await act( async () => {
				result.repositionForResize();
			} );
			expect( animateTargetFor( result.x ) ).toBe( snapX );
			expect( animateTargetFor( result.y ) ).toBeUndefined();
		} );

		it( 'corner-snap: grow that overflows the top pins the top to the inset (minY)', async () => {
			const grownSize: ChatSize = { width: 372, height: 700 };
			harness = renderHook( {
				freeDrag: false,
				initialChatPosition: 'left',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// minY = 32 + 700 - 1024 = -292. Start below it (top overflows).
			const minY =
				2 * STYLE_CONSTANTS.VIEWPORT_OFFSET +
				grownSize.height -
				window.innerHeight;
			await act( async () => {
				result.x.set( 0 );
				result.y.set( -500 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize();
			} );

			// y raised to minY (top pinned at inset); minY > -500 so panel moves DOWN.
			expect( animateTargetFor( result.y ) ).toBe( minY );
			expect( minY ).toBeGreaterThan( -500 );
		} );

		it( 'corner-snap: minimized skips y and docks x analytically', async () => {
			const grownSize: ChatSize = { width: 600, height: 500 };
			harness = renderHook( {
				freeDrag: false,
				initialChatPosition: 'right',
				chatState: 'minimized',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			await act( async () => {
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize();
			} );

			// x docks; y is skipped (bottom:0 pins the minimized tab).
			expect( animateTargetFor( result.x ) ).toBe(
				window.innerWidth -
					grownSize.width -
					STYLE_CONSTANTS.VIEWPORT_OFFSET * 2
			);
			expect( animateTargetFor( result.y ) ).toBeUndefined();
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

			const cornerX =
				window.innerWidth -
				STYLE_CONSTANTS.COMPACT_WIDTH -
				STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;
			expect( animateTargetFor( result.x ) ).toBe( cornerX );
			expect( animateTargetFor( result.y ) ).toBe( 0 );
		} );

		it( 'free-drag RIGHT side: grow shifts x left by exactly Δ (right edge held)', async () => {
			// Grown to 600 from a pre-grow 400 → Δ = 200. Right side pins the
			// current right edge, so x must decrease by Δ.
			const grownSize: ChatSize = { width: 600, height: 500 };
			harness = renderHook( {
				freeDrag: true,
				initialChatPosition: 'right',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// Mid-viewport: x=500 well inside [0, maxX]. maxX = 1280-600-32 = 648.
			await act( async () => {
				result.x.set( 500 );
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize( 200 );
			} );

			// x = 500 - 200 = 300 (right edge fixed). y held (bottom pinned).
			expect( animateTargetFor( result.x ) ).toBe( 300 );
			expect( animateTargetFor( result.y ) ).toBeUndefined();

			// Repeated grow keeps pinning the (new) right edge: 500 pre-grow width
			// this time, Δ = 100, x = 300 - 100 = 200.
			await act( async () => {
				result.x.set( 300 );
			} );
			animateSpy.mockClear();
			await act( async () => {
				harness.captured.current!.repositionForResize( 100 );
			} );
			expect( animateTargetFor( result.x ) ).toBe( 200 );
		} );

		it( 'free-drag LEFT side: grow holds x (left edge fixed, grows right)', async () => {
			const grownSize: ChatSize = { width: 600, height: 500 };
			harness = renderHook( {
				freeDrag: true,
				initialChatPosition: 'left',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// x=100, inside [0, maxX=648]. Left side → no shift.
			await act( async () => {
				result.x.set( 100 );
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize( 200 );
			} );

			expect( animateTargetFor( result.x ) ).toBe( 100 );
			expect( animateTargetFor( result.y ) ).toBeUndefined();
		} );

		it( 'free-drag LEFT side: grown right edge overflow clamps to maxX', async () => {
			const grownSize: ChatSize = { width: 900, height: 500 };
			harness = renderHook( {
				freeDrag: true,
				initialChatPosition: 'left',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// maxX = 1280 - 900 - 32 = 348. x=600 overflows → clamps to maxX.
			await act( async () => {
				result.x.set( 600 );
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize( 200 );
			} );

			const maxX =
				window.innerWidth -
				grownSize.width -
				STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;
			expect( animateTargetFor( result.x ) ).toBe( maxX );
		} );

		it( 'free-drag RIGHT side near the left edge: right-pin would push left off → clamps to 0', async () => {
			const grownSize: ChatSize = { width: 600, height: 500 };
			harness = renderHook( {
				freeDrag: true,
				initialChatPosition: 'right',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// x=100, Δ=200 → xTarget = 100 - 200 = -100. Left-edge containment
			// wins: clamps to 0 (left edge pins to the inset, grows right instead).
			await act( async () => {
				result.x.set( 100 );
				result.y.set( 0 );
			} );
			animateSpy.mockClear();

			await act( async () => {
				result.repositionForResize( 200 );
			} );

			expect( animateTargetFor( result.x ) ).toBe( 0 );
		} );

		it( 'window-resize passes Δ=0: pure clamp, no directional shift on a right-side panel', async () => {
			const grownSize: ChatSize = { width: 600, height: 500 };
			harness = renderHook( {
				freeDrag: true,
				initialChatPosition: 'right',
				getPanelSize: () => grownSize,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// x=300, well inside [0, maxX=648]. A window resize must hold x (no shift).
			await act( async () => {
				result.x.set( 300 );
				result.y.set( 0 );
			} );

			await act( async () => {
				window.dispatchEvent( new Event( 'resize' ) );
			} );

			// x.set (not animate) directly; unchanged because Δ=0 and 300 is inside.
			expect( result.x.get() ).toBe( 300 );
		} );

		it( 'no-ops while a drag is in flight', async () => {
			harness = renderHook( { freeDrag: true } );
			await harness.render();
			const result = harness.captured.current!;

			// Enter the dragging state, then attempt a reposition. Re-read the
			// captured result so we call the post-render closure (isDragging=true).
			await act( async () => {
				result.handleDragStart();
			} );
			animateSpy.mockClear();

			await act( async () => {
				harness.captured.current!.repositionForResize();
			} );

			expect( animateSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'window resize y recovery', () => {
		it( 'shrink pushes y down to keep the top reachable, grow pulls it back to the dock', async () => {
			// Collapsed launcher (56px) docked at y=0; the clamp must use the REAL
			// state height, not the expanded 520 — with 520 a 500px window computed
			// minY = 52 and pushed the 56px launcher off the bottom.
			harness = renderHook( {
				chatState: 'collapsed',
				getPanelSize: () => ( {
					width: STYLE_CONSTANTS.COMPACT_WIDTH,
					height: STYLE_CONSTANTS.COLLAPSED_SIZE,
				} ),
			} );
			await harness.render();
			const result = harness.captured.current!;

			await act( async () => {
				result.y.set( 0 );
				window.innerHeight = 500;
				window.dispatchEvent( new Event( 'resize' ) );
			} );
			// minY = 32 + 56 - 500 < 0: the launcher fits, y must stay docked.
			expect( result.y.get() ).toBe( 0 );

			// Expanded panel taller than the window: y is raised to minY so the
			// header stays reachable (bottom edge sacrificed).
			await harness.rerender( { chatState: 'expanded' } );
			await act( async () => {
				window.innerHeight = 500;
				window.dispatchEvent( new Event( 'resize' ) );
			} );
			const minY =
				2 * STYLE_CONSTANTS.VIEWPORT_OFFSET +
				FIXED_SIZE.height -
				window.innerHeight;
			expect( minY ).toBeGreaterThan( 0 );
			expect( result.y.get() ).toBe( minY );

			// Window grows back: the stale positive offset must return to the 0
			// dock, not be held forever (the old hold-only guard never recovered).
			await act( async () => {
				window.innerHeight = 1024;
				window.dispatchEvent( new Event( 'resize' ) );
			} );
			expect( result.y.get() ).toBe( 0 );
		} );
	} );

	describe( 'free-drag drop clamping', () => {
		it( 'clamps an escaped drop back into the box before persisting it', async () => {
			// dragConstraints bind mid-gesture only, so a fast flick can end
			// off-screen — the drop handler must clamp what it persists.
			const onFreeDragEnd = vi.fn();
			harness = renderHook( { freeDrag: true, onFreeDragEnd } );
			await harness.render();
			const result = harness.captured.current!;

			await act( async () => {
				result.x.set( 2000 );
				result.y.set( 50 );
				result.handleDragEnd( null, PAN_INFO );
			} );

			const maxX =
				window.innerWidth -
				FIXED_SIZE.width -
				STYLE_CONSTANTS.VIEWPORT_OFFSET * 2;
			expect( onFreeDragEnd ).toHaveBeenCalledWith( {
				x: maxX,
				y: 0,
			} );
			// The panel itself animates back inside the box too.
			const animateTargetFor = ( motionValue: unknown ) =>
				animateSpy.mock.calls.find(
					( call ) => call[ 0 ] === motionValue
				)?.[ 1 ];
			expect( animateTargetFor( result.x ) ).toBe( maxX );
			expect( animateTargetFor( result.y ) ).toBe( 0 );
		} );

		it( 'reports the drop unchanged when it is already inside the box', async () => {
			const onFreeDragEnd = vi.fn();
			harness = renderHook( { freeDrag: true, onFreeDragEnd } );
			await harness.render();
			const result = harness.captured.current!;

			await act( async () => {
				result.x.set( 300 );
				result.y.set( -100 );
				result.handleDragEnd( null, PAN_INFO );
			} );

			expect( onFreeDragEnd ).toHaveBeenCalledWith( { x: 300, y: -100 } );
		} );
	} );

	describe( 'runtime insets change', () => {
		const animateTargetFor = ( motionValue: unknown ) =>
			animateSpy.mock.calls.find(
				( call ) => call[ 0 ] === motionValue
			)?.[ 1 ];

		it( 're-clamps a free-drag panel out of a newly reserved top area', async () => {
			const defaultInsets = {
				top: 16,
				right: 16,
				bottom: 16,
				left: 16,
			};
			harness = renderHook( {
				freeDrag: true,
				insets: defaultInsets,
			} );
			await harness.render();
			const result = harness.captured.current!;

			// Park the panel at the old top bound: minY = top + bottom + height
			// - innerHeight = 16 + 16 + 520 - 1024 = -472.
			await act( async () => {
				result.y.set( -472 );
			} );
			animateSpy.mockClear();

			// A 100px header appears: the panel now sits inside the reserved
			// area and must animate down to the new bound (-388).
			await harness.rerender( {
				freeDrag: true,
				insets: { ...defaultInsets, top: 100 },
			} );

			const newMinY = 100 + 16 + FIXED_SIZE.height - window.innerHeight;
			expect( animateTargetFor( result.y ) ).toBe( newMinY );
		} );

		it( 'clamps the committed size before repositioning', async () => {
			const clampResizedSize = vi.fn();
			harness = renderHook( { clampResizedSize } );
			await harness.render();

			await harness.rerender( {
				clampResizedSize,
				insets: { top: 100, right: 16, bottom: 16, left: 16 },
			} );

			expect( clampResizedSize ).toHaveBeenCalled();
		} );

		it( 'does not reposition when the insets identity is unchanged', async () => {
			const insets = { top: 16, right: 16, bottom: 16, left: 16 };
			harness = renderHook( { freeDrag: true, insets } );
			await harness.render();
			const result = harness.captured.current!;

			await act( async () => {
				result.y.set( -472 );
			} );
			animateSpy.mockClear();

			// Unrelated rerender, same insets reference: no correction fires.
			await harness.rerender( { freeDrag: true, insets } );

			expect( animateTargetFor( result.y ) ).toBeUndefined();
		} );
	} );
} );
