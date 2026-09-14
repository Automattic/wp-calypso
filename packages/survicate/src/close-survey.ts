import debug from './debug';

/**
 * Closes any currently displayed Survicate survey.
 *
 * Safe to call in any context: it is a no-op when the Survicate SDK has not
 * loaded (`window._sva` is undefined) or when running outside the browser.
 */
export function closeSurvicateSurvey(): void {
	if ( typeof window !== 'undefined' && window._sva?.closeSurvey ) {
		debug( 'Closing Survicate survey' );
		window._sva.closeSurvey();
	}
}
