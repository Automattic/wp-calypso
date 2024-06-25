import type { Navigator } from '../types';

export const getMemory = (): number => {
	const navigator = window?.navigator;
	return ( navigator as Navigator )?.deviceMemory;
};
