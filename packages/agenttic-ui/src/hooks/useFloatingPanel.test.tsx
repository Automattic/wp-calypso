// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Spy on animate while keeping the real implementation so the springs still run
// (matches the resize + position hook suites).
vi.mock( 'framer-motion', async ( importOriginal ) => {
	const actual = await importOriginal< typeof import('framer-motion') >();
	return { ...actual, animate: vi.fn( actual.animate ) };
} );
import type { ChatSize } from '../types';
import {
	useFloatingPanel,
	type UseFloatingPanelArgs,
} from './useFloatingPanel';

// Opt into React's act environment so state updates don't warn (matches the
// component + sub-hook test suites).
(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

type Result = ReturnType< typeof useFloatingPanel >;
type Args = Partial< UseFloatingPanelArgs >;

function buildArgs( overrides: Args ): UseFloatingPanelArgs {
	return {
		chatState: 'expanded',
		compactHeight: 56,
		freeDrag: false,
		initialFreeDragPosition: undefined,
		...overrides,
	};
}

function renderHook( initialArgs: Args ) {
	const captured: { current: Result | null } = { current: null };
	const currentOverrides = initialArgs;
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	const root = createRoot( container );

	function Probe() {
		captured.current = useFloatingPanel( buildArgs( currentOverrides ) );
		return null;
	}

	const render = async () => {
		await act( async () => {
			root.render( createElement( Probe ) );
		} );
	};

	const unmount = async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	};

	return { captured, render, unmount };
}

// Drives the private resize pointer loop the hook attaches to the handle on
// pointer-down, mirroring useResizablePanel.test.tsx.
function makePointerEvent( type: string, clientX: number, clientY: number ) {
	const event = new Event( type, { bubbles: true } ) as PointerEvent;
	Object.assign( event, { clientX, clientY, pointerId: 1 } );
	return event;
}

const DEFAULT_SIZE: ChatSize = { width: 500, height: 400 };
const MIN_SIZE: ChatSize = { width: 300, height: 250 };
const MAX_SIZE: ChatSize = { width: 800, height: 700 };

describe( 'useFloatingPanel', () => {
	let harness: ReturnType< typeof renderHook >;

	beforeEach( () => {
		// jsdom defaults to 1024x768; pin so the constraint box is deterministic.
		window.innerWidth = 1280;
		window.innerHeight = 1024;
	} );

	afterEach( async () => {
		await harness.unmount();
		vi.restoreAllMocks();
	} );

	const startResize = (
		handle: HTMLElement,
		clientX: number,
		clientY: number
	) => {
		handle.setPointerCapture = () => {};
		harness.captured.current!.handleResizePointerDown( {
			currentTarget: handle,
			clientX,
			clientY,
			pointerId: 1,
			preventDefault: () => {},
		} as unknown as React.PointerEvent< HTMLDivElement > );
	};

	const makeHandle = ( edge: string ) => {
		const handle = document.createElement( 'div' );
		handle.dataset.resizeEdge = edge;
		document.body.appendChild( handle );
		return handle;
	};

	it( 'reports the shifted free-drag position on a left-edge resize (close→reopen restores the moved spot)', async () => {
		const onFreeDragEnd = vi.fn();
		const onResizeEnd = vi.fn();
		harness = renderHook( {
			resizable: true,
			freeDrag: true,
			// A persisted absolute free-drag spot (not docked at a corner).
			initialFreeDragPosition: { x: 200, y: -100 },
			defaultSize: DEFAULT_SIZE,
			minSize: MIN_SIZE,
			maxSize: MAX_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
			onFreeDragEnd,
			onResizeEnd,
		} );
		await harness.render();

		expect( harness.captured.current!.x.get() ).toBe( 200 );

		// Grow the left edge (drag left by 100): width 500 → 600, so x shifts to
		// keep the right edge pinned (200 + (500 − 600) = 100).
		const handle = makeHandle( 'left' );
		await act( async () => {
			startResize( handle, 100, 0 );
		} );
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 0, 0 ) );
		} );

		expect( harness.captured.current!.x.get() ).toBe( 100 );

		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointerup', 0, 0 ) );
		} );

		// Size still reported, and the moved position is persisted so a reopen
		// restores the post-resize spot rather than the stale pre-resize x.
		expect( onResizeEnd ).toHaveBeenCalledTimes( 1 );
		expect( onFreeDragEnd ).toHaveBeenCalledTimes( 1 );
		expect( onFreeDragEnd ).toHaveBeenCalledWith( { x: 100, y: -100 } );
	} );

	it( 'does not report a free-drag position on resize when free-drag is off', async () => {
		const onFreeDragEnd = vi.fn();
		const onResizeEnd = vi.fn();
		harness = renderHook( {
			resizable: true,
			freeDrag: false,
			defaultSize: DEFAULT_SIZE,
			minSize: MIN_SIZE,
			maxSize: MAX_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
			onFreeDragEnd,
			onResizeEnd,
		} );
		await harness.render();

		const handle = makeHandle( 'left' );
		await act( async () => {
			startResize( handle, 100, 0 );
		} );
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 0, 0 ) );
		} );
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointerup', 0, 0 ) );
		} );

		expect( onResizeEnd ).toHaveBeenCalledTimes( 1 );
		expect( onFreeDragEnd ).not.toHaveBeenCalled();
	} );

	it( 'executes a layout command only when `id` changes, never on mount', async () => {
		const onChatPositionChange = vi.fn();
		const onFreeDragEnd = vi.fn();
		const onResizeEnd = vi.fn();
		const args: Args = {
			freeDrag: true,
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			initialChatPosition: 'left',
			onChatPositionChange,
			onFreeDragEnd,
			onResizeEnd,
			layoutCommand: { id: 0, side: 'right', resetSize: true },
		};
		harness = renderHook( args );
		await harness.render();

		// A command present at mount does not execute — mount uses the seeds.
		expect( onChatPositionChange ).not.toHaveBeenCalled();
		expect( onResizeEnd ).not.toHaveBeenCalled();

		// Same id: still no execution.
		await harness.render();
		expect( onChatPositionChange ).not.toHaveBeenCalled();

		args.layoutCommand = { id: 1, side: 'right', resetSize: true };
		await harness.render();

		// Size resets to the built-in default, then the panel docks at the right
		// corner — both reported through the standard persistence callbacks.
		expect( onResizeEnd ).toHaveBeenCalledWith( {
			width: 372,
			height: 520,
		} );
		expect( onChatPositionChange ).toHaveBeenCalledWith( 'right' );
		const cornerX = window.innerWidth - 372 - 16 - 16;
		expect( onFreeDragEnd ).toHaveBeenCalledWith( { x: cornerX, y: 0 } );
		expect( ( harness.captured.current as Result ).currentSide ).toBe(
			'right'
		);
	} );

	it( 'drops a command whole during an active gesture', async () => {
		const onChatPositionChange = vi.fn();
		const onResizeEnd = vi.fn();
		const args: Args = {
			freeDrag: true,
			resizable: true,
			initialChatPosition: 'left',
			onChatPositionChange,
			onResizeEnd,
			layoutCommand: { id: 0, side: 'right', resetSize: true },
		};
		harness = renderHook( args );
		await harness.render();

		await act( async () => {
			harness.captured.current?.handleDragStart();
		} );

		args.layoutCommand = { id: 1, side: 'right', resetSize: true };
		await harness.render();

		expect( onChatPositionChange ).not.toHaveBeenCalled();
		expect( onResizeEnd ).not.toHaveBeenCalled();
	} );

	it( 'keeps the snapped panel header reachable on short viewports', async () => {
		window.innerHeight = 400;
		const onFreeDragEnd = vi.fn();
		const args: Args = {
			freeDrag: true,
			initialChatPosition: 'left',
			onFreeDragEnd,
			layoutCommand: { id: 0, side: 'right' },
		};
		harness = renderHook( args );
		await harness.render();

		args.layoutCommand = { id: 1, side: 'right' };
		await harness.render();

		// minY = top + bottom insets + panel height − viewport height.
		const minY = 16 + 16 + 520 - 400;
		const cornerX = window.innerWidth - 372 - 16 - 16;
		expect( onFreeDragEnd ).toHaveBeenCalledWith( { x: cornerX, y: minY } );
	} );

	it( 'keeps the command snap when a controlled-size parent echoes the reset', async () => {
		// Controlled-size consumers echo `onResizeEnd` back through `size`;
		// the echo must not move the in-flight snap.
		const args: Args = {
			freeDrag: true,
			resizable: true,
			size: { width: 600, height: 700 },
			initialChatPosition: 'left',
			onResizeEnd: ( committed ) => {
				args.size = committed;
			},
			layoutCommand: { id: 0, side: 'right', resetSize: true },
		};

		// Inert springs so the motion values only move when set explicitly.
		const { animate } = await import( 'framer-motion' );
		const animateMock = animate as ReturnType< typeof vi.fn >;
		animateMock.mockImplementation( () => ( { stop: () => {} } ) );

		harness = renderHook( args );
		await harness.render();

		// The size springs are mid-flight at the resized size when the echo lands.
		harness.captured.current?.width.set( 600 );
		harness.captured.current?.height.set( 700 );
		animateMock.mockClear();

		args.layoutCommand = { id: 1, side: 'right', resetSize: true };
		await harness.render();
		// The echo (`args.size` set by onResizeEnd) lands on this render.
		await harness.render();

		const xTargets = animateMock.mock.calls
			.filter( ( call ) => call[ 0 ] === harness.captured.current?.x )
			.map( ( call ) => call[ 1 ] );
		const cornerX = window.innerWidth - 372 - 16 - 16;
		expect( xTargets ).toContain( cornerX );
		expect( xTargets ).toEqual(
			xTargets.filter( ( target ) => target === cornerX )
		);
	} );
} );
