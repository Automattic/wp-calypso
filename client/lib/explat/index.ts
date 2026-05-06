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

async function logFeatureValueDiagnostics( flagKey: string, resolved: unknown ): Promise< void > {
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
	console.groupCollapsed( `[ExPlat] ${ flagKey } → ${ JSON.stringify( resolved ) }` );
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
		exPlatClient.getFeatureValue( flagKey, defaultValue ).then( ( resolved ) => {
			if ( cancelled ) {
				return;
			}
			setValue( resolved );
			void logFeatureValueDiagnostics( flagKey, resolved );
		} );
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flagKey ] );
	return value;
}
