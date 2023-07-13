import buildCacheKey from '../helpers/cache-key';
import useIsLoggedIn from './use-is-logged-in';

const useCacheKey = ( key: string[] ) => {
	const { id, isLoggedIn } = useIsLoggedIn();
	return buildCacheKey( key, isLoggedIn, id );
};

export default useCacheKey;
