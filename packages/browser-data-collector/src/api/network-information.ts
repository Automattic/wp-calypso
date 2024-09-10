import type { EffectiveConnectionType } from '../global-types';

export const getEffectiveType = (): EffectiveConnectionType => {
	return window.navigator?.connection?.effectiveType;
};
