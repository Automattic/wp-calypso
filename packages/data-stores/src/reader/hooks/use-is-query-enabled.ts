import { getSubkey } from '../helpers';
import { useIsLoggedIn } from '.';

const useIsQueryEnabled = () => {
	const loggedIn = useIsLoggedIn();
	if ( loggedIn || getSubkey() ) {
		return true;
	}

	return false;
};

export default useIsQueryEnabled;
