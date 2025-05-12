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

/**
 * Focus the Editor iframe if possible.
 * @returns {void}
 */
export const focusEditor = (): void => {
	if ( isEditorIframeFocused() ) {
		return;
	}

	const attemptFocus = () => {
		const editorIframe = getEditorIframe();
		const editable = editorIframe?.contentDocument?.querySelector< HTMLElement >(
			'[contenteditable="true"]'
		);

		if ( ! editable ) {
			return false;
		}
		editable.focus();
		return true;
	};

	// If immediate focus attempt fails, watch for DOM changes until
	// the editor becomes available, then focus and auto-disconnect.
	if ( ! attemptFocus() ) {
		const observer = new MutationObserver( ( _, obs ) => {
			if ( attemptFocus() ) {
				obs.disconnect();
			}
		} );
		observer.observe( document.body, { childList: true, subtree: true } );

		// Failsafe disconnect and give up after 30 seconds.
		setTimeout( () => observer.disconnect(), 30000 );
	}
};
