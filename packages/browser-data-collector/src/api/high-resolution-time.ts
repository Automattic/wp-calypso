export const now = (): number => {
	return window?.performance?.now?.() ?? Date.now();
};
