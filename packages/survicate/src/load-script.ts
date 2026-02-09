let loadPromise: Promise< void > | null = null;

/**
 * Dynamically injects the Survicate script tag into the page.
 * Prevents duplicate loading across multiple calls. Returns the same promise
 * if called while a load is already in progress.
 */
export function loadSurvicateScript( workspaceId: string ): Promise< void > {
	if ( loadPromise ) {
		return loadPromise;
	}

	loadPromise = new Promise( ( resolve, reject ) => {
		const s = document.createElement( 'script' );
		s.src = `https://survey.survicate.com/workspaces/${ workspaceId }/web_surveys.js`;
		s.async = true;

		s.onload = () => {
			resolve();
		};

		s.onerror = () => {
			loadPromise = null;
			reject( new Error( 'Failed to load Survicate script' ) );
		};

		const firstScript = document.getElementsByTagName( 'script' )[ 0 ];
		firstScript.parentNode?.insertBefore( s, firstScript );
	} );

	return loadPromise;
}

/**
 * Returns whether the Survicate script has already been loaded or is loading.
 */
export function isSurvicateScriptLoaded(): boolean {
	return loadPromise !== null;
}

/**
 * Resets the internal loaded state. Only intended for testing.
 */
export function resetSurvicateScriptState(): void {
	loadPromise = null;
}
