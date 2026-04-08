/**
 * Get the editor canvas iframe and its inner elements.
 */
export function getCanvasIframeElements() {
	const canvasIframe = document.querySelector< HTMLIFrameElement >( '[name="editor-canvas"]' );
	const canvasIframeDocument = canvasIframe?.contentDocument ?? null;
	const canvasIframeRoot = canvasIframeDocument?.documentElement ?? null;
	const canvasIframeBody = canvasIframeDocument?.body ?? null;
	return { canvasIframe, canvasIframeRoot, canvasIframeDocument, canvasIframeBody };
}
