import type { EffectiveConnectionType, Navigator } from '../types';

export const getEffectiveType = (): EffectiveConnectionType => {
	return ( window.navigator as Navigator )?.connection?.effectiveType;
};
