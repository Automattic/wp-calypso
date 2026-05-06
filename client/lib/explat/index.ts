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
 * React hook wrapper around `getFeatureValue`. Returns the caller default
 * synchronously, then re-renders with the resolved value once the flag payload
 * loads. Subsequent calls share the package's cache, so this is cheap.
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
			if ( ! cancelled ) {
				setValue( resolved );
			}
		} );
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ flagKey ] );
	return value;
}
