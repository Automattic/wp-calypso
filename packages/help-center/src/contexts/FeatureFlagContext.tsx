import * as React from 'react';
import { useContext } from 'react';
import { FeatureFlags } from '../types';

// Lets typescript know about the feature flags global added through the help-center-script
declare const helpCenterFeatureFlags: FeatureFlags;

const FeatureFlagContext = React.createContext< FeatureFlags | undefined >( undefined );

export const FeatureFlagProvider: React.FC< { children: JSX.Element } > = function ( {
	children,
} ) {
	let featureFlags;

	// If the Editing Toolkit Plugin is not loaded
	if ( typeof helpCenterFeatureFlags === 'undefined' ) {
		featureFlags = undefined;
	} else {
		featureFlags = helpCenterFeatureFlags;
	}
	return (
		<FeatureFlagContext.Provider value={ featureFlags }>{ children }</FeatureFlagContext.Provider>
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
