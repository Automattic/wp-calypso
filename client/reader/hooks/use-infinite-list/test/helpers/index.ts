/**
 * Shared jsdom harness for the <VirtualList> unit tests. jsdom has no layout
 * engine and no ResizeObserver, so these helpers let a test control element
 * geometry and drive resize callbacks deterministically.
 */

type RectInit = Partial<
	Pick< DOMRect, 'top' | 'left' | 'right' | 'bottom' | 'width' | 'height' >
>;

/**
 * Override an element's `getBoundingClientRect` with fixed values (jsdom
 * otherwise reports all zeros).
 */
export function setRect( element: HTMLElement, rect: RectInit ): void {
	element.getBoundingClientRect = () =>
		( {
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			width: 0,
			height: 0,
			x: rect.left ?? 0,
			y: rect.top ?? 0,
			toJSON: () => ( {} ),
			...rect,
		} ) as DOMRect;
}

/**
 * A ResizeObserver stand-in that records its instances so a test can fire all
 * callbacks on demand. Install it on `global` before rendering, reset between
 * tests.
 */
export class MockResizeObserver {
	static instances: MockResizeObserver[] = [];

	callback: ResizeObserverCallback;

	constructor( callback: ResizeObserverCallback ) {
		this.callback = callback;
		MockResizeObserver.instances.push( this );
	}

	observe(): void {}
	unobserve(): void {}
	disconnect(): void {}

	static triggerAll(): void {
		for ( const instance of MockResizeObserver.instances ) {
			instance.callback( [], instance as unknown as ResizeObserver );
		}
	}

	static reset(): void {
		MockResizeObserver.instances = [];
	}
}

/** Install the MockResizeObserver globally and clear any prior instances. */
export function installResizeObserver(): void {
	MockResizeObserver.reset();
	( global as unknown as { ResizeObserver: typeof MockResizeObserver } ).ResizeObserver =
		MockResizeObserver;
}
