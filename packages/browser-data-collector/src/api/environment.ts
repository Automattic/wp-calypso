import type { Window } from '../types';

export const getCalypsoVersion = (): string => {
	return ( window as Window )?.COMMIT_SHA;
};

export const getEnvironment = (): string => {
	return ( window as Window )?.configData?.env_id;
};

export const getTarget = (): string => {
	return ( window as Window )?.BUILD_TARGET;
};
