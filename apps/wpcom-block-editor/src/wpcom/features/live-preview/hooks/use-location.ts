import { privateApis as routerPrivateApis } from '@wordpress/router';
import { getUnlock } from '../utils';

const unlock = getUnlock();

let useLocation = () => null;
if ( unlock && unlock( routerPrivateApis ) ) {
	useLocation = unlock( routerPrivateApis ).useLocation;
}

export default useLocation;
