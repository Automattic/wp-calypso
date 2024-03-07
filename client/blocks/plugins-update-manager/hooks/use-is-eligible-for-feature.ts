import { useContext } from 'react';
import { PluginUpdateManagerContext } from '../context';

export function useIsEligibleForFeature() {
	const { isEligibleForFeature } = useContext( PluginUpdateManagerContext );
	return isEligibleForFeature;
}
