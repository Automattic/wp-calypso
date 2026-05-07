import type { EvalLog, EvalLogEntry } from './eval-log';
import type { ForcedFeatures } from './forced-features';
import type { ExPlatRuntimeMode } from './runtime';
import type { Attributes, FeatureValue, Result } from '../sdk/types';

export type FlagInfoRule =
	| {
			index: number;
			type: 'force';
			value: FeatureValue;
			condition: unknown | null;
	  }
	| {
			index: number;
			type: 'experiment';
			experimentId: number;
			hashAttribute: string;
			condition: unknown | null;
			variations: Array< { name: string; value: FeatureValue } >;
	  };

export type FlagInfo = {
	experimentId: number | null;
	hashAttribute: string | null;
	defaultValue: FeatureValue | null;
	variations: Array< { name: string; value: FeatureValue; isDefault: boolean } >;
	rules: FlagInfoRule[];
};

/**
 * Dev / manual-testing surface exposed on the client as `client.devtools`
 * and (when gated allows) on `window.__EXPLAT__`. Always present on the
 * client object regardless of mode.
 */
export type DevtoolsSurface = {
	/** Set/clear overrides applied before any fetch/eval. */
	forcedFeatures: ForcedFeatures;
	/** Last N evaluations of `getFeatureValue`. */
	evalLog: EvalLog;
	/**
	 * Flag keys present in the most recently fetched payload. Empty array
	 * before the first successful fetch.
	 */
	getKnownFlags: () => string[];
	/**
	 * Variation values defined for `flagKey` in the most recently fetched
	 * payload. Empty array if the flag is unknown or no payload is cached.
	 * Phase 1 dropdowns can use this to *suggest* values; the override store
	 * itself accepts any `FeatureValue`.
	 */
	getKnownVariations: ( flagKey: string ) => FeatureValue[];
	/**
	 * Richer per-flag metadata for UI surfaces: experiment IDs, variation
	 * names, hash attribute, default value. Pulled from the cached payload —
	 * empty/null fields when no payload is cached or the flag is unknown.
	 */
	getFlagInfo: ( flagKey: string ) => FlagInfo | null;
	/**
	 * Raw `Feature` entry from the cached `/flags` payload — the exact shape
	 * the eval engine sees, with `value_type`, `default_value`, and `rules`.
	 * Returns `null` when no payload is cached or the flag isn't present.
	 */
	getRawFeature: ( flagKey: string ) => unknown | null;
	/**
	 * Evaluate `flagKey` against the live `/flags` payload as if no forced
	 * override existed and as if the call were a render-time dry run:
	 * skips the forced-features map, never fires `/assignments/log`, never
	 * appends to the eval log. Returns `null` when evaluation isn't possible
	 * (no payload, runtime blocks evaluation, fetch hasn't happened yet,
	 * flag unknown).
	 */
	previewFeatureValue: ( flagKey: string ) => Promise< Result | null >;
	/**
	 * Returns the full attribute map that would be passed to `evalFeature`,
	 * merging host-supplied local attributes with the server's
	 * `__EXPLAT_RUNTIME__.attributes`. Returns `null` when the host didn't
	 * wire `getAttributes` or evaluation isn't possible (runtime blocks).
	 */
	getEvaluationAttributes: () => Promise< Attributes | null >;
	/**
	 * Trigger a `/flags` fetch without going through `getFeatureValue`.
	 * Resolves once the SDK's flag cache has been populated (or with an
	 * empty list on failure / when the host did not wire `fetchFlagPayload`).
	 * Pass `{ force: true }` to bypass the TTL cache and re-fetch.
	 */
	loadFlags: ( options?: { force?: boolean } ) => Promise< string[] >;
};

/**
 * Public shape of the `window.__EXPLAT__` debug global.
 *
 * Treat this as a stable contract: a Phase 1 in-page panel and a future
 * Chrome extension will both consume it. Internal SDK types
 * (ForcedFeatures/EvalLog) are deliberately not re-exposed here so we keep
 * room to refactor those without breaking the global.
 */
export type WindowExPlat = {
	setForcedFeatures: (
		values: Map< string, FeatureValue > | Record< string, FeatureValue >
	) => void;
	clearForcedFeatures: ( flagKey?: string ) => void;
	getForcedFeatures: () => Record< string, FeatureValue >;
	subscribe: ( listener: () => void ) => () => void;
	getKnownFlags: () => string[];
	getKnownVariations: ( flagKey: string ) => FeatureValue[];
	getFlagInfo: ( flagKey: string ) => FlagInfo | null;
	getRawFeature: ( flagKey: string ) => unknown | null;
	previewFeatureValue: ( flagKey: string ) => Promise< Result | null >;
	getEvaluationAttributes: () => Promise< Attributes | null >;
	loadFlags: ( options?: { force?: boolean } ) => Promise< string[] >;
	getLogs: () => EvalLogEntry[];
	clearLogs: () => void;
};

/**
 * Attach `window.__EXPLAT__` for browser console / panel use. Gated to
 * dev mode or `manual_testing` runtime — production user sessions keep
 * `__EXPLAT__` undefined.
 */
export function installDevtoolsWindow( params: {
	devtools: DevtoolsSurface;
	isDevelopmentMode: boolean;
	getRuntimeMode: () => ExPlatRuntimeMode;
} ): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	const allowed = params.isDevelopmentMode || params.getRuntimeMode() === 'manual_testing';
	if ( ! allowed ) {
		return;
	}
	const { forcedFeatures, evalLog } = params.devtools;
	const surface: WindowExPlat = {
		setForcedFeatures: ( values ) => {
			const entries =
				values instanceof Map
					? Array.from( values.entries() )
					: ( Object.entries( values ) as Array< [ string, FeatureValue ] > );
			for ( const [ key, value ] of entries ) {
				forcedFeatures.set( key, value );
			}
		},
		clearForcedFeatures: ( flagKey ) => {
			if ( flagKey === undefined ) {
				forcedFeatures.clearAll();
			} else {
				forcedFeatures.clear( flagKey );
			}
		},
		getForcedFeatures: () => forcedFeatures.snapshot(),
		subscribe: ( listener ) => forcedFeatures.subscribe( () => listener() ),
		getKnownFlags: () => params.devtools.getKnownFlags(),
		getKnownVariations: ( flagKey ) => params.devtools.getKnownVariations( flagKey ),
		getFlagInfo: ( flagKey ) => params.devtools.getFlagInfo( flagKey ),
		getRawFeature: ( flagKey ) => params.devtools.getRawFeature( flagKey ),
		previewFeatureValue: ( flagKey ) => params.devtools.previewFeatureValue( flagKey ),
		getEvaluationAttributes: () => params.devtools.getEvaluationAttributes(),
		loadFlags: ( options ) => params.devtools.loadFlags( options ),
		getLogs: () => evalLog.entries(),
		clearLogs: () => evalLog.clear(),
	};
	( window as unknown as Record< string, unknown > ).__EXPLAT__ = surface;
}
