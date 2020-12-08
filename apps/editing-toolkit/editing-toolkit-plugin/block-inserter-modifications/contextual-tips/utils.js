/**
 * Detect if the editor is already iFramed.
 *
 * @returns {boolean} `True` is the editor is iFramed. Otherwise, `False`.
 */
export const inIframe = () => {
	try {
		return window.self !== window.top;
	} catch ( e ) {
		return true;
	}
};

export const isSimpleSite = !! (
	window &&
	window._currentSiteType &&
	window._currentSiteType === 'simple'
);
