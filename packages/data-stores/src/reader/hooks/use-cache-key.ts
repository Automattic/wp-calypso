import buildQueryKey from '../helpers/query-key';
import useIsLoggedIn from './use-is-logged-in';

const useCacheKey = ( keyPrefix: ( number | string )[] ) => {
	const { id, isLoggedIn } = useIsLoggedIn();
	return buildQueryKey( keyPrefix, isLoggedIn, id );
};

export default useCacheKey;
