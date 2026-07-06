// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MotionValue } from 'framer-motion';
import type { ChatState, Suggestion } from '../types';

// Capture every animate() call so we can assert what the minimize effect drives
// the `y` motion value toward. Framer's spring physics run on rAF and cannot be
// settled deterministically in jsdom, so we assert on the animate target rather
// than the resting value. Everything else (useMotionValue, motion components)
// stays real so the component renders and the effect runs against live values.
// animate() returns playback controls; the effect's cleanup calls .stop().
const { animateMock, dragStartSpy } = vi.hoisted( () => ( {
	animateMock: vi.fn( () => ( { stop: () => {} } ) ),
	dragStartSpy: vi.fn(),
} ) );
vi.mock( 'framer-motion', async () => {
	const actual =
		await vi.importActual< typeof import('framer-motion') >(
			'framer-motion'
		);
	return {
		...actual,
		animate: animateMock,
		// Wrap the real controls so we can assert a body pointer-down starts a
		// move-drag, while leaving the actual drag wiring intact.
		useDragControls: () => {
			const controls = actual.useDragControls();
			const originalStart = controls.start.bind( controls );
			controls.start = (
				...args: Parameters< typeof controls.start >
			) => {
				dragStartSpy( ...args );
				return originalStart( ...args );
			};
			return controls;
		},
	};
} );

import { AgentUIContainer } from './AgentUIContainer';
import { AgentUISuggestions } from './composable/AgentUISuggestions';

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

const SEED_Y = -100; // Panel dragged upward; within the clamp for jsdom's 768px height.

function Container( { state }: { state: ChatState } ) {
	return (
		<AgentUIContainer
			messages={ [] }
			isProcessing={ false }
			onSubmit={ () => {} }
			variant="floating"
			floatingChatState={ state }
			freeDrag
			draggableStates={ [ 'compact', 'expanded', 'minimized' ] }
			initialFreeDragPosition={ { x: 0, y: SEED_Y } }
		>
			<div>content</div>
		</AgentUIContainer>
	);
}

// Pull the `y` motion value and target out of the most recent animate() call.
function lastAnimate(): { value: MotionValue< number >; target: number } {
	const call = animateMock.mock.calls.at( -1 ) as unknown as [
		MotionValue< number >,
		number,
	];
	return { value: call[ 0 ], target: call[ 1 ] };
}

describe( 'AgentUIContainer free-drag minimize docking', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
		animateMock.mockClear();
	} );

	const renderState = async ( state: ChatState ) => {
		await act( async () => {
			root.render( <Container state={ state } /> );
		} );
	};

	it( 'animates the y offset to 0 on compact → minimized', async () => {
		await renderState( 'compact' );
		animateMock.mockClear();

		await renderState( 'minimized' );

		// bottom: 0 docks the panel, so the correct drag offset is exactly 0.
		expect( lastAnimate().target ).toBe( 0 );
	} );

	it( 'animates the y offset to 0 on expanded → minimized', async () => {
		await renderState( 'expanded' );
		animateMock.mockClear();

		await renderState( 'minimized' );

		expect( lastAnimate().target ).toBe( 0 );
	} );

	it( 'restores the stashed dragged offset on un-minimize', async () => {
		await renderState( 'compact' );
		await renderState( 'minimized' );

		// On minimize the effect stashes y.get() ( the seeded value ) and pins to 0.
		const minimized = lastAnimate();
		expect( minimized.target ).toBe( 0 );
		const yValue = minimized.value;

		animateMock.mockClear();
		await renderState( 'compact' );

		// Un-minimize animates the SAME motion value back to the stashed offset.
		const restored = lastAnimate();
		expect( restored.value ).toBe( yValue );
		expect( restored.target ).toBe( SEED_Y );
	} );
} );

// The container owns dedup so it survives the AnimatePresence instance swap between
// compact and expanded ( each state mounts a fresh Suggestions ). An impression is
// tied to the suggestion set ( id-signature ), not to visibility toggles; the only
// reset is a data-level clear.
const suggestions: Suggestion[] = [
	{ id: 'a', label: 'A', prompt: 'A' },
	{ id: 'b', label: 'B', prompt: 'B' },
	{ id: 'c', label: 'C', prompt: 'C' },
];

describe( 'AgentUIContainer suggestions-rendered dedup', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
		animateMock.mockClear();
	} );

	const App = ( {
		state,
		suggestions: suggestionsProp,
		onSuggestionsRendered,
	}: {
		state: ChatState;
		suggestions?: Suggestion[];
		onSuggestionsRendered: ( shown: Suggestion[] ) => void;
	} ) => (
		<AgentUIContainer
			messages={ [] }
			isProcessing={ false }
			onSubmit={ () => {} }
			variant="floating"
			floatingChatState={ state }
			suggestions={ suggestionsProp }
			onSuggestionsRendered={ onSuggestionsRendered }
		>
			<AgentUISuggestions />
		</AgentUIContainer>
	);

	// AnimatePresence mode="wait" defers mounting the entering view until the exiting
	// one finishes; let framer's rAF-driven exit settle before asserting.
	const settle = async () => {
		await act( async () => {
			await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );
		} );
	};

	const ids = ( calls: Suggestion[][][] ) =>
		calls.map( ( [ shown ] ) => shown.map( ( s ) => s.id ) );

	it( 'fires once across a compact → expanded swap with the same set', async () => {
		const onSuggestionsRendered = vi.fn();
		await act( async () => {
			root.render(
				<App
					state="compact"
					suggestions={ suggestions }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );
		expect( onSuggestionsRendered ).toHaveBeenCalledOnce();

		await act( async () => {
			root.render(
				<App
					state="expanded"
					suggestions={ suggestions }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );
		await settle();

		// The expanded instance mounts ( its buttons are in the DOM ) and calls the
		// reporter with the identical set — dedup keeps it at a single impression.
		expect(
			container.querySelectorAll( '[data-slot="suggestions"] button' )
				.length
		).toBe( 3 );
		expect( onSuggestionsRendered ).toHaveBeenCalledOnce();
	} );

	it( 'does not refire on minimize then restore with the same set', async () => {
		const onSuggestionsRendered = vi.fn();
		await act( async () => {
			root.render(
				<App
					state="compact"
					suggestions={ suggestions }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );
		expect( onSuggestionsRendered ).toHaveBeenCalledOnce();

		await act( async () => {
			root.render(
				<App
					state="minimized"
					suggestions={ suggestions }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );
		await settle();
		await act( async () => {
			root.render(
				<App
					state="compact"
					suggestions={ suggestions }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );
		await settle();

		expect( onSuggestionsRendered ).toHaveBeenCalledOnce();
	} );

	it( 'fires again after a data-level clear then the same ids return', async () => {
		const onSuggestionsRendered = vi.fn();
		await act( async () => {
			root.render(
				<App
					state="compact"
					suggestions={ suggestions }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );
		expect( onSuggestionsRendered ).toHaveBeenCalledOnce();

		// Data-level clear resets the shared key.
		await act( async () => {
			root.render(
				<App
					state="compact"
					suggestions={ [] }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );

		// Same ids return — a genuine fresh impression.
		await act( async () => {
			root.render(
				<App
					state="compact"
					suggestions={ suggestions }
					onSuggestionsRendered={ onSuggestionsRendered }
				/>
			);
		} );

		expect( onSuggestionsRendered ).toHaveBeenCalledTimes( 2 );
		expect( ids( onSuggestionsRendered.mock.calls ) ).toEqual( [
			[ 'a', 'b', 'c' ],
			[ 'a', 'b', 'c' ],
		] );
	} );
} );

const DEFAULT_SIZE = { width: 600, height: 700 };
const MIN_SIZE = { width: 400, height: 450 };
const MAX_SIZE = { width: 900, height: 800 };

interface ResizableContainerProps {
	state?: ChatState;
	resizable?: boolean | 'horizontal' | 'vertical';
	variant?: 'floating' | 'embedded';
	defaultSize?: { width: number; height: number };
	minSize?: { width?: number; height?: number };
	maxSize?: { width?: number; height?: number };
	onResize?: ( size: { width: number; height: number } ) => void;
	onResizeEnd?: ( size: { width: number; height: number } ) => void;
}

function ResizableContainer( {
	state = 'expanded',
	resizable = true,
	variant = 'floating',
	defaultSize = DEFAULT_SIZE,
	minSize = MIN_SIZE,
	maxSize = MAX_SIZE,
	onResize,
	onResizeEnd,
}: ResizableContainerProps ) {
	return (
		<AgentUIContainer
			messages={ [] }
			isProcessing={ false }
			onSubmit={ () => {} }
			variant={ variant }
			floatingChatState={ state }
			resizable={ resizable }
			defaultSize={ defaultSize }
			minSize={ minSize }
			maxSize={ maxSize }
			onResize={ onResize }
			onResizeEnd={ onResizeEnd }
		>
			<div>content</div>
		</AgentUIContainer>
	);
}

// Reads the seeded size from the inner content div, which binds the width/height
// motion values through its inline style on the initial render.
function readPanelSize( root: HTMLElement ): { width: number; height: number } {
	const content = root.querySelector< HTMLElement >(
		'[data-slot="chat-floating"] > div'
	);
	if ( ! content ) {
		throw new Error( 'content element not found' );
	}
	return {
		width: parseFloat( content.style.width ),
		height: parseFloat( content.style.height ),
	};
}

function getHandle( edge: string ): HTMLElement {
	const handle = document.querySelector< HTMLElement >(
		`[data-resize-edge="${ edge }"]`
	);
	if ( ! handle ) {
		throw new Error( `resize handle not found: ${ edge }` );
	}
	return handle;
}

// Framer schedules DOM transform writes on its frame loop (rAF). Flush a frame
// inside act() so the latest x/y motion-value writes land on the element style.
async function flushFrame(): Promise< void > {
	await act( async () => {
		await new Promise< void >( ( resolve ) =>
			requestAnimationFrame( () => resolve() )
		);
	} );
}

// Reads the last { x, y } the panel transform was set to from the element style.
function readPanelTransform(): { x: number; y: number } {
	const floating = document.querySelector< HTMLElement >(
		'[data-slot="chat-floating"]'
	);
	const transform = floating?.style.transform ?? '';
	const x = parseFloat(
		transform.match( /translateX\(([-\d.]+)px\)/ )?.[ 1 ] ?? '0'
	);
	const y = parseFloat(
		transform.match( /translateY\(([-\d.]+)px\)/ )?.[ 1 ] ?? '0'
	);
	return { x, y };
}

// jsdom has no real pointer capture; stub the methods the loop calls so the
// handlers run without throwing.
function makePointerEvent(
	type: string,
	clientX: number,
	clientY: number
): PointerEvent {
	const event = new MouseEvent( type, {
		bubbles: true,
		clientX,
		clientY,
	} ) as unknown as PointerEvent;
	Object.defineProperty( event, 'pointerId', { value: 1 } );
	return event;
}

function startResize(
	handle: HTMLElement,
	clientX: number,
	clientY: number
): void {
	handle.setPointerCapture = () => {};
	handle.releasePointerCapture = () => {};
	handle.dispatchEvent( makePointerEvent( 'pointerdown', clientX, clientY ) );
}

describe( 'AgentUIContainer resize', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
		animateMock.mockClear();
		dragStartSpy.mockClear();
	} );

	const render = async ( props: ResizableContainerProps = {} ) => {
		await act( async () => {
			root.render( <ResizableContainer { ...props } /> );
		} );
	};

	it( 'renders the 8 resize handles when resizable, floating, and expanded', async () => {
		await render();
		expect(
			document.querySelectorAll( '[data-slot="resize-handle"]' )
		).toHaveLength( 8 );
	} );

	it( 'renders no handles when resizable is false', async () => {
		await render( { resizable: false } );
		expect(
			document.querySelectorAll( '[data-slot="resize-handle"]' )
		).toHaveLength( 0 );
	} );

	it( 'renders no handles when not expanded', async () => {
		await render( { state: 'compact' } );
		expect(
			document.querySelectorAll( '[data-slot="resize-handle"]' )
		).toHaveLength( 0 );
	} );

	it( 'renders only the left/right edge handles when resizable is horizontal', async () => {
		await render( { resizable: 'horizontal' } );
		const edges = Array.from(
			document.querySelectorAll( '[data-slot="resize-handle"]' )
		).map( ( el ) => el.getAttribute( 'data-resize-edge' ) );
		expect( edges ).toEqual( [ 'right', 'left' ] );
	} );

	it( 'renders only the top/bottom edge handles when resizable is vertical', async () => {
		await render( { resizable: 'vertical' } );
		const edges = Array.from(
			document.querySelectorAll( '[data-slot="resize-handle"]' )
		).map( ( el ) => el.getAttribute( 'data-resize-edge' ) );
		expect( edges ).toEqual( [ 'top', 'bottom' ] );
	} );

	it( 'seeds the panel size from defaultSize', async () => {
		await render();
		expect( readPanelSize( container ) ).toEqual( DEFAULT_SIZE );
	} );

	it( 'grows width and height when dragging the bottom-right corner and fires onResize', async () => {
		const onResize = vi.fn();
		await render( { onResize } );

		await act( async () => {
			startResize( getHandle( 'bottom-right' ), 0, 0 );
		} );
		await act( async () => {
			getHandle( 'bottom-right' ).dispatchEvent(
				makePointerEvent( 'pointermove', 50, 30 )
			);
		} );

		expect( onResize ).toHaveBeenLastCalledWith( {
			width: DEFAULT_SIZE.width + 50,
			height: DEFAULT_SIZE.height + 30,
		} );
	} );

	it( 'clamps the size to the minSize floor', async () => {
		const onResize = vi.fn();
		await render( { onResize } );

		// Drag the bottom-right corner far up/left, well past the min.
		await act( async () => {
			startResize( getHandle( 'bottom-right' ), 0, 0 );
		} );
		await act( async () => {
			getHandle( 'bottom-right' ).dispatchEvent(
				makePointerEvent( 'pointermove', -1000, -1000 )
			);
		} );

		expect( onResize ).toHaveBeenLastCalledWith( MIN_SIZE );
	} );

	it( 'clamps the size to the maxSize ceiling', async () => {
		// Box ceiling for jsdom's 1024x768 viewport is larger than MAX_SIZE width
		// but smaller than MAX_SIZE height, so width is capped by maxSize and
		// height by the constraint box.
		const onResize = vi.fn();
		await render( { onResize } );

		await act( async () => {
			startResize( getHandle( 'bottom-right' ), 0, 0 );
		} );
		await act( async () => {
			getHandle( 'bottom-right' ).dispatchEvent(
				makePointerEvent( 'pointermove', 5000, 5000 )
			);
		} );

		const box = {
			width: window.innerWidth - 16 * 2,
			height: window.innerHeight - 16 * 2,
		};
		expect( onResize ).toHaveBeenLastCalledWith( {
			width: Math.min( MAX_SIZE.width, box.width ),
			height: Math.min( MAX_SIZE.height, box.height ),
		} );
	} );

	it( 'fires onResizeEnd once on pointer-up with the committed size', async () => {
		const onResizeEnd = vi.fn();
		await render( { onResizeEnd } );

		const handle = getHandle( 'bottom-right' );
		await act( async () => {
			startResize( handle, 0, 0 );
		} );
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 40, 20 ) );
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

	it( 'shifts the panel x to pin the right edge when dragging the left handle', async () => {
		const onResize = vi.fn();
		await render( { onResize } );
		await flushFrame();
		const startX = readPanelTransform().x;

		const handle = getHandle( 'left' );
		await act( async () => {
			startResize( handle, 100, 0 );
		} );
		// Drag left handle right by 30px: width shrinks 30, x moves +30 so the
		// right edge stays pinned.
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 130, 0 ) );
		} );
		await flushFrame();

		expect( onResize ).toHaveBeenLastCalledWith( {
			width: DEFAULT_SIZE.width - 30,
			height: DEFAULT_SIZE.height,
		} );
		expect( readPanelTransform().x ).toBe( startX + 30 );
	} );

	it( 'shifts the panel y by the clamped height delta when dragging the bottom handle', async () => {
		const onResize = vi.fn();
		await render( { onResize } );
		await flushFrame();
		const startY = readPanelTransform().y;

		const handle = getHandle( 'bottom' );
		await act( async () => {
			startResize( handle, 0, 100 );
		} );
		// Drag bottom handle down by 30px: height grows 30. The box is bottom-anchored,
		// so y shifts +30 by the height delta to pin the top edge. Width is unchanged.
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 0, 130 ) );
		} );
		await flushFrame();

		expect( onResize ).toHaveBeenLastCalledWith( {
			width: DEFAULT_SIZE.width,
			height: DEFAULT_SIZE.height + 30,
		} );
		expect( readPanelTransform().y ).toBe( startY + 30 );
	} );

	it( 'leaves the panel y unchanged when dragging the top handle', async () => {
		const onResize = vi.fn();
		await render( { onResize } );
		await flushFrame();
		const startY = readPanelTransform().y;

		const handle = getHandle( 'top' );
		await act( async () => {
			startResize( handle, 0, 100 );
		} );
		// Drag top handle up by 25px: height grows 25. The box is bottom-anchored, so
		// the bottom edge stays pinned by CSS `bottom` and y must not change.
		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointermove', 0, 75 ) );
		} );
		await flushFrame();

		expect( onResize ).toHaveBeenLastCalledWith( {
			width: DEFAULT_SIZE.width,
			height: DEFAULT_SIZE.height + 25,
		} );
		expect( readPanelTransform().y ).toBe( startY );
	} );

	it( 'starts a move-drag on a body pointer-down (not a resize handle)', async () => {
		await render();
		const floating = document.querySelector< HTMLElement >(
			'[data-slot="chat-floating"]'
		)!;

		await act( async () => {
			floating.dispatchEvent(
				makePointerEvent( 'pointerdown', 200, 200 )
			);
		} );

		expect( dragStartSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not start a move-drag from a resize handle pointer-down', async () => {
		await render();
		const handle = getHandle( 'bottom-right' );
		handle.setPointerCapture = () => {};

		await act( async () => {
			handle.dispatchEvent( makePointerEvent( 'pointerdown', 0, 0 ) );
		} );

		expect( dragStartSpy ).not.toHaveBeenCalled();
	} );
} );
