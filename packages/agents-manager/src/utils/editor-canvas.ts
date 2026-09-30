/** The document of the editor's canvas iframe, or `null` where no canvas is mounted. */
export function getCanvasDocument(): Document | null {
	try {
		return (
			document.querySelector< HTMLIFrameElement >( 'iframe[name="editor-canvas"]' )
				?.contentDocument ?? null
		);
	} catch {
		// A cross-origin frame under that name is not the canvas.
		return null;
	}
}
