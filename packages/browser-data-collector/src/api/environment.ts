import '../global-types';

export const getCalypsoVersion = (): string => {
	return window?.COMMIT_SHA;
};

export const getEnvironment = (): string => {
	return window?.configData?.env_id;
};

export const getTarget = (): string => {
	return window?.BUILD_TARGET;
};
