/**
 * Returns the editor iframe element, or null if not found.
 * @returns {HTMLElement | null}
 */
const getEditorIframe = (): HTMLIFrameElement | null => {
	const editorIframe = document.querySelector< HTMLIFrameElement >(
		'iframe[name="editor-canvas"]'
	);
	return editorIframe || null;
};

/**
 * Check if the Editor iframe is focused.
 * @returns {boolean} Whether the editor iframe has focus.
 */
export const isEditorIframeFocused = (): boolean => {
	const editorIframe = getEditorIframe();
	const iframeFocused =
		editorIframe?.contentDocument?.activeElement?.getAttribute( 'contenteditable' ) === 'true';
	return !! iframeFocused;
};
