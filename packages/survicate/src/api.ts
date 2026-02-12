export interface SurvicateApi {
	setVisitorTraits: ( traits: Record< string, string > ) => void;
	invokeEvent: ( eventName: string ) => void;
	destroyVisitor: () => void;
	addEventListener: ( event: string, callback: () => void ) => void;
	removeEventListener: ( event: string, callback: () => void ) => void;
}

/**
 * Returns a typed interface to the Survicate API, or null if the script hasn't loaded.
 */
export function getSurvicateApi(): SurvicateApi | null {
	if ( typeof window._sva === 'undefined' ) {
		return null;
	}

	return window._sva as SurvicateApi;
}
