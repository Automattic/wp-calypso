import useIsLoggedIn from './use-is-logged-in';

// change version to invalidate all cache keys
const version = 'v1';

const useCacheKey = ( key: string[] ) => {
	const { id, isLoggedIn } = useIsLoggedIn();

	return [ ...key, version, isLoggedIn ? 'logged-in' : 'not-logged-in', id ? id : '' ];
};

export default useCacheKey;
