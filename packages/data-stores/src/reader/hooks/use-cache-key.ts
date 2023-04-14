import useIsLoggedIn from './use-is-logged-in';

const useCacheKey = ( key: string[] ) => {
	const { id, isLoggedIn } = useIsLoggedIn();

	return [ ...key, isLoggedIn ? 'logged-in' : 'not-logged-in', id ? id : '' ];
};

export default useCacheKey;
