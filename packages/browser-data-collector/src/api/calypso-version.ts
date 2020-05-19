export const getCalypsoVersion = (): string => {
	return window?.COMMIT_SHA;
};
