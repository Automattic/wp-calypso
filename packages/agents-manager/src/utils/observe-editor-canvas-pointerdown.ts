/**
 * The Gutenberg Site Editor renders its canvas inside `<iframe name="editor-canvas">`.
 * Pointerdown events originating in that iframe never bubble to the parent document,
 * so any logic that relies on parent-document pointerdowns (e.g. blurring a panel when
 * the user clicks elsewhere) misses clicks on editor content. This watches for the
 * canvas iframe — including remounts on template switch, which yield a fresh
 * contentDocument — and forwards its pointerdown events to the given handler.
 * @param onPointerDown Called for pointerdown events inside the canvas iframe.
 * @returns Cleanup function that stops observing and detaches all listeners.
 */
export default function observeEditorCanvasPointerDown(
	onPointerDown: ( event: PointerEvent ) => void
): () => void {
	const attachedDocs = new Set< Document >();

	const attach = () => {
		const iframe = document.querySelector< HTMLIFrameElement >( 'iframe[name="editor-canvas"]' );
		const doc = iframe?.contentDocument ?? null;

		// Drop documents from detached iframes (a remount yields a fresh
		// contentDocument); a detached doc has `defaultView === null`.
		attachedDocs.forEach( ( attached ) => {
			if ( attached !== doc && ! attached.defaultView ) {
				attached.removeEventListener( 'pointerdown', onPointerDown );
				attachedDocs.delete( attached );
			}
		} );

		if ( ! doc || attachedDocs.has( doc ) ) {
			return;
		}
		attachedDocs.add( doc );
		doc.addEventListener( 'pointerdown', onPointerDown );
	};

	// Cover the canvas already being present when this runs.
	attach();

	// The canvas iframe mounts after first paint and remounts on template switch
	// (a new contentDocument), so re-attach on any DOM mutation under body.
	const observer = new MutationObserver( attach );
	if ( document.body ) {
		observer.observe( document.body, { childList: true, subtree: true } );
	}

	return () => {
		observer.disconnect();
		attachedDocs.forEach( ( doc ) => {
			doc.removeEventListener( 'pointerdown', onPointerDown );
		} );
	};
}
