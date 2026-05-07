import { createExPlatClient, ExPlatSdk } from '@automattic/explat-client';
import createExPlatClientReactHelpers from '@automattic/explat-client-react-helpers';
import { useEffect, useState } from 'react';
import { getAnonId, initializeAnonId } from './internals/anon-id';
import fetchExperimentAssignment from './internals/fetch-experiment-assignment';
import fetchFlagPayload from './internals/fetch-flag-payload';
import getAttributes from './internals/get-attributes';
import { logError } from './internals/log-error';
import logFeatureAssignment from './internals/log-feature-assignment';
import { isDevelopmentMode } from './internals/misc';

initializeAnonId().catch( ( e ) => logError( { message: e.message } ) );

const exPlatClient = createExPlatClient( {
	fetchExperimentAssignment,
	getAnonId,
	logError,
	isDevelopmentMode,
	fetchFlagPayload,
	logFeatureAssignment,
	getAttributes,
} );

export const { loadExperimentAssignment, dangerouslyGetExperimentAssignment, getFeatureValue } =
	exPlatClient;
const exPlatClientReactHelpers = createExPlatClientReactHelpers( exPlatClient );
export const { useExperiment, Experiment, ProvideExperimentData } = exPlatClientReactHelpers;

/**
 * In-process handle to the SDK's dev surface. Used by the
 * `client/lib/explat-helper` panel — gated to dev/staging via the
 * `dev/explat-helper` config flag, so production user bundles never load it.
 * For console use, prefer `window.__EXPLAT__`, which is installed by the
 * package itself with its own gating.
 */
export const exPlatDevtools = exPlatClient.devtools;

const EXTERNAL_FORCE_PREFIX = 'explat_force_';

/**
 * Coerce a raw string from URL/localStorage into a `FeatureValue`. The
 * legacy reader in this file coerced based on the caller's `defaultValue`
 * type at consumption time, but the SDK's forced-features map stores values
 * once and serves all callers, so we have to pick a type at import time.
 *
 *   - `"true"` / `"false"` → boolean
 *   - numeric string (`"0.5"`, `"-3"`) → number
 *   - everything else → string
 *
 * Edge case: a string flag whose intended forced value is literally `"true"`
 * or a numeric string will be coerced. For those, set the value through the
 * panel or `window.__EXPLAT__.setForcedFeatures(...)` instead.
 */
function coerceForceValue( raw: string ): ExPlatSdk.FeatureValue {
	if ( raw === 'true' ) {
		return true;
	}
	if ( raw === 'false' ) {
		return false;
	}
	if ( /^-?\d+(\.\d+)?$/.test( raw ) ) {
		const n = Number( raw );
		if ( Number.isFinite( n ) ) {
			return n;
		}
	}
	return raw;
}

/**
 * Import dev-only forced values from URL params and per-flag localStorage
 * keys into the SDK's `forcedFeatures` map. Runs once at module init.
 *
 * Sources (URL wins on conflict):
 *   - localStorage: any `explat_force_<flagKey>` key — one-shot migration:
 *     deleted after import so it can't fight a later panel "Reset to auto".
 *   - URL: any `?explat_force_<flagKey>=<value>` param — re-applied on every
 *     load. Drop the URL param to stop re-applying.
 *
 * After import the panel and `window.__EXPLAT__` are the source of truth.
 */
function importExternalForcedFeatures(): void {
	if ( typeof window === 'undefined' ) {
		return;
	}
	const imports = new Map< string, string >();
	const legacyKeys: string[] = [];
	try {
		for ( let i = 0; i < window.localStorage.length; i++ ) {
			const k = window.localStorage.key( i );
			if ( k && k.startsWith( EXTERNAL_FORCE_PREFIX ) ) {
				const v = window.localStorage.getItem( k );
				if ( v !== null ) {
					imports.set( k.slice( EXTERNAL_FORCE_PREFIX.length ), v );
					legacyKeys.push( k );
				}
			}
		}
	} catch {
		// Ignore.
	}
	try {
		const params = new URLSearchParams( window.location.search );
		for ( const [ k, v ] of params ) {
			if ( k.startsWith( EXTERNAL_FORCE_PREFIX ) ) {
				imports.set( k.slice( EXTERNAL_FORCE_PREFIX.length ), v );
			}
		}
	} catch {
		// Ignore.
	}
	for ( const [ flagKey, raw ] of imports ) {
		exPlatClient.devtools.forcedFeatures.set( flagKey, coerceForceValue( raw ) );
	}
	for ( const k of legacyKeys ) {
		try {
			window.localStorage.removeItem( k );
		} catch {
			// Ignore.
		}
	}
}

importExternalForcedFeatures();

async function logFeatureValueDiagnostics( flagKey: string, resolved: unknown ): Promise< void > {
	if ( typeof window === 'undefined' ) {
		return;
	}
	const forced = exPlatClient.devtools.forcedFeatures.has( flagKey );
	const runtime = ( window as unknown as { __EXPLAT_RUNTIME__?: unknown } ).__EXPLAT_RUNTIME__;
	const overrides = ( () => {
		try {
			const raw = window.localStorage.getItem( 'explat_attribute_overrides' );
			return raw ? JSON.parse( raw ) : null;
		} catch {
			return null;
		}
	} )();
	const attributes = await getAttributes();
	let payload: unknown = null;
	let payloadError: string | null = null;
	try {
		payload = await fetchFlagPayload();
	} catch ( e ) {
		payloadError = ( e as Error ).message;
	}
	const flag =
		payload && typeof payload === 'object' && 'flags' in payload
			? ( payload as { flags: Record< string, ExPlatSdk.Feature > } ).flags[ flagKey ]
			: undefined;
	const evalResult = flag
		? ExPlatSdk.evalFeature( flag, attributes as ExPlatSdk.Attributes )
		: null;

	/* eslint-disable no-console */
	console.groupCollapsed(
		`[ExPlat] ${ flagKey } → ${ JSON.stringify( resolved ) }${ forced ? ' (FORCED)' : '' }`
	);
	if ( forced ) {
		console.log(
			'%cforced via SDK forcedFeatures map (panel, window.__EXPLAT__, or imported from URL/localStorage explat_force_' +
				flagKey +
				') — eval below is what would have run',
			'color: orange; font-weight: bold'
		);
	}
	console.log( 'attributes', attributes );
	console.log( 'localStorage overrides', overrides );
	console.log( 'window.__EXPLAT_RUNTIME__', runtime );
	console.log( 'compiled flag config', flag );
	console.log( 'full /flags/calypso payload', payload );
	if ( payloadError ) {
		console.warn( '/flags/calypso fetch error:', payloadError );
	}
	console.log( 'eval result', evalResult );
	console.groupEnd();
	/* eslint-enable no-console */
}

/**
 * React hook wrapper around `getFeatureValue`. Returns the caller default
 * synchronously, then re-renders with the resolved value once the flag payload
 * loads (or immediately if the flag is in the SDK's forced-features map).
 *
 * Force precedence is delegated to the SDK: `getFeatureValue` checks
 * `forcedFeatures` first, then falls back to natural eval against the cached
 * `/flags` payload. URL params and `localStorage.explat_force_<key>` keys are
 * imported into `forcedFeatures` once at module init by
 * `importExternalForcedFeatures()`.
 *
 * Subscribed to `forcedFeatures` so panel toggles flip the UI live without
 * reload. Logs diagnostics on every resolution.
 */
export function useFeatureValue< T extends ExPlatSdk.FeatureValue >(
	flagKey: string,
	defaultValue: T
): ExPlatSdk.WidenPrimitives< T > {
	const [ value, setValue ] = useState< ExPlatSdk.WidenPrimitives< T > >(
		defaultValue as unknown as ExPlatSdk.WidenPrimitives< T >
	);
	useEffect( () => {
		let cancelled = false;
		const evaluate = () => {
			exPlatClient.getFeatureValue( flagKey, defaultValue ).then( ( resolved ) => {
				if ( cancelled ) {
					return;
				}
				setValue( resolved );
				void logFeatureValueDiagnostics( flagKey, resolved );
			} );
		};
		evaluate();
		const unsubscribe = exPlatClient.devtools.forcedFeatures.subscribe( ( event ) => {
			if ( event.key === null || event.key === flagKey ) {
				evaluate();
			}
		} );
		return () => {
			cancelled = true;
			unsubscribe();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flagKey ] );
	return value;
}
