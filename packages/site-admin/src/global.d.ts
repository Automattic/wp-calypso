/**
 * - startViewTransition
 * - ViewTransition
 *
 * > Limited availability
 * > This feature is not Baseline because it does not work
 * in some of the most widely-used browsers.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition#browser_compatibility
 */
interface ViewTransition {
	finished: Promise< void >;
}

interface Document {
	startViewTransition?: ( callback: () => void ) => ViewTransition;
}
