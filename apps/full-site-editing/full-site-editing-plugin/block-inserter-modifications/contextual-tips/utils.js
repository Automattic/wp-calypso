/**
 * Detect if the editor is already iFramed.
 *
 * @returns {boolean} `True` is the editor is iFramed. Otherwise, `False`.
 */
export const isGutenframed = () => {
	try {
		return window.self !== window.top;
	} catch ( e ) {
		return true;
	}
};
