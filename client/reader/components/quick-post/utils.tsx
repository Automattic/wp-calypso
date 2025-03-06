/**
 * Returns the contenteditable element inside the editor iframe, or null if not found.
 * @returns {HTMLElement | null}
 */
const getEditableElement = (): HTMLElement | null => {
	const iframe = document.querySelector< HTMLIFrameElement >( 'iframe[name="editor-canvas"]' );
	const doc = iframe?.contentDocument;
	return doc?.querySelector< HTMLElement >( '[contenteditable="true"]' ) || null;
};

/**
 * Check if the Editor iframe is focused.
 * @returns {boolean} Whether the editor iframe has focus.
 */
export const isEditorIframeFocused = (): boolean => {
	const editable = getEditableElement();
	return editable !== null && editable.ownerDocument?.activeElement === editable;
};

/**
 * Focus the Editor iframe if possible.
 * @returns {void}
 */
export const focusEditor = (): void => {
	const attemptFocus = () => {
		const editable = getEditableElement();
		if ( ! editable ) {
			return false;
		}
		editable.focus();
		editable.dispatchEvent( new MouseEvent( 'click' ) );
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
