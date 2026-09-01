// The exception stacktrace for translation-induced commit crashes is ~50 frames
// of react-dom internals, identical for every crash site, so Sentry groups them
// all into one issue. Shaping the React component stack as a synthetic error's
// `.stack` and chaining it via `cause` gives Sentry symbolicable, in-app
// `client/dashboard/…` frames to group on instead, splitting the mega-issue per
// failing component.

const MAX_COMPONENT_STACK_FRAMES = 8;

/**
 * Attach a React component stack to an error as a chained `cause` exception so
 * Sentry symbolicates and groups by the failing component.
 */
export function attachComponentStackAsCause( error: Error, componentStack?: string | null ) {
	if ( ! componentStack ) {
		return;
	}

	// Don't clobber existing cause chain.
	if ( ( error as { cause?: unknown } ).cause != null ) {
		return;
	}

	const frames = componentStack
		.split( '\n' )
		.map( ( line ) => line.trim() )
		.filter( ( line ) => line.startsWith( 'at ' ) )
		.slice( 0, MAX_COMPONENT_STACK_FRAMES );

	if ( frames.length === 0 ) {
		return;
	}

	const cause = new Error( 'React was rendering this component tree when the error was thrown' );
	cause.name = 'ReactComponentStack';
	cause.stack = [
		`${ cause.name }: ${ cause.message }`,
		...frames.map( ( frame ) => `    ${ frame }` ),
	].join( '\n' );

	try {
		( error as { cause?: unknown } ).cause = cause;
	} catch {
		// Some exotic error objects expose a read-only `cause`; leave them as-is.
	}
}
