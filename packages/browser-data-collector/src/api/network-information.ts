export const getEffectiveType = (): EffectiveConnectionType => {
	return window.navigator?.connection?.effectiveType;
};
