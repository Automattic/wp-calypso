/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import {
	clientRender,
	jetpackCloud,
	jetpackBackups,
	jetpackScan,
	makeLayout,
	setupSidebar,
} from './controller';

const router = ( baseRoute = '' ) => {
	page( baseRoute + '/', setupSidebar, jetpackCloud, makeLayout, clientRender );

	page( baseRoute + '/backups', setupSidebar, jetpackBackups, makeLayout, clientRender );

	page( baseRoute + '/scan', setupSidebar, jetpackScan, makeLayout, clientRender );
};

export default router;
