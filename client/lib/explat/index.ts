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
 * Look up a dev-only forced value for `flagKey` from URL or localStorage.
 *
 *  - Query param: `?explat_force_<flagKey>=<value>`
 *  - localStorage: `localStorage.setItem('explat_force_<flagKey>', '<value>')`
 *
 * Returns `null` if no override is set. Values are returned as strings; if the
 * caller's `defaultValue` is a boolean or number the override is coerced to
 * match.
 */
function readForceOverride< T extends ExPlatSdk.FeatureValue >(
	flagKey: string,
	defaultValue: T
): ExPlatSdk.WidenPrimitives< T > | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	const key = `explat_force_${ flagKey }`;
	let raw: string | null = null;
	try {
		const params = new URLSearchParams( window.location.search );
		raw = params.get( key );
	} catch {
		// Ignore.
	}
	if ( raw === null ) {
		try {
			raw = window.localStorage.getItem( key );
		} catch {
			// Ignore.
		}
	}
	if ( raw === null ) {
		return null;
	}
	if ( typeof defaultValue === 'boolean' ) {
		return ( raw === 'true' ) as ExPlatSdk.WidenPrimitives< T >;
	}
	if ( typeof defaultValue === 'number' ) {
		const n = Number( raw );
		return ( Number.isFinite( n ) ? n : defaultValue ) as ExPlatSdk.WidenPrimitives< T >;
	}
	return raw as ExPlatSdk.WidenPrimitives< T >;
}

async function logFeatureValueDiagnostics(
	flagKey: string,
	resolved: unknown,
	forced: boolean
): Promise< void > {
	if ( typeof window === 'undefined' ) {
		return;
	}
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
			'%cforced via explat_force_' +
				flagKey +
				' (URL or localStorage) — eval below is what would have run',
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
 * loads. Subsequent calls share the package's cache, so this is cheap.
 *
 * Logs diagnostics to the console after each resolution: attributes used,
 * localStorage overrides, runtime bootstrap, the compiled flag config, the
 * raw payload, and the SDK's `evalFeature` result (force/experiment match,
 * variation, hash value).
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
		const forced = readForceOverride( flagKey, defaultValue );
		if ( forced !== null ) {
			setValue( forced );
			void logFeatureValueDiagnostics( flagKey, forced, true );
			return () => {
				cancelled = true;
			};
		}
		exPlatClient.getFeatureValue( flagKey, defaultValue ).then( ( resolved ) => {
			if ( cancelled ) {
				return;
			}
			setValue( resolved );
			void logFeatureValueDiagnostics( flagKey, resolved, false );
		} );
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flagKey ] );
	return value;
}
