let isHandled = false;

/**
 * A skipped view transition (the tab is hidden, or another transition started) rejects its `ready`
 * promise, and the spec leaves that rejection to the caller. TanStack Router never reads `ready`, so
 * Safari and Firefox report every skipped transition as an unhandled rejection; the update itself still
 * runs. Remove this once TanStack Router handles `ready` itself.
 */
export function handleSkippedViewTransitions() {
	if (
		isHandled ||
		typeof document === 'undefined' ||
		typeof document.startViewTransition !== 'function'
	) {
		return;
	}
	isHandled = true;

	const startViewTransition = document.startViewTransition.bind( document );
	document.startViewTransition = ( ( ...args: Parameters< typeof startViewTransition > ) => {
		const transition = startViewTransition( ...args );
		transition.ready.catch( () => {} );
		return transition;
	} ) as typeof document.startViewTransition;
}
