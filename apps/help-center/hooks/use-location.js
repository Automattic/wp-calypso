import { privateApis as routerPrivateApis } from '@wordpress/router';
import { getUnlock } from '../utils';

const unlock = getUnlock();

let useLocation = () => null;

// The routerPrivateApis may be unavailable.
if ( unlock && routerPrivateApis && unlock( routerPrivateApis ) ) {
	useLocation = unlock( routerPrivateApis ).useLocation;
}

export { useLocation };
