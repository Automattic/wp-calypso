import debug from './debug';

/**
 * Pauses Survicate's automatic campaign targeting.
 *
 * `window._sva.disableTargeting` is read live by the SDK's targeting engine
 * (verified in `widget_core-28.33.0.js`): while truthy, only API-triggered
 * surveys remain eligible and auto-campaigns are not scheduled at all. Without
 * this, closing a suppressed survey is not enough — the engine re-evaluates
 * targeting every few seconds and re-displays it, producing an endless
 * display/close loop and a stream of `targeting`/`seen.json` requests.
 */
export function pauseSurvicateTargeting(): void {
	if ( typeof window !== 'undefined' && window._sva && ! window._sva.disableTargeting ) {
		debug( 'Pausing Survicate targeting' );
		window._sva.disableTargeting = true;
	}
}

/**
 * Resumes Survicate's automatic campaign targeting after a pause, re-running
 * the targeting evaluation via the SDK's public `retarget()` so an eligible
 * survey can display again. No-op unless targeting is currently paused.
 */
export function resumeSurvicateTargeting(): void {
	if ( typeof window !== 'undefined' && window._sva?.disableTargeting ) {
		debug( 'Resuming Survicate targeting' );
		window._sva.disableTargeting = false;
		window._sva.retarget?.();
	}
}
