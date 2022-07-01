import * as React from 'react';
import { useContext } from 'react';
import { FeatureFlags } from '../types';

const FeatureFlagContext = React.createContext( {
	loadNextStepsTutorial: false,
} );

export const FeatureFlagProvider: React.FC< FeatureFlags > = function ( { children } ) {
	// The helpCenterFeatureFlags value is added as a global through the help-center-script
	return (
		<FeatureFlagContext.Provider value={ helpCenterFeatureFlags }>
			{ children }
		</FeatureFlagContext.Provider>
	);
};

export function useFeatureFlags() {
	const featureFlags = useContext( FeatureFlagContext );

	// Trying to call hook outside of component that renders FeatureFlagProvider
	if ( featureFlags === undefined ) {
		throw new Error( 'useFeatureFlags must be used within a FeatureFlagProvider' );
	}

	return featureFlags;
}
