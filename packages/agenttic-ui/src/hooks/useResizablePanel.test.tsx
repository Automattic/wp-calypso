// @vitest-environment jsdom
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { animate, useMotionValue } from 'framer-motion';

// Spy on animate while keeping the real implementation so the springs still run.
vi.mock( 'framer-motion', async ( importOriginal ) => {
	const actual = await importOriginal< typeof import('framer-motion') >();
	return { ...actual, animate: vi.fn( actual.animate ) };
} );
const animateSpy = vi.mocked( animate );
import { STYLE_CONSTANTS } from '../utils/constants';
import type { ChatSize } from '../types';
import {
	useResizablePanel,
	type UseResizablePanelArgs,
	type UseResizablePanelResult,
} from './useResizablePanel';

// Opt into React's act environment so state updates don't warn (matches the
// component test suites).
(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

// Minimal renderHook: a probe component runs the hook and captures its return
// (plus the x/y motion values it composes with) into a ref the test can read.
// repositionForResize is the drag-hook seam; tests inject a spy to assert the
// controlled-size effect fires it after the size commit.
type Args = Omit< UseResizablePanelArgs, 'x' | 'y' | 'repositionForResize' > & {
	repositionForResize?: () => void;
};

interface Captured {
	result: UseResizablePanelResult;
	x: ReturnType< typeof useMotionValue< number > >;
	y: ReturnType< typeof useMotionValue< number > >;
}

function renderHook( initialArgs: Args ) {
	const captured: { current: Captured | null } = { current: null };
	let currentArgs = initialArgs;
	const container = document.createElement( 'div' );
	document.body.appendChild( container );
	const root = createRoot( container );

	function Probe() {
		const x = useMotionValue( 0 );
		const y = useMotionValue( 0 );
		const result = useResizablePanel( {
			repositionForResize: () => {},
			...currentArgs,
			x,
			y,
		} );
		captured.current = { result, x, y };
		return null;
	}

	const render = async () => {
		await act( async () => {
			root.render( createElement( Probe ) );
		} );
	};

	const rerender = async ( next: Args ) => {
		currentArgs = next;
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

// Drives the private pointer loop the hook attaches to the handle element on
// pointer-down, mirroring how the component wires onPointerDown to a resize div.
function makePointerEvent( type: string, clientX: number, clientY: number ) {
	const event = new Event( type, { bubbles: true } ) as PointerEvent;
	Object.assign( event, { clientX, clientY, pointerId: 1 } );
	return event;
}

const DEFAULT_SIZE: ChatSize = { width: 500, height: 400 };
const MIN_SIZE: ChatSize = { width: 300, height: 250 };
const MAX_SIZE: ChatSize = { width: 800, height: 700 };

describe( 'useResizablePanel', () => {
	let harness: ReturnType< typeof renderHook >;

	beforeEach( () => {
		// jsdom defaults to 1024x768; pin so the constraint box is deterministic.
		window.innerWidth = 1280;
		window.innerHeight = 1024;
	} );

	afterEach( async () => {
		await harness.unmount();
	} );

	const startResize = (
		handle: HTMLElement,
		clientX: number,
		clientY: number
	) => {
		handle.setPointerCapture = () => {};
		harness.captured.current!.result.handleResizePointerDown( {
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

	it( 'getPanelSize returns the fixed footprint when not resizable', async () => {
		harness = renderHook( {
			resizable: false,
			defaultSize: DEFAULT_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		expect( harness.captured.current!.result.getPanelSize() ).toEqual( {
			width: STYLE_CONSTANTS.COMPACT_WIDTH,
			height: STYLE_CONSTANTS.EXPANDED_HEIGHT,
		} );
	} );

	it( 'getPanelSize returns the fixed footprint when resizable but not expanded', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			chatState: 'compact',
			compactHeight: 56,
		} );
		await harness.render();

		expect( harness.captured.current!.result.getPanelSize() ).toEqual( {
			width: STYLE_CONSTANTS.COMPACT_WIDTH,
			height: STYLE_CONSTANTS.EXPANDED_HEIGHT,
		} );
	} );

	it( 'getPanelSize returns the live expanded size when resizable and expanded', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		expect( harness.captured.current!.result.getPanelSize() ).toEqual(
			DEFAULT_SIZE
		);
	} );

	it( 'clampSize floors a too-small candidate at minSize', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			minSize: MIN_SIZE,
			maxSize: MAX_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		expect(
			harness.captured.current!.result.clampSize( {
				width: 10,
				height: 10,
			} )
		).toEqual( MIN_SIZE );
	} );

	it( 'clampSize ceils a too-large candidate at maxSize (within the box)', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			minSize: MIN_SIZE,
			maxSize: MAX_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		expect(
			harness.captured.current!.result.clampSize( {
				width: 5000,
				height: 5000,
			} )
		).toEqual( MAX_SIZE );
	} );

	it( 'clampSize ceiling falls back to the constraint box when no maxSize', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		const box = {
			width: window.innerWidth - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2,
			height: window.innerHeight - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2,
		};
		expect(
			harness.captured.current!.result.clampSize( {
				width: 5000,
				height: 5000,
			} )
		).toEqual( box );
	} );

	it( 'getHeightForState returns the resized height when expanded and resizable', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			chatState: 'expanded',
			compactHeight: 120,
		} );
		await harness.render();

		const { result } = harness.captured.current!;
		expect( result.getHeightForState( 'collapsed' ) ).toBe(
			STYLE_CONSTANTS.COLLAPSED_SIZE
		);
		expect( result.getHeightForState( 'minimized' ) ).toBe(
			STYLE_CONSTANTS.COLLAPSED_SIZE
		);
		expect( result.getHeightForState( 'compact' ) ).toBe( 120 );
		expect( result.getHeightForState( 'expanded' ) ).toBe(
			DEFAULT_SIZE.height
		);
	} );

	it( 'getHeightForState ignores the resized height when not resizable', async () => {
		harness = renderHook( {
			resizable: false,
			defaultSize: DEFAULT_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		expect(
			harness.captured.current!.result.getHeightForState( 'expanded' )
		).toBe( STYLE_CONSTANTS.EXPANDED_HEIGHT );
	} );

	it( 'fires onResize each pointermove and onResizeEnd once on pointer-up', async () => {
		const onResize = vi.fn();
		const onResizeEnd = vi.fn();
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			minSize: MIN_SIZE,
			maxSize: MAX_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
			onResize,
			onResizeEnd,
		} );
		await harness.render();

		const handle = makeHandle( 'bottom-right' );
		await act( async () => {
			startResize( handle, 0, 0 );
		} );
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 40, 20 ) );
		} );

		expect( onResize ).toHaveBeenLastCalledWith( {
			width: DEFAULT_SIZE.width + 40,
			height: DEFAULT_SIZE.height + 20,
		} );

		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointerup', 40, 20 ) );
		} );

		expect( onResizeEnd ).toHaveBeenCalledTimes( 1 );
		expect( onResizeEnd ).toHaveBeenCalledWith( {
			width: DEFAULT_SIZE.width + 40,
			height: DEFAULT_SIZE.height + 20,
		} );
	} );

	it( 'pins the bottom-anchored top edge: y shifts by the height delta on a bottom drag', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			minSize: MIN_SIZE,
			maxSize: MAX_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		const { y } = harness.captured.current!;
		const startY = y.get();

		const handle = makeHandle( 'bottom' );
		await act( async () => {
			startResize( handle, 0, 100 );
		} );
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 0, 130 ) );
		} );

		// Bottom edge grew by 30; y shifts +30 so the top edge stays pinned.
		expect( y.get() ).toBe( startY + 30 );
	} );

	it( 'leaves y unchanged on a top-edge drag (CSS bottom already pins the bottom)', async () => {
		harness = renderHook( {
			resizable: true,
			defaultSize: DEFAULT_SIZE,
			minSize: MIN_SIZE,
			maxSize: MAX_SIZE,
			chatState: 'expanded',
			compactHeight: 56,
		} );
		await harness.render();

		const { y } = harness.captured.current!;
		const startY = y.get();

		const handle = makeHandle( 'top' );
		await act( async () => {
			startResize( handle, 0, 100 );
		} );
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 0, 75 ) );
		} );

		expect( y.get() ).toBe( startY );
	} );

	describe( 'controlled size', () => {
		// The morph springs settle asynchronously; poll the motion value until it
		// lands (or time out) so we assert the committed size, not a mid-flight frame.
		const waitForMotion = async ( get: () => number, target: number ) => {
			for ( let i = 0; i < 50; i++ ) {
				if ( Math.round( get() ) === Math.round( target ) ) {
					return;
				}
				await act( async () => {
					await new Promise( ( resolve ) =>
						setTimeout( resolve, 20 )
					);
				} );
			}
		};

		it( 'animates width/height toward the clamped target when expanded', async () => {
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );
			await harness.render();

			const { width, height } = harness.captured.current!.result;
			expect( width.get() ).toBe( DEFAULT_SIZE.width );

			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: 700, height: 600 },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );

			await waitForMotion( () => width.get(), 700 );
			await waitForMotion( () => height.get(), 600 );

			expect( Math.round( width.get() ) ).toBe( 700 );
			expect( Math.round( height.get() ) ).toBe( 600 );
			expect(
				harness.captured.current!.result.expandedSizeRef.current
			).toEqual( { width: 700, height: 600 } );
		} );

		it( 'clamps an oversized controlled size to max', async () => {
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );
			await harness.render();

			const { width, height } = harness.captured.current!.result;

			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: Infinity, height: Infinity },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );

			await waitForMotion( () => width.get(), MAX_SIZE.width );
			await waitForMotion( () => height.get(), MAX_SIZE.height );

			expect( Math.round( width.get() ) ).toBe( MAX_SIZE.width );
			expect( Math.round( height.get() ) ).toBe( MAX_SIZE.height );
		} );

		it( 'clamps an oversized controlled size to the viewport box when no maxSize', async () => {
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );
			await harness.render();

			const box = {
				width: window.innerWidth - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2,
				height:
					window.innerHeight - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2,
			};
			const { width, height } = harness.captured.current!.result;

			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: Infinity, height: Infinity },
				chatState: 'expanded',
				compactHeight: 56,
			} );

			await waitForMotion( () => width.get(), box.width );
			await waitForMotion( () => height.get(), box.height );

			expect( Math.round( width.get() ) ).toBe( box.width );
			expect( Math.round( height.get() ) ).toBe( box.height );
		} );

		it( 'feedback guard: a size echo equal to the current motion values does not re-animate', async () => {
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );
			await harness.render();

			const { width, height } = harness.captured.current!.result;
			animateSpy.mockClear();

			// Echo the exact current size (the onResizeEnd→parent→size round-trip).
			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: width.get(), height: height.get() },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );

			expect( animateSpy ).not.toHaveBeenCalled();
			expect( width.get() ).toBe( DEFAULT_SIZE.width );
			expect( height.get() ).toBe( DEFAULT_SIZE.height );
			expect(
				harness.captured.current!.result.expandedSizeRef.current
			).toEqual( DEFAULT_SIZE );
		} );

		it( 'updates only the ref when not expanded (morph animates on next expand)', async () => {
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'compact',
				compactHeight: 56,
			} );
			await harness.render();

			const { width, height } = harness.captured.current!.result;

			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: 700, height: 600 },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'compact',
				compactHeight: 56,
			} );

			// Ref reflects the controlled target; the live motion values stay put
			// (the state morph will animate to the ref on the next expand).
			expect(
				harness.captured.current!.result.expandedSizeRef.current
			).toEqual( { width: 700, height: 600 } );
			expect( width.get() ).toBe( DEFAULT_SIZE.width );
			expect( height.get() ).toBe( DEFAULT_SIZE.height );
		} );

		it( 'morphs to a controlled size set while compact on the next expand', async () => {
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'compact',
				compactHeight: 56,
			} );
			await harness.render();

			const { width, height } = harness.captured.current!.result;

			// Controlled size arrives while compact: the ref is written but the live
			// motion values stay put (no morph on the non-expanded pass).
			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: 700, height: 600 },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'compact',
				compactHeight: 56,
			} );

			expect( width.get() ).toBe( DEFAULT_SIZE.width );
			expect( height.get() ).toBe( DEFAULT_SIZE.height );

			// Expand: the state size-morph reads expandedSizeRef (written above) and
			// animates the panel to the controlled size.
			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: 700, height: 600 },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );

			await waitForMotion( () => width.get(), 700 );
			await waitForMotion( () => height.get(), 600 );

			expect( Math.round( width.get() ) ).toBe( 700 );
			expect( Math.round( height.get() ) ).toBe( 600 );
		} );

		it( 'does nothing when size is undefined (uncontrolled path untouched)', async () => {
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );
			await harness.render();

			const { width, height } = harness.captured.current!.result;
			animateSpy.mockClear();

			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
			} );

			expect( animateSpy ).not.toHaveBeenCalled();
			expect( width.get() ).toBe( DEFAULT_SIZE.width );
			expect( height.get() ).toBe( DEFAULT_SIZE.height );
		} );

		it( 'calls repositionForResize after a real controlled-size change (expanded)', async () => {
			const repositionForResize = vi.fn();
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
				repositionForResize,
			} );
			await harness.render();

			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: 700, height: 600 },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
				repositionForResize,
			} );

			expect( repositionForResize ).toHaveBeenCalledTimes( 1 );
			// Fired after the ref is committed, so it reads the new size.
			expect(
				harness.captured.current!.result.expandedSizeRef.current
			).toEqual( { width: 700, height: 600 } );
		} );

		it( 'does not call repositionForResize on the feedback echo', async () => {
			const repositionForResize = vi.fn();
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
				repositionForResize,
			} );
			await harness.render();

			const { width, height } = harness.captured.current!.result;
			repositionForResize.mockClear();

			// Echo the exact current size (drag-commit round-trip): early-return guard
			// fires BEFORE the reposition, so the drag path's own position stands.
			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: width.get(), height: height.get() },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'expanded',
				compactHeight: 56,
				repositionForResize,
			} );

			expect( repositionForResize ).not.toHaveBeenCalled();
		} );

		it( 'does not call repositionForResize when not expanded (only ref updates)', async () => {
			const repositionForResize = vi.fn();
			harness = renderHook( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'compact',
				compactHeight: 56,
				repositionForResize,
			} );
			await harness.render();

			await harness.rerender( {
				resizable: true,
				defaultSize: DEFAULT_SIZE,
				size: { width: 700, height: 600 },
				minSize: MIN_SIZE,
				maxSize: MAX_SIZE,
				chatState: 'compact',
				compactHeight: 56,
				repositionForResize,
			} );

			expect( repositionForResize ).not.toHaveBeenCalled();
		} );
	} );
} );
