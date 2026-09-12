let isWrapped = false;

/**
 * TanStack Router drives navigations through `document.startViewTransition()`
 * but discards the returned `ViewTransition`. When a navigation supersedes an
 * in-flight one, the browser skips the pending transition and its `ready`
 * promise rejects with `AbortError: Transition was skipped`, surfacing as an
 * uncaught promise rejection. Skipping is the correct browser behavior; only
 * the unhandled rejection is noise.
 *
 * Wrap `startViewTransition` once so the transition's promises always have a
 * handler. Only the skip `AbortError` is swallowed; any other rejection is
 * re-thrown so real failures stay visible.
 */
export function suppressSkippedViewTransitions() {
	if (
		isWrapped ||
		typeof document === 'undefined' ||
		typeof document.startViewTransition !== 'function'
	) {
		return;
	}
	isWrapped = true;

	const startViewTransition = document.startViewTransition.bind( document );

	const swallowSkippedTransition = ( error: unknown ) => {
		if ( error instanceof DOMException && error.name === 'AbortError' ) {
			return;
		}
		throw error;
	};

	document.startViewTransition = ( ...args: Parameters< typeof startViewTransition > ) => {
		const transition = startViewTransition( ...args );
		transition.ready.catch( swallowSkippedTransition );
		transition.updateCallbackDone.catch( swallowSkippedTransition );
		transition.finished.catch( swallowSkippedTransition );
		return transition;
	};
}
