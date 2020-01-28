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

const router = () => {
	page( '/', setupSidebar, jetpackCloud, makeLayout, clientRender );

	page( '/backups', setupSidebar, jetpackBackups, makeLayout, clientRender );

	page( '/scan', setupSidebar, jetpackScan, makeLayout, clientRender );
};

export default router;
