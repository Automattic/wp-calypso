import * as router from '@wordpress/router';
import { getUnlock } from '../utils';

const unlock = getUnlock();

const routerPrivateApis = router?.privateApis;

let useLocation: () => Location | null = () => null;

// The routerPrivateApis may be unavailable.
if ( unlock && routerPrivateApis && unlock( routerPrivateApis ) ) {
	useLocation = unlock( routerPrivateApis ).useLocation;
}

export default useLocation;
