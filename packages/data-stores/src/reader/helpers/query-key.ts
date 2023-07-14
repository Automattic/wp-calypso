// change version to invalidate all cache keys
export const version = 'v1';

const buildQueryKey = ( keyPrefix: string[], isLoggedIn: boolean, userId?: number ) => {
	return [
		...keyPrefix,
		version,
		isLoggedIn ? 'logged-in' : 'not-logged-in',
		userId ? userId : '',
	];
};

export default buildQueryKey;
