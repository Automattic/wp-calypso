import localStorage from './local-storage';
import type { FeatureValue } from '../sdk/types';

export const FORCED_FEATURES_STORAGE_KEY = 'explat-forced-features-v1';
const SCHEMA_VERSION = 1;

export type ForcedFeaturesEvent = {
	/** The flag key that changed, or `null` for a `clearAll()` event. */
	key: string | null;
};

export type ForcedFeaturesListener = ( event: ForcedFeaturesEvent ) => void;

export interface ForcedFeatures {
	get: ( flagKey: string ) => FeatureValue | undefined;
	has: ( flagKey: string ) => boolean;
	set: ( flagKey: string, value: FeatureValue ) => void;
	clear: ( flagKey: string ) => void;
	clearAll: () => void;
	snapshot: () => Record< string, FeatureValue >;
	subscribe: ( listener: ForcedFeaturesListener ) => () => void;
}

type StoredShape = {
	schema_version: number;
	overrides: Record< string, FeatureValue >;
};

function readPersisted(): Record< string, FeatureValue > {
	const raw = localStorage.getItem( FORCED_FEATURES_STORAGE_KEY );
	if ( ! raw ) {
		return {};
	}
	try {
		const parsed = JSON.parse( raw ) as Partial< StoredShape >;
		if ( ! parsed || parsed.schema_version !== SCHEMA_VERSION ) {
			return {};
		}
		return parsed.overrides && typeof parsed.overrides === 'object' ? parsed.overrides : {};
	} catch {
		// Corrupt — drop it so we don't keep parsing it on every load.
		localStorage.removeItem( FORCED_FEATURES_STORAGE_KEY );
		return {};
	}
}

function writePersisted( overrides: Record< string, FeatureValue > ): void {
	try {
		const body: StoredShape = { schema_version: SCHEMA_VERSION, overrides };
		localStorage.setItem( FORCED_FEATURES_STORAGE_KEY, JSON.stringify( body ) );
	} catch {
		// quota / privacy mode — overrides remain in-memory only
	}
}

export function createForcedFeatures(): ForcedFeatures {
	const overrides: Record< string, FeatureValue > = readPersisted();
	const listeners = new Set< ForcedFeaturesListener >();

	const notify = ( event: ForcedFeaturesEvent ) => {
		for ( const l of listeners ) {
			try {
				l( event );
			} catch {
				// Listener errors must not break the caller.
			}
		}
	};

	return {
		get: ( flagKey ) => ( flagKey in overrides ? overrides[ flagKey ] : undefined ),
		has: ( flagKey ) => flagKey in overrides,
		set: ( flagKey, value ) => {
			overrides[ flagKey ] = value;
			writePersisted( overrides );
			notify( { key: flagKey } );
		},
		clear: ( flagKey ) => {
			if ( ! ( flagKey in overrides ) ) {
				return;
			}
			delete overrides[ flagKey ];
			writePersisted( overrides );
			notify( { key: flagKey } );
		},
		clearAll: () => {
			for ( const k of Object.keys( overrides ) ) {
				delete overrides[ k ];
			}
			writePersisted( overrides );
			notify( { key: null } );
		},
		snapshot: () => ( { ...overrides } ),
		subscribe: ( listener ) => {
			listeners.add( listener );
			return () => {
				listeners.delete( listener );
			};
		},
	};
}
