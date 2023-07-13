// change version to invalidate all cache keys
export const version = 'v1';

const buildCacheKey = ( key: string[], isLoggedIn: boolean, userId?: number ) => {
	return [ ...key, version, isLoggedIn ? 'logged-in' : 'not-logged-in', userId ? userId : '' ];
};

export default buildCacheKey;
