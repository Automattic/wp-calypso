export type ExPlatRuntimeMode = 'normal' | 'e2e' | 'support' | 'manual_testing' | 'blocked';

export type ExPlatRuntime = {
	schema_version: 1;
	mode: ExPlatRuntimeMode;
	can_evaluate: boolean;
	can_log_assignment: boolean;
	can_create_assignment: boolean;
	include_staging: boolean;
	attributes: Record< string, string >;
	ttl: number;
};

const FAIL_CLOSED_RUNTIME: ExPlatRuntime = {
	schema_version: 1,
	mode: 'blocked',
	can_evaluate: false,
	can_log_assignment: false,
	can_create_assignment: false,
	include_staging: false,
	attributes: {},
	ttl: 0,
};

const MISSING_BOOTSTRAP_RUNTIME: ExPlatRuntime = {
	...FAIL_CLOSED_RUNTIME,
	// Missing bootstrap is allowed to evaluate public client-safe flags with
	// local attributes, but it must never trigger server-side side effects.
	can_evaluate: true,
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

export function getExPlatRuntime(): ExPlatRuntime {
	if ( typeof window === 'undefined' ) {
		return MISSING_BOOTSTRAP_RUNTIME;
	}

	const raw = ( window as unknown as Record< string, unknown > ).__EXPLAT_RUNTIME__;
	if ( typeof raw !== 'object' || raw === null ) {
		return MISSING_BOOTSTRAP_RUNTIME;
	}

	const runtime = raw as Partial< ExPlatRuntime >;
	if ( runtime.schema_version !== 1 ) {
		return FAIL_CLOSED_RUNTIME;
	}

	return normalizeRuntime( runtime );
}
