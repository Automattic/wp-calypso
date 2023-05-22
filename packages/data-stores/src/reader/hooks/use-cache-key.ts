import useIsLoggedIn from './use-is-logged-in';

// change version to invalidate all cache keys
const version = 'v1';

const useCacheKey = ( key: string[], blog_id?: string | number ) => {
	const { id, isLoggedIn } = useIsLoggedIn();

	return [
		...key,
		version,
		isLoggedIn ? 'logged-in' : 'not-logged-in',
		id ? id : '',
		blog_id ?? '',
	];
};

export default useCacheKey;
