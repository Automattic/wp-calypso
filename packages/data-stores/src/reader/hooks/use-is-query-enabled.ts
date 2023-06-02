import { getSubkey } from '../helpers';
import { useIsLoggedIn } from '.';

const useIsQueryEnabled = () => {
	const { isLoggedIn } = useIsLoggedIn();
	if ( isLoggedIn || getSubkey() ) {
		return true;
	}

	return false;
};

export default useIsQueryEnabled;
