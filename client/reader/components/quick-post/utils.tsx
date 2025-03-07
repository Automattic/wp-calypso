/**
 * Check if the Editor iframe is focused.
 * @returns {boolean} Whether the editor iframe has focus
 */
export const isEditorIframeFocused = (): boolean => {
	const editorIframe = document.querySelector< HTMLIFrameElement >(
		'iframe[name="editor-canvas"]'
	);
	const iframeFocused =
		editorIframe?.contentDocument?.activeElement?.getAttribute( 'contenteditable' ) === 'true';
	return !! iframeFocused;
};
