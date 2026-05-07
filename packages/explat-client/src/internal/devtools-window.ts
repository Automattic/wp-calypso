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

export type DevtoolsSurface = {
	forcedFeatures: ForcedFeatures;
	evalLog: EvalLog;
	getKnownFlags: () => string[];
	getKnownVariations: ( flagKey: string ) => FeatureValue[];
	getFlagInfo: ( flagKey: string ) => FlagInfo | null;
	getRawFeature: ( flagKey: string ) => unknown | null;
	previewFeatureValue: ( flagKey: string ) => Promise< Result | null >;
	getEvaluationAttributes: () => Promise< Attributes | null >;
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
