export type ExPlatRuntimeMode = 'normal' | 'e2e' | 'support' | 'manual_testing' | 'blocked';

export type ExPlatRuntime = {
	schema_version: 1;
	mode: ExPlatRuntimeMode;
	can_evaluate: boolean;
	can_log_assignment: boolean;
	can_create_assignment: boolean;
	attributes: Record< string, string >;
};

const FAIL_CLOSED_RUNTIME: ExPlatRuntime = {
	schema_version: 1,
	mode: 'blocked',
	can_evaluate: false,
	can_log_assignment: false,
	can_create_assignment: false,
	attributes: {},
};

const MISSING_BOOTSTRAP_RUNTIME: ExPlatRuntime = {
	...FAIL_CLOSED_RUNTIME,
	// Missing bootstrap is allowed to evaluate public client-safe flags with
	// local attributes, but it must never trigger server-side side effects.
	can_evaluate: true,
};

/**
 * In development the absence of `window.__EXPLAT_RUNTIME__` is the same
 * situation as production a8c manual testing: the dev/staff is poking at
 * flags but no real assignments should be recorded. Surface that semantically
 * so the panel + logs read `manual_testing` instead of `blocked`.
 */
const DEV_MISSING_BOOTSTRAP_RUNTIME: ExPlatRuntime = {
	...MISSING_BOOTSTRAP_RUNTIME,
	mode: 'manual_testing',
};

function normalizeRuntime( runtime: Partial< ExPlatRuntime > ): ExPlatRuntime {
	const normalized: ExPlatRuntime = {
		...FAIL_CLOSED_RUNTIME,
		...runtime,
		attributes: runtime.attributes ?? {},
	};

	if ( normalized.mode === 'normal' ) {
		return normalized;
	}
	if ( normalized.mode === 'manual_testing' ) {
		return {
			...normalized,
			can_log_assignment: false,
			can_create_assignment: false,
		};
	}
	if (
		normalized.mode === 'e2e' ||
		normalized.mode === 'support' ||
		normalized.mode === 'blocked'
	) {
		return {
			...normalized,
			can_evaluate: false,
			can_log_assignment: false,
			can_create_assignment: false,
		};
	}

	return FAIL_CLOSED_RUNTIME;
}

function readExPlatRuntime( isDevelopmentMode: boolean ): ExPlatRuntime {
	const fallback = isDevelopmentMode ? DEV_MISSING_BOOTSTRAP_RUNTIME : MISSING_BOOTSTRAP_RUNTIME;
	if ( typeof window === 'undefined' ) {
		return fallback;
	}

	const raw = ( window as unknown as Record< string, unknown > ).__EXPLAT_RUNTIME__;
	if ( typeof raw !== 'object' || raw === null ) {
		return fallback;
	}

	const runtime = raw as Partial< ExPlatRuntime >;
	if ( runtime.schema_version !== 1 ) {
		return FAIL_CLOSED_RUNTIME;
	}

	return normalizeRuntime( runtime );
}

/**
 * Returns a memoized reader keyed on the identity of `window.__EXPLAT_RUNTIME__`.
 *
 * The bootstrap object is set once at page load and treated as immutable for
 * the page's lifetime; re-reading on every `getFeatureValue` call would
 * allocate 2-3 spread objects per call in render hot paths.
 */
export function createExPlatRuntimeReader( isDevelopmentMode = false ): () => ExPlatRuntime {
	let lastRaw: unknown = Symbol( 'unset' );
	let lastResult: ExPlatRuntime = isDevelopmentMode
		? DEV_MISSING_BOOTSTRAP_RUNTIME
		: MISSING_BOOTSTRAP_RUNTIME;
	return () => {
		const raw =
			typeof window === 'undefined'
				? undefined
				: ( window as unknown as Record< string, unknown > ).__EXPLAT_RUNTIME__;
		if ( raw === lastRaw ) {
			return lastResult;
		}
		lastRaw = raw;
		lastResult = readExPlatRuntime( isDevelopmentMode );
		return lastResult;
	};
}
