// The exception stacktrace for translation-induced commit crashes is ~50 frames
// of react-dom internals, identical for every crash site, so Sentry groups them
// all into one issue. Appending the innermost React components to the Sentry
// fingerprint splits that mega-issue per failing component, without touching
// `exception.values` — Sentry's Dedupe and InboundFilters integrations both key
// exclusively on `values[0]`, so injecting a synthetic frame there would drop
// distinct errors and stop `denyUrls` filtering extension noise.

const MAX_FINGERPRINT_COMPONENTS = 3;

/**
 * React derives component-stack frame shape from the host engine: V8 emits
 * `at Name (url)`, SpiderMonkey and JavaScriptCore emit `Name@url`, and some
 * engines emit a bare `Name`. Host elements (`div`, `span`) come through
 * lowercase and are identical across crash sites, so only capitalised React
 * component names are kept.
 */
function parseComponentNames( componentStack: string ): string[] {
	const names: string[] = [];

	for ( const line of componentStack.split( '\n' ) ) {
		const name = line.trim().match( /^(?:at\s+)?([A-Za-z0-9_$.]+)/ )?.[ 1 ];
		if ( name && /^[A-Z]/.test( name ) ) {
			names.push( name );
		}
	}

	return names;
}

/**
 * Build a Sentry fingerprint that keeps the default grouping but splits it by
 * the innermost React components on the stack.
 */
export function getComponentStackFingerprint(
	componentStack?: string | null
): string[] | undefined {
	if ( ! componentStack ) {
		return undefined;
	}

	const names = parseComponentNames( componentStack ).slice( 0, MAX_FINGERPRINT_COMPONENTS );
	if ( names.length === 0 ) {
		return undefined;
	}

	return [ '{{ default }}', ...names ];
}
