/**
 * @jest-environment jsdom
 */
import observeEditorCanvasPointerDown from '../observe-editor-canvas-pointerdown';

// MutationObserver callbacks run as microtasks; awaiting a resolved promise
// lets queued mutations flush so `attach` re-runs.
const flushMutations = () => Promise.resolve();

const addCanvasIframe = (): HTMLIFrameElement => {
	const iframe = document.createElement( 'iframe' );
	iframe.name = 'editor-canvas';
	document.body.appendChild( iframe );
	return iframe;
};

// jsdom keeps a removed iframe's `contentDocument.defaultView` non-null, so we
// override it to reproduce the real-browser stale signal the prune relies on.
const markDetached = ( doc: Document ) => {
	Object.defineProperty( doc, 'defaultView', { value: null, configurable: true } );
};

const dispatchPointerDown = ( doc: Document ) => {
	doc.dispatchEvent( new Event( 'pointerdown' ) );
};

describe( 'observeEditorCanvasPointerDown', () => {
	afterEach( () => {
		document.body.innerHTML = '';
	} );

	it( 'is a no-op and cleans up safely when no canvas iframe is present', () => {
		const handler = jest.fn();
		const cleanup = observeEditorCanvasPointerDown( handler );

		expect( handler ).not.toHaveBeenCalled();
		expect( () => cleanup() ).not.toThrow();
	} );

	it( 'forwards pointerdown from a canvas iframe present at call time', () => {
		const iframe = addCanvasIframe();
		const handler = jest.fn();
		const cleanup = observeEditorCanvasPointerDown( handler );

		dispatchPointerDown( iframe.contentDocument as Document );
		expect( handler ).toHaveBeenCalledTimes( 1 );

		cleanup();
	} );

	it( 'attaches to a canvas iframe that mounts after the observer starts', async () => {
		const handler = jest.fn();
		const cleanup = observeEditorCanvasPointerDown( handler );

		const iframe = addCanvasIframe();
		await flushMutations();

		dispatchPointerDown( iframe.contentDocument as Document );
		expect( handler ).toHaveBeenCalledTimes( 1 );

		cleanup();
	} );

	it( 'prunes the stale document on remount and forwards from the new one', async () => {
		const firstIframe = addCanvasIframe();
		const handler = jest.fn();
		const cleanup = observeEditorCanvasPointerDown( handler );

		const oldDoc = firstIframe.contentDocument as Document;
		dispatchPointerDown( oldDoc );
		expect( handler ).toHaveBeenCalledTimes( 1 );

		// Remount: the old canvas is replaced by a fresh iframe. We stop matching
		// the old iframe (renaming it) and mark its document detached
		// (`defaultView === null`) instead of removing it from the DOM — jsdom
		// neutralizes a removed document's dispatch, which would mask whether the
		// prune actually removed the listener. Keeping it connected but renamed
		// lets a later dispatch prove the listener was removed by the prune.
		firstIframe.name = 'editor-canvas-detached';
		markDetached( oldDoc );
		const secondIframe = addCanvasIframe();
		await flushMutations();

		const newDoc = secondIframe.contentDocument as Document;
		dispatchPointerDown( newDoc );
		expect( handler ).toHaveBeenCalledTimes( 2 );

		// The stale document's listener was pruned, so it no longer fires.
		dispatchPointerDown( oldDoc );
		expect( handler ).toHaveBeenCalledTimes( 2 );

		cleanup();
	} );

	it( 'detaches remaining listeners on cleanup', () => {
		const iframe = addCanvasIframe();
		const handler = jest.fn();
		const cleanup = observeEditorCanvasPointerDown( handler );
		const doc = iframe.contentDocument as Document;

		cleanup();

		dispatchPointerDown( doc );
		expect( handler ).not.toHaveBeenCalled();
	} );
} );
