export const getMemory = (): number => {
	const navigator = window?.navigator;
	return navigator?.deviceMemory;
};
